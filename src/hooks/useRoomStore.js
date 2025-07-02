// // // ==========================================================================================
// // // file: src/hooks/useRoomStore.js
// // // ==========================================================================================

import { create } from 'zustand';

const initialState = {
  connectionStatus: 'disconnected',
  isMuted: false,
  isCameraOff: false,
  participants: [],
};

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