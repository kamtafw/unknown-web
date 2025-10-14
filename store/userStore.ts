import { UserAuthState } from "@/types/signup/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      tempCredentials: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token: string | null) => set({ accessToken: token }),
      setTempCredentials: (credentials) =>
        set({ tempCredentials: credentials }),
      logout: () => {
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        set({ user: null, accessToken: null, tempCredentials: null });
      },
    }),
    {
      name: "auth-storage",
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
