// ==========================================================================================
// file: src/hooks/useRoomStore.js
// ==========================================================================================
import { create } from 'zustand';

const initialState = {
  connectionStatus: 'disconnected',
  isMuted: false,
  isCameraOff: false,
  participants: [],
};

export const useRoomStore = create((set) => ({
  ...initialState,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setMuted: (isMuted) => set({ isMuted }),
  setCameraOff: (isCameraOff) => set({ isCameraOff }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants.filter(p => p.id !== participant.id), participant]
  })),

  removeParticipant: (socketId) => set((state) => {
    const participant = state.participants.find(p => p.id === socketId);
    if(participant && participant.audioStream) {
        participant.audioStream.getTracks().forEach(track => track.stop());
    }
    if(participant && participant.videoStream) {
        participant.videoStream.getTracks().forEach(track => track.stop());
    }
    return { participants: state.participants.filter(p => p.id !== socketId) };
  }),

  updateParticipantStreams: (socketId, { audioStream, videoStream }) => set(state => ({
    participants: state.participants.map(p =>
      p.id === socketId ? { ...p, audioStream: audioStream || p.audioStream, videoStream: videoStream || p.videoStream } : p
    ),
  })),
  
  resetState: () => set(initialState),
}));
