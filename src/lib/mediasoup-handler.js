// // // // // ==========================================================================================
// // // // // file: src/lib/mediasoup-handler.js
// Consult before touching this
// main engine of the entire system
// <- for biswajit da
// // // // // ==========================================================================================


import { Device } from 'mediasoup-client';
import { io } from 'socket.io-client';
import { useRoomStore } from '../hooks/useRoomStore';

const serverUrl = import.meta.env.VITE_SERVER_URL;

export class MediasoupHandler {
    constructor({ userName, roomName }) {
        this.userName = userName;
        this.roomName = roomName;
        this.socket = null;
        this.device = null;
        this.sendTransport = null;
        this.recvTransport = null;
        this.consumers = new Map();
        this.producers = new Map();
        this.localMediaStream = null;
    }

    request(event, data = {}) {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection');
            this.socket.emit(event, data);
            const successEvent = `${event}-success`;
            const errorEvent = `${event}-error`;
            const successListener = (res) => { cleanup(); resolve(res); };
            const errorListener = (err) => { cleanup(); reject(new Error(err.error || `Unknown error on event: ${event}`)); };
            this.socket.once(successEvent, successListener);
            this.socket.once(errorEvent, errorListener);
            const cleanup = () => { this.socket.off(successEvent, successListener); this.socket.off(errorEvent, errorListener); };
            setTimeout(() => { cleanup(); reject(new Error(`Request timed out: ${event}`)); }, 15000);
        });
    }

    async join() {
        this.socket = io(serverUrl);
        this.setupSocketEvents();
    }

    close() {
        this.socket?.disconnect();
        this.localMediaStream?.getTracks().forEach(t => t.stop());
        this.sendTransport?.close();
        this.recvTransport?.close();
    }

    toggleMute() {
        const audioProducer = this.producers.get('audio');
        if (!audioProducer) return;
        const { isMuted, setMuted } = useRoomStore.getState();
        if (!isMuted) {
            audioProducer.pause();
            setMuted(true);
        } else {
            audioProducer.resume();
            setMuted(false);
        }
    }
    
    toggleCamera() {
        const videoProducer = this.producers.get('video');
        if (!videoProducer) return;
        const { isCameraOff, setCameraOff } = useRoomStore.getState();
        if (!isCameraOff) {
            videoProducer.pause();
            setCameraOff(true);
        } else {
            videoProducer.resume();
            setCameraOff(false);
        }
    }

    setupSocketEvents() {
        const {
            setConnectionStatus,
            addParticipant,
            removeParticipant,
            updateParticipantMedia,
        } = useRoomStore.getState();

        this.socket.on('connect', async () => {
            try {
                const data = await this.request('joinRoom', { userName: this.userName, roomName: this.roomName });
                this.device = new Device();
                await this.device.load({ routerRtpCapabilities: data.routerRtpCapabilities });
                addParticipant({ id: this.socket.id, name: this.userName, isLocal: true });
                await this.initTransports();
                await this.startMedia();
                for (const producerData of data.producersToConsume) {
                    await this.consume(producerData);
                }
                setConnectionStatus('connected');
            } catch (error) {
                console.error("Critical error during connection setup:", error);
                setConnectionStatus('disconnected');
                this.close();
            }
        });
        
        this.socket.on('disconnect', () => setConnectionStatus('disconnected'));
        this.socket.on('new-producer', (data) => this.consume(data));
        this.socket.on('client-disconnected', ({ socketId }) => removeParticipant(socketId));
        
        this.socket.on('consumer-closed', ({ consumerId }) => {
            const consumer = this.consumers.get(consumerId);
            if (!consumer) return;
            const { socketId } = consumer.appData;
            consumer.close();
            this.consumers.delete(consumerId);
            updateParticipantMedia(socketId, consumer.kind, { stream: null, isPlaying: false, consumerId: null });
        });
    }

    async initTransports() {
        const sendTransportParams = await this.request('createTransport', { type: 'producer' });
        this.sendTransport = this.device.createSendTransport(sendTransportParams);
        this.sendTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
            try { await this.request('connectTransport', { transportId: this.sendTransport.id, dtlsParameters }); cb(); } catch (e) { eb(e); }
        });
        this.sendTransport.on('produce', async (params, cb, eb) => {
            try {
                const { id } = await this.request('produce', { kind: params.kind, rtpParameters: params.rtpParameters, transportId: this.sendTransport.id });
                cb({ id });
            } catch (e) { eb(e); }
        });

        const recvTransportParams = await this.request('createTransport', { type: 'consumer' });
        this.recvTransport = this.device.createRecvTransport(recvTransportParams);
        this.recvTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
            try { await this.request('connectTransport', { transportId: this.recvTransport.id, dtlsParameters }); cb(); } catch (e) { eb(e); }
        });
    }

    async startMedia() {
        if (!this.device || !this.sendTransport) return;
        try {
            this.localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            const audioTrack = this.localMediaStream.getAudioTracks()[0];
            const videoTrack = this.localMediaStream.getVideoTracks()[0];

            if (audioTrack) {
                const audioProducer = await this.sendTransport.produce({ track: audioTrack });
                this.producers.set('audio', audioProducer);
                useRoomStore.getState().updateParticipantMedia(this.socket.id, 'audio', { stream: new MediaStream([audioTrack]), isPlaying: true });
            }
            if (videoTrack) {
                const videoProducer = await this.sendTransport.produce({ track: videoTrack });
                this.producers.set('video', videoProducer);
                useRoomStore.getState().updateParticipantMedia(this.socket.id, 'video', { stream: new MediaStream([videoTrack]), isPlaying: true });
            }
        } catch (error) {
            console.error(error);
            throw new Error('Camera or Microphone access denied.');
        }
    }


    async consume({ producerId, userName, socketId }) {
        if (!this.device || !this.recvTransport) return;
        const { addParticipant, updateParticipantMedia, participants } = useRoomStore.getState();

        try {
            const consumerParams = await this.request('consume', { rtpCapabilities: this.device.rtpCapabilities, producerId, transportId: this.recvTransport.id });
            const consumer = await this.recvTransport.consume({ ...consumerParams, appData: { socketId, producerId } });

            await this.request('resumeConsumer', { consumerId: consumer.id });

            this.consumers.set(consumer.id, consumer);

            if (!participants.some(p => p.id === socketId)) {
                addParticipant({ id: socketId, name: userName, isLocal: false });
            }
            
            updateParticipantMedia(socketId, consumer.kind, {
                stream: new MediaStream([consumer.track]),
                consumerId: consumer.id,
                isPlaying: true
            });
        } catch(error) {
            console.error(`Failed to consume producer ${producerId} for user ${userName}.`, error);
        }
    }
}