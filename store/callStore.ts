import { create } from 'zustand';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
}

interface CallStore {
  activeCallId: string | null;
  callType: 'audio' | 'video' | null;
  isIncoming: boolean;
  caller: CallParticipant | null;
  recipient: CallParticipant | null;
  isMuted: boolean;
  isVideoOn: boolean;
  
  setActiveCall: (callId: string, callType: 'audio' | 'video', isIncoming: boolean) => void;
  setParticipants: (caller: CallParticipant, recipient: CallParticipant) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  activeCallId: null,
  callType: null,
  isIncoming: false,
  caller: null,
  recipient: null,
  isMuted: false,
  isVideoOn: true,

  setActiveCall: (callId, callType, isIncoming) =>
    set({ activeCallId: callId, callType, isIncoming }),

  setParticipants: (caller, recipient) =>
    set({ caller, recipient }),

  endCall: () =>
    set({
      activeCallId: null,
      callType: null,
      isIncoming: false,
      caller: null,
      recipient: null,
      isMuted: false,
      isVideoOn: true,
    }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoOn: !state.isVideoOn })),
}));