// // // // // ==========================================================================================
// // // // // file: src/lib/mediasoup-handler.js
// // // // // ==========================================================================================
// // // // import { Device } from 'mediasoup-client';
// // // // import { io } from 'socket.io-client';
// // // // import { useRoomStore } from '../hooks/useRoomStore';

// // // // const serverUrl = import.meta.env.VITE_SERVER_URL;

// // // // export class MediasoupHandler {
// // // //   constructor({ userName, roomName }) {
// // // //     this.userName = userName; this.roomName = roomName; this.socket = null;
// // // //     this.device = null; this.sendTransport = null; this.consumers = new Map();
// // // //     this.producers = new Map(); this.localMediaStream = null;
// // // //   }

// // // //   request(event, data = {}) {
// // // //     return new Promise((resolve, reject) => {
// // // //       if (!this.socket) return reject('No socket connection');
// // // //       this.socket.emit(event, data);
// // // //       const successEvent = `${event}-success`;
// // // //       const errorEvent = `${event}-error`;
// // // //       const successListener = (res) => { cleanup(); resolve(res); };
// // // //       const errorListener = (err) => { cleanup(); reject(new Error(err.error || `Unknown error on event: ${event}`)); };
// // // //       this.socket.once(successEvent, successListener);
// // // //       this.socket.once(errorEvent, errorListener);
// // // //       const cleanup = () => { this.socket.off(successEvent, successListener); this.socket.off(errorEvent, errorListener); };
// // // //       setTimeout(() => { cleanup(); reject(new Error(`Request timed out: ${event}`)); }, 15000);
// // // //     });
// // // //   }

// // // //   async join() { this.socket = io(serverUrl); this.setupSocketEvents(); }
// // // //   close() { this.socket?.disconnect(); this.localMediaStream?.getTracks().forEach(t => t.stop()); this.sendTransport?.close(); }

// // // //   toggleMute() {
// // // //     const audioProducer = this.producers.get('audio'); if (!audioProducer) return;
// // // //     const { isMuted, setMuted } = useRoomStore.getState();
// // // //     if (!isMuted) { audioProducer.pause(); setMuted(true); } 
// // // //     else { audioProducer.resume(); setMuted(false); }
// // // //   }

// // // //   toggleCamera() {
// // // //     const videoProducer = this.producers.get('video'); if (!videoProducer) return;
// // // //     const { isCameraOff, setCameraOff } = useRoomStore.getState();
// // // //     if (!isCameraOff) { videoProducer.pause(); setCameraOff(true); } 
// // // //     else { videoProducer.resume(); setCameraOff(false); }
// // // //   }

// // // //   setupSocketEvents() {
// // // //     const { setConnectionStatus, addParticipant, removeParticipant } = useRoomStore.getState();
// // // //     this.socket.on('connect', async () => {
// // // //       try {
// // // //         const data = await this.request('joinRoom', { userName: this.userName, roomName: this.roomName });
// // // //         this.device = new Device();
// // // //         await this.device.load({ routerRtpCapabilities: data.routerRtpCapabilities });
// // // //         addParticipant({ id: this.socket.id, name: this.userName, isLocal: true, audioStream: null, videoStream: null });
// // // //         await this.initTransports();
// // // //         await this.startMedia();
// // // //         for (const producerData of data.producersToConsume) { await this.consume(producerData); }
// // // //         setConnectionStatus('connected');
// // // //       } catch (error) { console.error("Connection failed:", error); setConnectionStatus('disconnected'); this.close(); }
// // // //     });
// // // //     this.socket.on('disconnect', () => setConnectionStatus('disconnected'));
// // // //     this.socket.on('new-producer', (data) => this.consume(data));
// // // //     this.socket.on('client-disconnected', ({ socketId }) => removeParticipant(socketId));
// // // //     this.socket.on('consumer-closed', ({ consumerId }) => {
// // // //       const consumer = this.consumers.get(consumerId); if (!consumer) return;
// // // //       consumer.close(); this.consumers.delete(consumerId);
// // // //       removeParticipant(consumer.appData.socketId);
// // // //     });
// // // //   }

// // // //   async initTransports() {
// // // //     const sendTransportParams = await this.request('createTransport', { type: 'producer' });
// // // //     this.sendTransport = this.device.createSendTransport(sendTransportParams);
// // // //     this.sendTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
// // // //       try { await this.request('connectTransport', { transportId: this.sendTransport.id, dtlsParameters }); cb(); } catch (e) { eb(e); }
// // // //     });
// // // //     this.sendTransport.on('produce', async (params, cb, eb) => {
// // // //       try { const { id } = await this.request('produce', { kind: params.kind, rtpParameters: params.rtpParameters, transportId: this.sendTransport.id }); cb({ id }); } catch (e) { eb(e); }
// // // //     });
// // // //   }

// // // //   async startMedia() {
// // // //     if (!this.device || !this.sendTransport) return;
// // // //     try {
// // // //       this.localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
// // // //       const audioTrack = this.localMediaStream.getAudioTracks()[0];
// // // //       const videoTrack = this.localMediaStream.getVideoTracks()[0];

// // // //       if (audioTrack) {
// // // //         const audioProducer = await this.sendTransport.produce({ track: audioTrack });
// // // //         this.producers.set('audio', audioProducer);
// // // //       }
// // // //       if (videoTrack) {
// // // //         const videoProducer = await this.sendTransport.produce({ track: videoTrack });
// // // //         this.producers.set('video', videoProducer);
// // // //       }

