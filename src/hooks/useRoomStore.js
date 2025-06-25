// // ==========================================================================================
// // file: src/hooks/useRoomStore.js
// // ==========================================================================================
// import { create } from 'zustand';

// const initialState = {
//   connectionStatus: 'disconnected',
//   isMuted: false,
//   isCameraOff: true,
//   participants: [],
// };

// export const useRoomStore = create((set) => ({
//   ...initialState,
//   setConnectionStatus: (status) => set({ connectionStatus: status }),
//   setMuted: (isMuted) => set({ isMuted }),
//   setCameraOff: (isCameraOff) => set({ isCameraOff }),
  
//   addParticipant: (participant) => set((state) => ({
//     participants: [...state.participants.filter(p => p.id !== participant.id), participant]
//   })),

//   removeParticipant: (socketId) => set((state) => {
//     const participant = state.participants.find(p => p.id === socketId);
//     if(participant && participant.audioStream) {
//         participant.audioStream.getTracks().forEach(track => track.stop());
//     }
//     if(participant && participant.videoStream) {
//         participant.videoStream.getTracks().forEach(track => track.stop());
//     }
//     return { participants: state.participants.filter(p => p.id !== socketId) };
//   }),

//   updateParticipantStreams: (socketId, { audioStream, videoStream }) => set(state => ({
//     participants: state.participants.map(p =>
//       p.id === socketId ? { ...p, audioStream: audioStream || p.audioStream, videoStream: videoStream || p.videoStream } : p
//     ),
//   })),
  
//   resetState: () => set(initialState),
// }));


// ==========================================================================================
// src/hooks/useRoomStore.js
// - Redesigned participant state to track stream, consumerId, and playback state separately.
// ==========================================================================================
import { create } from 'zustand';

const initialState = {
  connectionStatus: 'disconnected',
  isMuted: false,
  isCameraOff: false,
  participants: [],
};

// Helper to create a default media state object
const createMediaState = () => ({
  stream: null,
  consumerId: null,
  isPlaying: false,
});

export const useRoomStore = create((set) => ({
  ...initialState,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setMuted: (isMuted) => set({ isMuted }),
  setCameraOff: (isCameraOff) => set({ isCameraOff }),

  addParticipant: (participant) => set((state) => {
    const newParticipant = {
      ...participant,
      audio: createMediaState(),
      video: createMediaState(),
    };
    return {
      participants: [...state.participants.filter(p => p.id !== newParticipant.id), newParticipant]
    };
  }),

  removeParticipant: (socketId) => set((state) => {
    const participant = state.participants.find(p => p.id === socketId);
    if (participant) {
      participant.audio.stream?.getTracks().forEach(track => track.stop());
      participant.video.stream?.getTracks().forEach(track => track.stop());
    }
    return { participants: state.participants.filter(p => p.id !== socketId) };
  }),

  updateParticipant: (socketId, updates) => set(state => ({
    participants: state.participants.map(p =>
      p.id === socketId ? { ...p, ...updates } : p
    ),
  })),

  updateParticipantMedia: (socketId, mediaType, updates) => set(state => ({
      participants: state.participants.map(p => {
          if (p.id === socketId) {
              return { ...p, [mediaType]: { ...p[mediaType], ...updates } };
          }
          return p;
      }),
  })),
  
  resetState: () => set(initialState),
}));