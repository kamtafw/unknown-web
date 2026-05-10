import { create } from "zustand";

interface SocialStore {
  // UI State only - no post data
  selectedPostId: number | null;
  setSelectedPostId: (postId: number | null) => void;
  
  // Modal states
  isShareModalOpen: boolean;
  isRepostModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  setRepostModalOpen: (open: boolean) => void;
  
  // Feed filters
  activeView: "forYou" | "following";
  setActiveView: (view: "forYou" | "following") => void;
}

export const useSocialStore = create<SocialStore>((set) => ({
  selectedPostId: null,
  setSelectedPostId: (postId) => set({ selectedPostId: postId }),
  
  isShareModalOpen: false,
  isRepostModalOpen: false,
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  setRepostModalOpen: (open) => set({ isRepostModalOpen: open }),
  
  activeView: "forYou",
  setActiveView: (view) => set({ activeView: view }),
}));