// // // //       useRoomStore.getState().updateParticipantStreams(this.socket.id, {
// // // //           audioStream: new MediaStream([audioTrack]),
// // // //           videoStream: new MediaStream([videoTrack])
// // // //       });
// // // //     } catch (error) { console.error(error); throw new Error('Camera or Microphone access denied.'); }
// // // //   }

// // // //   async consume({ producerId, userName, socketId }) {
// // // //     if (!this.device) return;
// // // //     const { addParticipant, updateParticipantStreams, participants } = useRoomStore.getState();

// // // //     const recvTransportParams = await this.request('createTransport', { type: 'consumer' });
// // // //     const transport = this.device.createRecvTransport(recvTransportParams);

// // // //     transport.on('connect', async ({ dtlsParameters }, cb, eb) => {
// // // //       try { await this.request('connectTransport', { transportId: transport.id, dtlsParameters }); cb(); } catch(e) { eb(e); }
// // // //     });

// // // //     const consumerParams = await this.request('consume', { rtpCapabilities: this.device.rtpCapabilities, producerId, transportId: transport.id });
// // // //     const consumer = await transport.consume({ ...consumerParams, appData: { socketId, producerId } });
// // // //     this.consumers.set(consumer.id, consumer);

// // // //     const stream = new MediaStream([consumer.track]);

// // // //     const existingParticipant = participants.find(p => p.id === socketId);

// // // //     if (!existingParticipant) {
// // // //         const participantData = { id: socketId, name: userName, isLocal: false };
// // // //         if (consumer.kind === 'audio') participantData.audioStream = stream;
// // // //         if (consumer.kind === 'video') participantData.videoStream = stream;
// // // //         addParticipant(participantData);
// // // //     } else {
// // // //         const streams = {};
// // // //         if (consumer.kind === 'audio') streams.audioStream = stream;
// // // //         if (consumer.kind === 'video') streams.videoStream = stream;
// // // //         updateParticipantStreams(socketId, streams);
// // // //     }

// // // //     this.request('resumeConsumer', { consumerId: consumer.id });
// // // //   }
// // // // }


// // // // ==========================================================================================
// // // // file: src/lib/mediasoup-handler.js
// // // // Rectified to use a single, reusable receive transport
// // // // ==========================================================================================
// // // import {
// // //   Device
// // // } from 'mediasoup-client';
// // // import {
// // //   io
// // // } from 'socket.io-client';
// // // import {
// // //   useRoomStore
// // // } from '../hooks/useRoomStore';

// // // const serverUrl =
// // //   import.meta.env.VITE_SERVER_URL;

// // // export class MediasoupHandler {
// // //   constructor({
// // //     userName,
// // //     roomName
// // //   }) {
// // //     this.userName = userName;
// // //     this.roomName = roomName;
// // //     this.socket = null;
// // //     this.device = null;
// // //     this.sendTransport = null;
// // //     this.recvTransport = null; // ADDED: Initialize recvTransport property
// // //     this.consumers = new Map();
// // //     this.producers = new Map();
// // //     this.localMediaStream = null;
// // //   }

// // //   request(event, data = {}) {
// // //     return new Promise((resolve, reject) => {
// // //       if (!this.socket) return reject('No socket connection');
// // //       this.socket.emit(event, data);
// // //       const successEvent = `${event}-success`;
// // //       const errorEvent = `${event}-error`;
// // //       const successListener = (res) => {
// // //         cleanup();
// // //         resolve(res);
// // //       };
// // //       const errorListener = (err) => {
// // //         cleanup();
// // //         reject(new Error(err.error || `Unknown error on event: ${event}`));
// // //       };
// // //       this.socket.once(successEvent, successListener);
// // //       this.socket.once(errorEvent, errorListener);
// // //       const cleanup = () => {
// // //         this.socket.off(successEvent, successListener);
// // //         this.socket.off(errorEvent, errorListener);
// // //       };
// // //       setTimeout(() => {
// // //         cleanup();
// // //         reject(new Error(`Request timed out: ${event}`));
// // //       }, 15000);
// // //     });
// // //   }

// // //   async join() {
// // //     this.socket = io(serverUrl);
// // //     this.setupSocketEvents();
// // //   }
// // //   close() {
// // //     this.socket?.disconnect();
// // //     this.localMediaStream?.getTracks().forEach(t => t.stop());
// // //     this.sendTransport?.close();
// // //     this.recvTransport?.close();
// // //   } // CHANGED: Also close recvTransport

// // //   toggleMute() {
// // //     const audioProducer = this.producers.get('audio');
// // //     if (!audioProducer) return;
// // //     const {
// // //       isMuted,
// // //       setMuted
// // //     } = useRoomStore.getState();
// // //     if (!isMuted) {
// // //       audioProducer.pause();
// // //       setMuted(true);
// // //     } else {
// // //       audioProducer.resume();
// // //       setMuted(false);
// // //     }
// // //   }

// // //   toggleCamera() {
// // //     const videoProducer = this.producers.get('video');
// // //     if (!videoProducer) return;
// // //     const {
// // //       isCameraOff,
// // //       setCameraOff
// // //     } = useRoomStore.getState();
// // //     if (!isCameraOff) {
// // //       videoProducer.pause();
// // //       setCameraOff(true);
// // //     } else {
// // //       videoProducer.resume();
// // //       setCameraOff(false);
// // //     }
// // //   }

