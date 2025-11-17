import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Contact {
  id: number;
  pkid: number;
  username: string;
  phone: string;
  image: string;
  profile_picture?: string;
  full_name?: string;
  [key: string]: string | number | boolean | undefined;
}

interface PrivacySettings {
  id: number;
  last_seen_visibility: string;
  status_visibility: string;
  app_lock_enabled: boolean;
  show_content_when_locked: boolean;
  lock_period: string;
}

interface StatusVisibilityData {
  status_visibility: string;
  except_users: Contact[];
  only_share_with_users: Contact[];
}

interface BlockedUser {
  id: number;
  blocked_user: {
    id: string;
    pkid: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  blocked_at: string;
}

interface PrivacyStore {
  privacySettings: PrivacySettings | null;
  statusVisibilityData: StatusVisibilityData | null;
  onlineVisibility: string;
  lastSeenVisibility: string;
  contacts: Contact[];
  excludedContactIds: number[];
  includedContactIds: number[];
  selectedStatusOption: string;
  blockedUsers: BlockedUser[];

  setPrivacySettings: (settings: PrivacySettings) => void;
  setStatusVisibility: (data: StatusVisibilityData) => void;
  updateOnlineVisibility: (visibility: string) => void;
  updateLastSeenVisibility: (visibility: string) => void;
  setContacts: (contacts: Contact[]) => void;
  setExcludedContactIds: (ids: number[]) => void;
  setIncludedContactIds: (ids: number[]) => void;
  setSelectedStatusOption: (option: string) => void;
  setBlockedUsers: (users: BlockedUser[]) => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      privacySettings: null,
      onlineVisibility: "everyone",
      lastSeenVisibility: "everyone",
      contacts: [],
      excludedContactIds: [],

      statusVisibilityData: null,
      includedContactIds: [],
      selectedStatusOption: "",
      blockedUsers: [],

      setPrivacySettings: (settings) =>
        set({
          privacySettings: settings,
          lastSeenVisibility: settings.last_seen_visibility,
        }),

      updateOnlineVisibility: (visibility) =>
        set({ onlineVisibility: visibility }),

      updateLastSeenVisibility: (visibility) =>
        set({ lastSeenVisibility: visibility }),

      setContacts: (contacts) => set({ contacts }),

      setExcludedContactIds: (ids) => set({ excludedContactIds: ids }),
      setStatusVisibility: (data) =>
        set({
          statusVisibilityData: data,
          excludedContactIds: data.except_users
            ? data.except_users.map((user) => user.pkid as number)
            : [],
          includedContactIds: data.only_share_with_users
            ? data.only_share_with_users.map((user) => user.pkid as number)
            : [],
        }),

      setIncludedContactIds: (ids) => set({ includedContactIds: ids }),
      setSelectedStatusOption: (option) =>
        set({ selectedStatusOption: option }),
      setBlockedUsers: (users) => set({ blockedUsers: users }),
    }),
    {
      name: "privacy-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
