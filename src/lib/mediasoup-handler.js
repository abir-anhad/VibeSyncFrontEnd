// ==========================================================================================
// file: src/lib/mediasoup-handler.js
// ==========================================================================================
import { Device } from 'mediasoup-client';
import { io } from 'socket.io-client';
import { useRoomStore } from '../hooks/useRoomStore';

const serverUrl = import.meta.env.VITE_SERVER_URL;

export class MediasoupHandler {
  constructor({ userName, roomName }) {
    this.userName = userName; this.roomName = roomName; this.socket = null;
    this.device = null; this.sendTransport = null; this.consumers = new Map();
    this.producers = new Map(); this.localMediaStream = null;
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

  async join() { this.socket = io(serverUrl); this.setupSocketEvents(); }
  close() { this.socket?.disconnect(); this.localMediaStream?.getTracks().forEach(t => t.stop()); this.sendTransport?.close(); }

  toggleMute() {
    const audioProducer = this.producers.get('audio'); if (!audioProducer) return;
    const { isMuted, setMuted } = useRoomStore.getState();
    if (!isMuted) { audioProducer.pause(); setMuted(true); } 
    else { audioProducer.resume(); setMuted(false); }
  }

  toggleCamera() {
    const videoProducer = this.producers.get('video'); if (!videoProducer) return;
    const { isCameraOff, setCameraOff } = useRoomStore.getState();
    if (!isCameraOff) { videoProducer.pause(); setCameraOff(true); } 
    else { videoProducer.resume(); setCameraOff(false); }
  }

  setupSocketEvents() {
    const { setConnectionStatus, addParticipant, removeParticipant } = useRoomStore.getState();
    this.socket.on('connect', async () => {
      try {
        const data = await this.request('joinRoom', { userName: this.userName, roomName: this.roomName });
        this.device = new Device();
        await this.device.load({ routerRtpCapabilities: data.routerRtpCapabilities });
        addParticipant({ id: this.socket.id, name: this.userName, isLocal: true, audioStream: null, videoStream: null });
        await this.initTransports();
        await this.startMedia();
        for (const producerData of data.producersToConsume) { await this.consume(producerData); }
        setConnectionStatus('connected');
      } catch (error) { console.error("Connection failed:", error); setConnectionStatus('disconnected'); this.close(); }
    });
    this.socket.on('disconnect', () => setConnectionStatus('disconnected'));
    this.socket.on('new-producer', (data) => this.consume(data));
    this.socket.on('client-disconnected', ({ socketId }) => removeParticipant(socketId));
    this.socket.on('consumer-closed', ({ consumerId }) => {
      const consumer = this.consumers.get(consumerId); if (!consumer) return;
      consumer.close(); this.consumers.delete(consumerId);
      removeParticipant(consumer.appData.socketId);
    });
  }

  async initTransports() {
    const sendTransportParams = await this.request('createTransport', { type: 'producer' });
    this.sendTransport = this.device.createSendTransport(sendTransportParams);
    this.sendTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
      try { await this.request('connectTransport', { transportId: this.sendTransport.id, dtlsParameters }); cb(); } catch (e) { eb(e); }
    });
    this.sendTransport.on('produce', async (params, cb, eb) => {
      try { const { id } = await this.request('produce', { kind: params.kind, rtpParameters: params.rtpParameters, transportId: this.sendTransport.id }); cb({ id }); } catch (e) { eb(e); }
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
      }
      if (videoTrack) {
        const videoProducer = await this.sendTransport.produce({ track: videoTrack });
        this.producers.set('video', videoProducer);
      }

      useRoomStore.getState().updateParticipantStreams(this.socket.id, {
          audioStream: new MediaStream([audioTrack]),
          videoStream: new MediaStream([videoTrack])
      });
    } catch (error) { console.error(error); throw new Error('Camera or Microphone access denied.'); }
  }

  async consume({ producerId, userName, socketId }) {
    if (!this.device) return;
    const { addParticipant, updateParticipantStreams, participants } = useRoomStore.getState();
    
    const recvTransportParams = await this.request('createTransport', { type: 'consumer' });
    const transport = this.device.createRecvTransport(recvTransportParams);
    
    transport.on('connect', async ({ dtlsParameters }, cb, eb) => {
      try { await this.request('connectTransport', { transportId: transport.id, dtlsParameters }); cb(); } catch(e) { eb(e); }
    });

    const consumerParams = await this.request('consume', { rtpCapabilities: this.device.rtpCapabilities, producerId, transportId: transport.id });
    const consumer = await transport.consume({ ...consumerParams, appData: { socketId, producerId } });
    this.consumers.set(consumer.id, consumer);

    const stream = new MediaStream([consumer.track]);
    
    const existingParticipant = participants.find(p => p.id === socketId);

    if (!existingParticipant) {
        const participantData = { id: socketId, name: userName, isLocal: false };
        if (consumer.kind === 'audio') participantData.audioStream = stream;
        if (consumer.kind === 'video') participantData.videoStream = stream;
        addParticipant(participantData);
    } else {
        const streams = {};
        if (consumer.kind === 'audio') streams.audioStream = stream;
        if (consumer.kind === 'video') streams.videoStream = stream;
        updateParticipantStreams(socketId, streams);
    }

    this.request('resumeConsumer', { consumerId: consumer.id });
  }
}