// // //   setupSocketEvents() {
// // //     const {
// // //       setConnectionStatus,
// // //       addParticipant,
// // //       removeParticipant
// // //     } = useRoomStore.getState();
// // //     this.socket.on('connect', async () => {
// // //       try {
// // //         const data = await this.request('joinRoom', {
// // //           userName: this.userName,
// // //           roomName: this.roomName
// // //         });
// // //         this.device = new Device();
// // //         await this.device.load({
// // //           routerRtpCapabilities: data.routerRtpCapabilities
// // //         });
// // //         addParticipant({
// // //           id: this.socket.id,
// // //           name: this.userName,
// // //           isLocal: true,
// // //           audioStream: null,
// // //           videoStream: null
// // //         });
// // //         await this.initTransports();
// // //         await this.startMedia();
// // //         for (const producerData of data.producersToConsume) {
// // //           await this.consume(producerData);
// // //         }
// // //         setConnectionStatus('connected');
// // //       } catch (error) {
// // //         console.error("Connection failed:", error);
// // //         setConnectionStatus('disconnected');
// // //         this.close();
// // //       }
// // //     });
// // //     this.socket.on('disconnect', () => setConnectionStatus('disconnected'));
// // //     this.socket.on('new-producer', (data) => this.consume(data));
// // //     this.socket.on('client-disconnected', ({
// // //       socketId
// // //     }) => removeParticipant(socketId));
// // //     this.socket.on('consumer-closed', ({
// // //       consumerId
// // //     }) => {
// // //       const consumer = this.consumers.get(consumerId);
// // //       if (!consumer) return;
// // //       consumer.close();
// // //       this.consumers.delete(consumerId);
      
// // //       // if they only closed one stream (e.g., video but not audio). 
// // //       removeParticipant(consumer.appData.socketId);
// // //     });
// // //   }

// // //   async initTransports() {
// // //     // Create Send Transport
// // //     const sendTransportParams = await this.request('createTransport', {
// // //       type: 'producer'
// // //     });
// // //     this.sendTransport = this.device.createSendTransport(sendTransportParams);
// // //     this.sendTransport.on('connect', async ({
// // //       dtlsParameters
// // //     }, cb, eb) => {
// // //       try {
// // //         await this.request('connectTransport', {
// // //           transportId: this.sendTransport.id,
// // //           dtlsParameters
// // //         });
// // //         cb();
// // //       } catch (e) {
// // //         eb(e);
// // //       }
// // //     });
// // //     this.sendTransport.on('produce', async (params, cb, eb) => {
// // //       try {
// // //         const {
// // //           id
// // //         } = await this.request('produce', {
// // //           kind: params.kind,
// // //           rtpParameters: params.rtpParameters,
// // //           transportId: this.sendTransport.id
// // //         });
// // //         cb({
// // //           id
// // //         });
// // //       } catch (e) {
// // //         eb(e);
// // //       }
// // //     });

// // //     // --- ADDED: Create a single Receive Transport ---
// // //     const recvTransportParams = await this.request('createTransport', {
// // //       type: 'consumer'
// // //     });
// // //     this.recvTransport = this.device.createRecvTransport(recvTransportParams);
// // //     this.recvTransport.on('connect', async ({
// // //       dtlsParameters
// // //     }, cb, eb) => {
// // //       try {
// // //         await this.request('connectTransport', {
// // //           transportId: this.recvTransport.id,
// // //           dtlsParameters
// // //         });
// // //         cb();
// // //       } catch (e) {
// // //         eb(e);
// // //       }
// // //     });
// // //   }

// // //   async startMedia() {
// // //     if (!this.device || !this.sendTransport) return;
// // //     try {
// // //       this.localMediaStream = await navigator.mediaDevices.getUserMedia({
// // //         audio: true,
// // //         video: true
// // //       });
// // //       const audioTrack = this.localMediaStream.getAudioTracks()[0];
// // //       const videoTrack = this.localMediaStream.getVideoTracks()[0];

// // //       if (audioTrack) {
// // //         const audioProducer = await this.sendTransport.produce({
// // //           track: audioTrack
// // //         });
// // //         this.producers.set('audio', audioProducer);
// // //       }
// // //       if (videoTrack) {
// // //         const videoProducer = await this.sendTransport.produce({
// // //           track: videoTrack
// // //         });
// // //         this.producers.set('video', videoProducer);
// // //       }

// // //       useRoomStore.getState().updateParticipantStreams(this.socket.id, {
// // //         audioStream: new MediaStream([audioTrack]),
// // //         videoStream: new MediaStream([videoTrack])
// // //       });
// // //     } catch (error) {
// // //       console.error(error);
// // //       throw new Error('Camera or Microphone access denied.');
// // //     }
// // //   }

// // //   async consume({
// // //     producerId,
// // //     userName,
// // //     socketId
// // //   }) {
// // //     // CHANGED: Check for the single recvTransport instead of creating a new one
// // //     if (!this.device || !this.recvTransport) return;
// // //     const {
// // //       addParticipant,
// // //       updateParticipantStreams,
// // //       participants
// // //     } = useRoomStore.getState();

// // //     // REMOVED: The logic for creating a new transport on every consume call is now gone.

// // //     const consumerParams = await this.request('consume', {
// // //       rtpCapabilities: this.device.rtpCapabilities,
// // //       producerId,
// // //       transportId: this.recvTransport.id // CHANGED: Use the single transport's ID
// // //     });

// // //     // CHANGED: Consume using the single, existing recvTransport
// // //     const consumer = await this.recvTransport.consume({
// // //       ...consumerParams,
// // //       appData: {
// // //         socketId,
// // //         producerId
// // //       }
// // //     });

// // //     this.consumers.set(consumer.id, consumer);

// // //     const stream = new MediaStream([consumer.track]);

