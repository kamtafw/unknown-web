import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPrivacySettings,
  updateOnlineVisibility,
  getContacts,
  updateLastSeenVisibility,
  getLastSeenVisibility,
  getStatusVisibility,
  updateStatusVisibility,
  getBlockedUsers,
  unblockUser,
  unblockUsers,
  getLiveLocationSharing,
  toggleLiveLocationSharing,
} from "./privacyQueries";
import { usePrivacyStore } from "@/store/privacyStore";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: Record<string, string[]>;
      errors?: Record<string, string[]>;
    };
  };
}

// Get Last Seen Visibility (includes except_users)
export const useGetLastSeenVisibility = () => {
  const updateLastSeenVisibilityStore = usePrivacyStore(
    (state) => state.updateLastSeenVisibility
  );
  const setExcludedContactIds = usePrivacyStore(
    (state) => state.setExcludedContactIds
  );

  return useQuery({
    queryKey: ["last-seen-visibility"],
    queryFn: async () => {
      const data = await getLastSeenVisibility();
      if (data?.status_code === 200) {
        updateLastSeenVisibilityStore(data.data.last_seen_visibility);
        // Pre-populate excluded contacts
        if (data.data.except_users && data.data.except_users.length > 0) {
          const excludedIds = data.data.except_users.map(
            (user: { pkid: number }) => user.pkid
          );
          setExcludedContactIds(excludedIds);
        }
      }
      return data;
    },
    retry: 1,
  });
};

// Get Privacy Settings (for overview page)
export const useGetPrivacySettings = () => {
  const setPrivacySettings = usePrivacyStore(
    (state) => state.setPrivacySettings
  );

  return useQuery({
    queryKey: ["privacy-settings"],
    queryFn: async () => {
      const data = await getPrivacySettings();
      if (data?.status_code === 200) {
        setPrivacySettings(data.data);
      }
      return data;
    },
    retry: 1,
  });
};

// Update Online Visibility
export const useUpdateOnlineVisibility = () => {
  const updateOnlineVisibilityStore = usePrivacyStore(
    (state) => state.updateOnlineVisibility
  );

  return useMutation({
    mutationFn: (payload: { online_visibility: string }) =>
      updateOnlineVisibility(payload),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        updateOnlineVisibilityStore(data.data.online_visibility);
        toast.success(
          data.message || "Online visibility updated successfully",
          {
            style: { background: "green", color: "white" },
          }
        );
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update online visibility";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Contacts
export const useGetContacts = () => {
  const setContacts = usePrivacyStore((state) => state.setContacts);

  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const data = await getContacts();
      if (data?.status_code === 200 && data?.data?.followings) {
        setContacts(data.data.followings);
      }
      return data;
    },
    retry: 1,
  });
};

// Update Last Seen Visibility
export const useUpdateLastSeenVisibility = () => {
  const updateLastSeenVisibilityStore = usePrivacyStore(
    (state) => state.updateLastSeenVisibility
  );

  return useMutation({
    mutationFn: (payload: { last_seen_visibility: string }) =>
      updateLastSeenVisibility(payload),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        updateLastSeenVisibilityStore(data.data.last_seen_visibility);
        toast.success(
          data.message || "Last seen visibility updated successfully",
          {
            style: { background: "green", color: "white" },
          }
        );
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update last seen visibility";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Online Visibility
export const useGetStatusVisibility = () => {
  const setStatusVisibility = usePrivacyStore(
    (state) => state.setStatusVisibility
  );

  return useQuery({
    queryKey: ["status-visibility"],
    queryFn: async () => {
      const data = await getStatusVisibility();
      if (data?.status_code === 200) {
        setStatusVisibility(data.data);
      }
      return data;
    },
    retry: 1,
  });
};

// Update Status Visibility
export const useUpdateStatusVisibility = () => {
  const setStatusVisibility = usePrivacyStore(
    (state) => state.setStatusVisibility
  );

  return useMutation({
    mutationFn: (payload: {
      status_visibility: string;
      except_users?: number[];
      only_share_with_users?: number[];
    }) => updateStatusVisibility(payload),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        setStatusVisibility(data.data);
        toast.success(
          data.message || "Status visibility updated successfully",
          {
            style: { background: "green", color: "white" },
          }
        );
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update status visibility";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Blocked Users
export const useGetBlockedUsers = () => {
  const setBlockedUsers = usePrivacyStore((state) => state.setBlockedUsers);

  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const data = await getBlockedUsers();
      if (data?.status_code === 200 && data?.data?.results) {
        setBlockedUsers(data.data.results);
      }
      return data;
    },
    retry: 1,
  });
};

// Unblock Single User
export const useUnblockUser = () => {
  return useMutation({
    mutationFn: (userId: number) => unblockUser(userId),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        toast.success(data.message || "User unblocked successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to unblock user";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Unblock Users
export const useUnblockUsers = () => {
  return useMutation({
    mutationFn: (userIds: number[]) => unblockUsers(userIds),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        toast.success(data.message || "Users unblocked successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to unblock users";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Live Location Sharing Status
export const useGetLiveLocationSharing = () => {
  return useQuery({
    queryKey: ["live-location-sharing"],
    queryFn: getLiveLocationSharing,
    retry: 1,
  });
};

// Toggle Live Location Sharing (Start/Stop)
export const useToggleLiveLocationSharing = () => {
  return useMutation({
    mutationFn: (payload: { is_sharing: boolean; duration_minutes?: number }) =>
      toggleLiveLocationSharing(payload),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        toast.success(data.message || "Location sharing updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update location sharing";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};
