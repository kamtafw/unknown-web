import { UserAuthState} from "@/types/signup/user";
import { create } from "zustand";
import { persist } from 'zustand/middleware';


// export const useAuthStore = create<UserAuthState>((set) => ({
//     user: null,
//     setUser: (user) => set({ user }),
//     logout: () => set({ user: null }),
//   }));

export const useAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);