// // //     const existingParticipant = participants.find(p => p.id === socketId);

// // //     if (!existingParticipant) {
// // //       const participantData = {
// // //         id: socketId,
// // //         name: userName,
// // //         isLocal: false
// // //       };
// // //       if (consumer.kind === 'audio') participantData.audioStream = stream;
// // //       if (consumer.kind ===
// // //         'video') participantData.videoStream = stream;
// // //       addParticipant(participantData);
// // //     } else {
// // //       const streams = {};
// // //       if (consumer.kind === 'audio') streams.audioStream = stream;
// // //       if (consumer.kind === 'video') streams.videoStream = stream;
// // //       updateParticipantStreams(socketId, streams);
// // //     }

// // //     this.request('resumeConsumer', {
// // //       consumerId: consumer.id
// // //     });
// // //   }
// // // }


// // // ==========================================================================================
// // // src/lib/mediasoup-handler.js
// // // - Fixes the consumer-closed bug to prevent removing the whole participant.
// // // - Adds detailed logging for track and connection lifecycle events.
// // // - Uses a single, reusable receive transport for efficiency.
// // // ==========================================================================================
// // import { Device } from 'mediasoup-client';
// // import { io } from 'socket.io-client';
// // import { useRoomStore } from '../hooks/useRoomStore';

// // const serverUrl = import.meta.env.VITE_SERVER_URL;

// // export class MediasoupHandler {
// //   constructor({ userName, roomName }) {
// //     this.userName = userName;
// //     this.roomName = roomName;
// //     this.socket = null;
// //     this.device = null;
// //     this.sendTransport = null;
// //     this.recvTransport = null;
// //     this.consumers = new Map();
// //     this.producers = new Map();
// //     this.localMediaStream = null;
// //   }

// //   request(event, data = {}) {
// //     return new Promise((resolve, reject) => {
// //       if (!this.socket) return reject('No socket connection');
// //       this.socket.emit(event, data);
// //       const successEvent = `${event}-success`;
// //       const errorEvent = `${event}-error`;
// //       const successListener = (res) => {
// //         cleanup();
// //         resolve(res);
// //       };
// //       const errorListener = (err) => {
// //         cleanup();
// //         reject(new Error(err.error || `Unknown error on event: ${event}`));
// //       };
// //       this.socket.once(successEvent, successListener);
// //       this.socket.once(errorEvent, errorListener);
// //       const cleanup = () => {
// //         this.socket.off(successEvent, successListener);
// //         this.socket.off(errorEvent, errorListener);
// //       };
// //       setTimeout(() => {
// //         cleanup();
// //         reject(new Error(`Request timed out: ${event}`));
// //       }, 15000);
// //     });
// //   }

// //   async join() {
// //     this.socket = io(serverUrl);
// //     this.setupSocketEvents();
// //   }

// //   close() {
// //     console.log('[VibeSync-Debug] Closing Mediasoup handler.');
// //     this.socket?.disconnect();
// //     this.localMediaStream?.getTracks().forEach(t => t.stop());
// //     this.sendTransport?.close();
// //     this.recvTransport?.close();
// //   }

// //   toggleMute() {
// //     const audioProducer = this.producers.get('audio');
// //     if (!audioProducer) return;
// //     const { isMuted, setMuted } = useRoomStore.getState();
// //     if (!isMuted) {
// //       console.log('[VibeSync-Debug] Muting audio.');
// //       audioProducer.pause();
// //       setMuted(true);
// //     } else {
// //       console.log('[VibeSync-Debug] Unmuting audio.');
// //       audioProducer.resume();
// //       setMuted(false);
// //     }
// //   }

// //   toggleCamera() {
// //     const videoProducer = this.producers.get('video');
// //     if (!videoProducer) return;
// //     const { isCameraOff, setCameraOff } = useRoomStore.getState();
// //     if (!isCameraOff) {
// //       console.log('[VibeSync-Debug] Turning camera off.');
// //       videoProducer.pause();
// //       setCameraOff(true);
// //     } else {
// //       console.log('[VibeSync-Debug] Turning camera on.');
// //       videoProducer.resume();
// //       setCameraOff(false);
// //     }
// //   }

// //   setupSocketEvents() {
// //     const {
// //       setConnectionStatus,
// //       addParticipant,
// //       removeParticipant,
// //       updateParticipantStreams // Get the update function from the store
// //     } = useRoomStore.getState();

// //     this.socket.on('connect', async () => {
// //       try {
// //         const data = await this.request('joinRoom', {
// //           userName: this.userName,
// //           roomName: this.roomName
// //         });
// //         this.device = new Device();
// //         await this.device.load({ routerRtpCapabilities: data.routerRtpCapabilities });
// //         addParticipant({ id: this.socket.id, name: this.userName, isLocal: true, audioStream: null, videoStream: null });
// //         await this.initTransports();
// //         await this.startMedia();
// //         for (const producerData of data.producersToConsume) {
// //           await this.consume(producerData);
// //         }
// //         setConnectionStatus('connected');
// //       } catch (error) {
// //         console.error("Connection failed:", error);
// //         setConnectionStatus('disconnected');
// //         this.close();
// //       }
// //     });

// //     this.socket.on('disconnect', () => setConnectionStatus('disconnected'));

// //     this.socket.on('new-producer', (data) => {
// //         console.log(`[VibeSync-Debug] Event: 'new-producer' received for user ${data.userName}.`);
// //         this.consume(data);
// //     });

