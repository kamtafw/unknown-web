import { UserAuthState} from "@/types/signup/user";
import { create } from "zustand";


export const useAuthStore = create<UserAuthState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  }));