// //     this.socket.on('client-disconnected', ({ socketId }) => {
// //       const participant = useRoomStore.getState().participants.find(p => p.id === socketId);
// //       console.log(`[VibeSync-Debug] Event: 'client-disconnected'. User: ${participant?.name || socketId} has left. Removing.`);
// //       removeParticipant(socketId);
// //     });

// //     this.socket.on('consumer-closed', ({ consumerId }) => {
// //       const consumer = this.consumers.get(consumerId);
// //       if (!consumer) return;

// //       const { socketId } = consumer.appData;
// //       const participant = useRoomStore.getState().participants.find(p => p.id === socketId);

// //       console.log(`[VibeSync-Debug] Event: 'consumer-closed'.`);
// //       console.log(`  > Track Kind: ${consumer.kind}`);
// //       console.log(`  > For Participant: ${participant?.name || 'Unknown'} (Socket ID: ${socketId})`);

// //       consumer.close();
// //       this.consumers.delete(consumerId);

// //       // THE FIX: Instead of removing the participant, just nullify the specific stream.
// //       const streamUpdate = {
// //         [consumer.kind + 'Stream']: null,
// //         // Also update the mute/camera off status in the store
// //         [consumer.kind === 'audio' ? 'isAudioMuted' : 'isVideoOff']: true
// //       };
// //       updateParticipantStreams(socketId, streamUpdate);
// //       console.log(`[VibeSync-Debug] Action: Disabled the '${consumer.kind}' track for ${participant?.name || 'Unknown'}.`);
// //     });
// //   }

// //   async initTransports() {
// //     // Create Send Transport
// //     const sendTransportParams = await this.request('createTransport', { type: 'producer' });
// //     this.sendTransport = this.device.createSendTransport(sendTransportParams);
// //     this.sendTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
// //       try {
// //         await this.request('connectTransport', { transportId: this.sendTransport.id, dtlsParameters });
// //         cb();
// //       } catch (e) { eb(e); }
// //     });
// //     this.sendTransport.on('produce', async (params, cb, eb) => {
// //       try {
// //         const { id } = await this.request('produce', {
// //           kind: params.kind,
// //           rtpParameters: params.rtpParameters,
// //           transportId: this.sendTransport.id
// //         });
// //         cb({ id });
// //       } catch (e) { eb(e); }
// //     });

// //     // Create a single Receive Transport
// //     const recvTransportParams = await this.request('createTransport', { type: 'consumer' });
// //     this.recvTransport = this.device.createRecvTransport(recvTransportParams);
// //     this.recvTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
// //       try {
// //         await this.request('connectTransport', { transportId: this.recvTransport.id, dtlsParameters });
// //         cb();
// //       } catch (e) { eb(e); }
// //     });
// //   }

// //   async startMedia() {
// //     if (!this.device || !this.sendTransport) return;
// //     try {
// //       this.localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
// //       const audioTrack = this.localMediaStream.getAudioTracks()[0];
// //       const videoTrack = this.localMediaStream.getVideoTracks()[0];

// //       if (audioTrack) {
// //         const audioProducer = await this.sendTransport.produce({ track: audioTrack });
// //         this.producers.set('audio', audioProducer);
// //       }
// //       if (videoTrack) {
// //         const videoProducer = await this.sendTransport.produce({ track: videoTrack });
// //         this.producers.set('video', videoProducer);
// //       }

// //       useRoomStore.getState().updateParticipantStreams(this.socket.id, {
// //         audioStream: new MediaStream([audioTrack]),
// //         videoStream: new MediaStream([videoTrack])
// //       });
// //     } catch (error) {
// //       console.error(error);
// //       throw new Error('Camera or Microphone access denied.');
// //     }
// //   }

// //   async consume({ producerId, userName, socketId }) {
// //     if (!this.device || !this.recvTransport) return;
// //     const { addParticipant, updateParticipantStreams, participants } = useRoomStore.getState();

// //     const consumerParams = await this.request('consume', {
// //       rtpCapabilities: this.device.rtpCapabilities,
// //       producerId,
// //       transportId: this.recvTransport.id
// //     });

// //     const consumer = await this.recvTransport.consume({
// //       ...consumerParams,
// //       appData: { socketId, producerId }
// //     });

// //     this.consumers.set(consumer.id, consumer);
// //     const stream = new MediaStream([consumer.track]);

// //     const existingParticipant = participants.find(p => p.id === socketId);
// //     if (!existingParticipant) {
// //       const participantData = { id: socketId, name: userName, isLocal: false };
// //       if (consumer.kind === 'audio') participantData.audioStream = stream;
// //       if (consumer.kind === 'video') participantData.videoStream = stream;
// //       addParticipant(participantData);
// //     } else {
// //       const streams = {};
// //       if (consumer.kind === 'audio') streams.audioStream = stream;
// //       if (consumer.kind === 'video') streams.videoStream = stream;
// //       updateParticipantStreams(socketId, streams);
// //     }

// //     this.request('resumeConsumer', { consumerId: consumer.id });
// //   }
// // }

// import {
//   Device
// } from 'mediasoup-client';
// import {
//   io
// } from 'socket.io-client';
// import {
//   useRoomStore
// } from '../hooks/useRoomStore';

// const serverUrl =
//   import.meta.env.VITE_SERVER_URL;

// export class MediasoupHandler {
//   constructor({
//       userName,
//       roomName
//   }) {
//       this.userName = userName;
//       this.roomName = roomName;
//       this.socket = null;
//       this.device = null;
//       this.sendTransport = null;
//       this.recvTransport = null;
//       this.consumers = new Map();
//       this.producers = new Map();
//       this.localMediaStream = null;
//   }

//   request(event, data = {}) {
//       return new Promise((resolve, reject) => {
//           if (!this.socket) return reject('No socket connection');
//           this.socket.emit(event, data);
//           const successEvent = `${event}-success`;
//           const errorEvent = `${event}-error`;
//           const successListener = (res) => {
//               cleanup();
//               resolve(res);
//           };
//           const errorListener = (err) => {
//               cleanup();
//               reject(new Error(err.error || `Unknown error on event: ${event}`));
//           };
//           this.socket.once(successEvent, successListener);
//           this.socket.once(errorEvent, errorListener);
//           const cleanup = () => {
//               this.socket.off(successEvent, successListener);
//               this.socket.off(errorEvent, errorListener);
//           };
//           setTimeout(() => {
//               cleanup();
//               reject(new Error(`Request timed out: ${event}`));
//           }, 15000);
//       });
//   }

//   async join() {
//       this.socket = io(serverUrl);
//       this.setupSocketEvents();
//   }

//   close() {
//       console.log('[VibeSync-Debug] Closing Mediasoup handler.');
//       this.socket?.disconnect();
//       this.localMediaStream?.getTracks().forEach(t => t.stop());
//       this.sendTransport?.close();
//       this.recvTransport?.close();
//   }

//   toggleMute() {
//       const audioProducer = this.producers.get('audio');
//       if (!audioProducer) return;
//       const {
//           isMuted,
//           setMuted
//       } = useRoomStore.getState();
//       if (!isMuted) {
//           console.log('[VibeSync-Debug] Muting audio.');
//           audioProducer.pause();
//           setMuted(true);
//       } else {
//           console.log('[VibeSync-Debug] Unmuting audio.');
//           audioProducer.resume();
//           setMuted(false);
//       }
//   }

//   toggleCamera() {
//       const videoProducer = this.producers.get('video');
//       if (!videoProducer) return;
//       const {
//           isCameraOff,
//           setCameraOff
//       } = useRoomStore.getState();
//       if (!isCameraOff) {
//           console.log('[VibeSync-Debug] Turning camera off.');
//           videoProducer.pause();
//           setCameraOff(true);
//       } else {
//           console.log('[VibeSync-Debug] Turning camera on.');
//           videoProducer.resume();
//           setCameraOff(false);
//       }
//   }

//   async resumeTrack(consumerId) {
//       if (!consumerId) return;
//       try {
//           await this.request('resumeConsumer', {
//               consumerId
//           });
//           const consumer = this.consumers.get(consumerId);
//           if (consumer) {
//               useRoomStore.getState().updateParticipantMedia(consumer.appData.socketId, consumer.kind, {
//                   isPlaying: true
//               });
//               console.log(`[VibeSync-Debug] Resumed and now playing track: ${consumer.kind} for consumer ${consumerId}`);
//           }
//       } catch (error) {
//           console.error(`Failed to resume consumer ${consumerId}`, error);
//       }
//   }

//   setupSocketEvents() {
//       const {
//           setConnectionStatus,
//           addParticipant,
//           removeParticipant,
//           updateParticipantMedia,
//       } = useRoomStore.getState();

//       this.socket.on('connect', async () => {
//           try {
//               const data = await this.request('joinRoom', {
//                   userName: this.userName,
//                   roomName: this.roomName
//               });
//               this.device = new Device();
//               await this.device.load({
//                   routerRtpCapabilities: data.routerRtpCapabilities
//               });
//               addParticipant({
//                   id: this.socket.id,
//                   name: this.userName,
//                   isLocal: true
//               });
//               await this.initTransports();
//               await this.startMedia();
//               for (const producerData of data.producersToConsume) {
//                   await this.consume(producerData);
//               }
//               setConnectionStatus('connected');
//           } catch (error) {
//               console.error("Connection failed:", error);
//               setConnectionStatus('disconnected');
//               this.close();
//           }
//       });

//       this.socket.on('disconnect', () => setConnectionStatus('disconnected'));

//       this.socket.on('new-producer', (data) => {
//           console.log(`[VibeSync-Debug] Event: 'new-producer' received for user ${data.userName}.`);
//           this.consume(data);
//       });

//       this.socket.on('client-disconnected', ({
//           socketId
//       }) => {
//           const participant = useRoomStore.getState().participants.find(p => p.id === socketId);
//           console.log(`[VibeSync-Debug] Event: 'client-disconnected'. User: ${participant?.name || socketId} has left. Removing.`);
//           removeParticipant(socketId);
//       });

//       this.socket.on('consumer-closed', ({
//           consumerId
//       }) => {
//           const consumer = this.consumers.get(consumerId);
//           if (!consumer) return;

//           const {
//               socketId
//           } = consumer.appData;
//           const participant = useRoomStore.getState().participants.find(p => p.id === socketId);

//           console.log(`[VibeSync-Debug] Event: 'consumer-closed'.`);
//           console.log(`  > Track Kind: ${consumer.kind}`);
//           console.log(`  > For Participant: ${participant?.name || 'Unknown'} (Socket ID: ${socketId})`);

//           consumer.close();
//           this.consumers.delete(consumerId);

//           updateParticipantMedia(socketId, consumer.kind, {
//               stream: null,
//               isPlaying: false,
//               consumerId: null
//           });
//           console.log(`[VibeSync-Debug] Action: Disabled the '${consumer.kind}' track for ${participant?.name || 'Unknown'}.`);
//       });
//   }

//   async initTransports() {
//       const sendTransportParams = await this.request('createTransport', {
//           type: 'producer'
//       });
//       this.sendTransport = this.device.createSendTransport(sendTransportParams);
//       this.sendTransport.on('connect', async ({
//           dtlsParameters
//       }, cb, eb) => {
//           try {
//               await this.request('connectTransport', {
//                   transportId: this.sendTransport.id,
//                   dtlsParameters
//               });
//               cb();
//           } catch (e) {
//               eb(e);
//           }
//       });
//       this.sendTransport.on('produce', async (params, cb, eb) => {
//           try {
//               const {
//                   id
//               } = await this.request('produce', {
//                   kind: params.kind,
//                   rtpParameters: params.rtpParameters,
//                   transportId: this.sendTransport.id
//               });
//               cb({
//                   id
//               });
//           } catch (e) {
//               eb(e);
//           }
//       });

//       const recvTransportParams = await this.request('createTransport', {
//           type: 'consumer'
//       });
//       this.recvTransport = this.device.createRecvTransport(recvTransportParams);
//       this.recvTransport.on('connect', async ({
//           dtlsParameters
//       }, cb, eb) => {
//           try {
//               await this.request('connectTransport', {
//                   transportId: this.recvTransport.id,
//                   dtlsParameters
//               });
//               cb();
//           } catch (e) {
//               eb(e);
//           }
//       });
//   }

//   async startMedia() {
//       if (!this.device || !this.sendTransport) return;
//       try {
//           this.localMediaStream = await navigator.mediaDevices.getUserMedia({
//               audio: true,
//               video: true
//           });
//           const audioTrack = this.localMediaStream.getAudioTracks()[0];
//           const videoTrack = this.localMediaStream.getVideoTracks()[0];

//           if (audioTrack) {
//               const audioProducer = await this.sendTransport.produce({
//                   track: audioTrack
//               });
//               this.producers.set('audio', audioProducer);
//               useRoomStore.getState().updateParticipantMedia(this.socket.id, 'audio', {
//                   stream: new MediaStream([audioTrack]),
//                   isPlaying: true
//               });
//           }
//           if (videoTrack) {
//               const videoProducer = await this.sendTransport.produce({
//                   track: videoTrack
//               });
//               this.producers.set('video', videoProducer);
//               useRoomStore.getState().updateParticipantMedia(this.socket.id, 'video', {
//                   stream: new MediaStream([videoTrack]),
//                   isPlaying: true
//               });
//           }
//       } catch (error) {
//           console.error(error);
//           throw new Error('Camera or Microphone access denied.');
//       }
//   }

//   async consume({
//       producerId,
//       userName,
//       socketId
//   }) {
//       if (!this.device || !this.recvTransport) return;
//       const {
//           addParticipant,
//           updateParticipantMedia,
//           participants
//       } = useRoomStore.getState();
//       const consumerParams = await this.request('consume', {
//           rtpCapabilities: this.device.rtpCapabilities,
//           producerId,
//           transportId: this.recvTransport.id,
//       });

//       console.log(consumerParams)

//       const consumer = await this.recvTransport.consume({
//           ...consumerParams,
//           appData: {
//               socketId,
//               producerId
//           },
//       });

//       console.log(consumer.track)
//       this.consumers.set(consumer.id, consumer);

//       const existingParticipant = participants.find(p => p.id === socketId);
//       if (!existingParticipant) {
//           addParticipant({
//               id: socketId,
//               name: userName,
//               isLocal: false
//           });
//       }

//       updateParticipantMedia(socketId, consumer.kind, {
//           stream: new MediaStream([consumer.track]),
//           consumerId: consumer.id,
//           isPlaying: false
//       });


//   }
// }


// frontend/src/lib/mediasoup-handler.js

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
        console.log(`[LOG] MediasoupHandler instantiated for user: ${userName}, room: ${roomName}`);
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
        console.log('[LOG] join() called');
        this.socket = io(serverUrl);
        this.setupSocketEvents();
    }

    close() {
        console.log('[LOG] close() called');
        this.socket?.disconnect();
        this.localMediaStream?.getTracks().forEach(t => t.stop());
        this.sendTransport?.close();
        this.recvTransport?.close();
    }

    toggleMute() {
        console.log('[LOG] toggleMute() called');
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
        console.log('[LOG] toggleCamera() called');
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
        console.log('[LOG] setupSocketEvents() called');
        const {
            setConnectionStatus,
            addParticipant,
            removeParticipant,
            updateParticipantMedia,
        } = useRoomStore.getState();

        this.socket.on('connect', async () => {
            console.log(`[LOG] Socket connected: ${this.socket.id}`);
            try {
                console.log('[LOG] Requesting to join room...');
                const data = await this.request('joinRoom', { userName: this.userName, roomName: this.roomName });
                console.log('[LOG] Joined room successfully. Router RTP Capabilities received.');
                
                this.device = new Device();
                await this.device.load({ routerRtpCapabilities: data.routerRtpCapabilities });
                console.log('[LOG] Mediasoup device loaded.');

                addParticipant({ id: this.socket.id, name: this.userName, isLocal: true });
                console.log(`[LOG] Local participant added to store: ${this.userName} (${this.socket.id})`);

                await this.initTransports();
                await this.startMedia();

                console.log('[LOG] Checking for existing producers to consume...', data.producersToConsume);
                for (const producerData of data.producersToConsume) {
                    console.log(`[LOG] Consuming existing producer:`, producerData);
                    await this.consume(producerData);
                }
                setConnectionStatus('connected');
                console.log('[LOG] Connection status set to "connected"');
            } catch (error) {
                console.error("[ERROR] Connection setup failed:", error);
                setConnectionStatus('disconnected');
                this.close();
            }
        });
        
        this.socket.on('disconnect', () => {
            console.log(`[LOG] Socket disconnected: ${this.socket.id}`);
            setConnectionStatus('disconnected');
        });

        this.socket.on('new-producer', (data) => {
            console.log(`[LOG] Received 'new-producer' event for user ${data.userName} (producerId: ${data.producerId})`);
            this.consume(data);
        });

        this.socket.on('client-disconnected', ({ socketId }) => {
            console.log(`[LOG] Received 'client-disconnected' event for socketId: ${socketId}`);
            removeParticipant(socketId);
        });
        
        this.socket.on('consumer-closed', ({ consumerId }) => {
            console.log(`[LOG] Received 'consumer-closed' event for consumerId: ${consumerId}`);
            const consumer = this.consumers.get(consumerId);
            if (!consumer) return;
            const { socketId } = consumer.appData;
            consumer.close();
            this.consumers.delete(consumerId);
            updateParticipantMedia(socketId, consumer.kind, { stream: null, isPlaying: false, consumerId: null });
        });
    }

    async initTransports() {
        console.log('[LOG] initTransports() called');
        // Producer transport
        const sendTransportParams = await this.request('createTransport', { type: 'producer' });
        this.sendTransport = this.device.createSendTransport(sendTransportParams);
        console.log(`[LOG] Producer transport created with id: ${this.sendTransport.id}`);
        this.sendTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
            try { 
                console.log(`[LOG] Connecting producer transport: ${this.sendTransport.id}`);
                await this.request('connectTransport', { transportId: this.sendTransport.id, dtlsParameters }); 
                cb(); 
            } catch (e) { eb(e); }
        });
        this.sendTransport.on('produce', async (params, cb, eb) => {
            try {
                console.log(`[LOG] Producing media with kind: ${params.kind}`);
                const { id } = await this.request('produce', { kind: params.kind, rtpParameters: params.rtpParameters, transportId: this.sendTransport.id });
                cb({ id });
            } catch (e) { eb(e); }
        });

        // Consumer transport
        const recvTransportParams = await this.request('createTransport', { type: 'consumer' });
        this.recvTransport = this.device.createRecvTransport(recvTransportParams);
        console.log(`[LOG] Consumer transport created with id: ${this.recvTransport.id}`);
        this.recvTransport.on('connect', async ({ dtlsParameters }, cb, eb) => {
            try { 
                console.log(`[LOG] Connecting consumer transport: ${this.recvTransport.id}`);
                await this.request('connectTransport', { transportId: this.recvTransport.id, dtlsParameters }); 
                cb(); 
            } catch (e) { eb(e); }
        });
    }

    async startMedia() {
        console.log('[LOG] startMedia() called');
        if (!this.device || !this.sendTransport) return;
        try {
            this.localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            console.log('[LOG] Got user media stream');
            const audioTrack = this.localMediaStream.getAudioTracks()[0];
            const videoTrack = this.localMediaStream.getVideoTracks()[0];

            if (audioTrack) {
                const audioProducer = await this.sendTransport.produce({ track: audioTrack });
                this.producers.set('audio', audioProducer);
                useRoomStore.getState().updateParticipantMedia(this.socket.id, 'audio', { stream: new MediaStream([audioTrack]), isPlaying: true });
                console.log(`[LOG] Audio producer created and state updated. Producer ID: ${audioProducer.id}`);
            }
            if (videoTrack) {
                const videoProducer = await this.sendTransport.produce({ track: videoTrack });
                this.producers.set('video', videoProducer);
                useRoomStore.getState().updateParticipantMedia(this.socket.id, 'video', { stream: new MediaStream([videoTrack]), isPlaying: true });
                console.log(`[LOG] Video producer created and state updated. Producer ID: ${videoProducer.id}`);
            }
        } catch (error) {
            console.error("[ERROR] Could not get user media:", error);
            throw new Error('Camera or Microphone access denied.');
        }
    }


    async consume({ producerId, userName, socketId }) {
        console.log(`[LOG] consume() called for producerId: ${producerId}`);
        if (!this.device || !this.recvTransport) return;
        const { addParticipant, updateParticipantMedia, participants } = useRoomStore.getState();

        try {
            const consumerParams = await this.request('consume', { rtpCapabilities: this.device.rtpCapabilities, producerId, transportId: this.recvTransport.id });
            console.log(`[LOG] Consume request successful for producerId: ${producerId}`);
            const consumer = await this.recvTransport.consume({ ...consumerParams, appData: { socketId, producerId } });
            console.log(`[LOG] Mediasoup consumer created on client. Kind: ${consumer.kind}, ID: ${consumer.id}`);

            this.consumers.set(consumer.id, consumer);

            if (!participants.some(p => p.id === socketId)) {
                addParticipant({ id: socketId, name: userName, isLocal: false });
                console.log(`[LOG] New remote participant added to store: ${userName} (${socketId})`);
            }
            
            console.log(`[LOG] Requesting server to resume consumer: ${consumer.id}`);
            await this.request('resumeConsumer', { consumerId: consumer.id });
            console.log(`[LOG] Server resumed consumer successfully.`);

            updateParticipantMedia(socketId, consumer.kind, {
                stream: new MediaStream([consumer.track]),
                consumerId: consumer.id,
                isPlaying: false
            });
            console.log(`[LOG] Zustand store updated for ${userName} with new ${consumer.kind} stream. isPlaying set to false.`);
        } catch(error) {
            console.error(`[ERROR] Failed to consume producer ${producerId} for user ${userName}.`, error);
        }
    }
}