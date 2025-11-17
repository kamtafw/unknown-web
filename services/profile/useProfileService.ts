import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/userStore";
import {
  getCurrentUserProfile,
  updateName,
  updateUsername,
  updateBio,
  updateDob,
  updateDobVisibility,
  updateLocation,
  addExternalLink,
  updateExternalLink,
  deleteExternalLink,
  updateCoverPhoto,
  updateProfilePhoto,
  // getLiveLocation,
  getExternalLinks,
  getConnections,
  getFollowing,
  getFollowers,
} from "./profileQueries";

interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

interface UserData {
  pkid: number;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string;
  dob: string | null;
  country: string | null;
  state: string | null;
  date_joined: string;
  dob_visibility: string;
  profile_photo: string;
  cover_photo: string;
  is_2fa_enabled: boolean;
  is_pin_enabled: boolean;
  otp_default: string;
  is_active: boolean;
  is_administrator: boolean;
  profile: {
    occupation: string;
    interests: string[];
    about_me: string;
  };
  external_links: ExternalLink[];
  follower_count: number;
  following_count: number;
}

interface ExternalLink {
  id: number;
  url: string;
  label: string;
}

interface FollowerUser {
  pkid: number;
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_photo: string;
  is_following?: boolean;
  follows_you?: boolean;
}
interface PaginatedResponse {
  count: number;
  total_pages: number;
  limit: number;
  current: number;
  previous: string | null;
  next: string | null;
  results: FollowerUser[];
}

interface FollowingResult {
  id: number;
  followed_user: FollowerUser;
  created_at: string;
}

interface FollowingPaginatedResponse {
  count: number;
  total_pages: number;
  limit: number;
  current: number;
  previous: string | null;
  next: string | null;
  results: FollowingResult[];
}

// Get Current User Profile
export const useGetCurrentUserProfile = () => {
  return useQuery<ApiResponse<UserData>, Error, UserData>({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.data,
  });
};

// Get External Links
export const useGetExternalLinks = (page = 1, limit = 30) => {
  return useQuery<
    ApiResponse<{ links: ExternalLink[]; total: number }>,
    Error,
    ExternalLink[]
  >({
    queryKey: ["externalLinks", page, limit],
    queryFn: () => getExternalLinks(page, limit),
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.data?.links || [],
  });
};

// Update Profile Photo
export const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (file: File) => updateProfilePhoto(file),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            profile_photo: data?.data?.profile_photo,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Profile photo updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update profile photo";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update Cover Photo
export const useUpdateCoverPhoto = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (file: File) => updateCoverPhoto(file),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            cover_photo: data?.data?.cover_photo,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Cover photo updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update cover photo";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update Name
export const useUpdateName = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { first_name: string; last_name: string }) =>
      updateName(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            first_name: data?.data?.first_name,
            last_name: data?.data?.last_name,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Name updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update name";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update Username
export const useUpdateUsername = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { username: string }) => updateUsername(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            username: data?.data?.username,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Username updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update username";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update Bio
export const useUpdateBio = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { about_me: string }) => updateBio(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            profile: {
              ...currentUser?.user?.profile,
              about_me: data?.data?.profile?.about_me,
            },
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Bio updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update bio";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update DOB
export const useUpdateDob = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { dob: string }) => updateDob(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            dob: data?.data?.dob,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Date of birth updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update date of birth";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update DOB Visibility
export const useUpdateDobVisibility = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { dob_visibility: string }) =>
      updateDobVisibility(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            dob_visibility: data?.data?.dob_visibility,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Date of birth visibility updated", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update date of birth visibility";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Live Location
// export const useGetLiveLocation = (userId: string) => {
//   return useQuery<
//     ApiResponse<{ latitude: number; longitude: number; address?: string }>,
//     Error,
//     { latitude: number; longitude: number; address?: string }
//   >({
//     queryKey: ["liveLocation", userId],
//     queryFn: () => getLiveLocation(userId),
//     staleTime: 1000 * 60 * 5,
//     select: (data) => data?.data,
//     enabled: !!userId,
//   });
// };

// Update Location
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { country: string; state: string }) =>
      updateLocation(payload),
    onSuccess: (data: ApiResponse<UserData>) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            country: data?.data?.country,
            state: data?.data?.state,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Location updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update location";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Add External Link
export const useAddExternalLink = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { url: string; label: string }) =>
      addExternalLink(payload),
    onSuccess: (data: ApiResponse<ExternalLink>) => {
      if (data?.status_code === 201 || data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        const updatedLinks = [
          ...(currentUser?.user?.external_links || []),
          data?.data,
        ];
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            external_links: updatedLinks,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Link added successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to add link";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Update External Link
export const useUpdateExternalLink = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({
      linkId,
      payload,
    }: {
      linkId: number;
      payload: { url: string; label: string };
    }) => updateExternalLink(linkId, payload),
    onSuccess: (
      data: ApiResponse<ExternalLink>,
      variables: { linkId: number; payload: { url: string; label: string } }
    ) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        const updatedLinks = (currentUser?.user?.external_links || []).map(
          (link: ExternalLink) =>
            link.id === variables.linkId ? data?.data : link
        );
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            external_links: updatedLinks,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Link updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update link";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Delete External Link
export const useDeleteExternalLink = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (linkId: number) => deleteExternalLink(linkId),
    onSuccess: (data: ApiResponse<unknown>, linkId: number) => {
      if (data?.status_code === 200 || data?.status_code === 204) {
        const currentUser = useAuthStore.getState().user;
        const updatedLinks = (currentUser?.user?.external_links || []).filter(
          (link: ExternalLink) => link.id !== linkId
        );
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            external_links: updatedLinks,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("Link deleted successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete link";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Followers
export const useGetFollowers = (page = 1, limit = 30) => {
  return useQuery<ApiResponse<PaginatedResponse>, Error, FollowerUser[]>({
    queryKey: ["followers", page, limit],
    queryFn: () => getFollowers(page, limit),
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.data?.results || [],
  });
};

// Get Following
export const useGetFollowing = (page = 1, limit = 30) => {
  return useQuery<
    ApiResponse<FollowingPaginatedResponse>,
    Error,
    FollowerUser[]
  >({
    queryKey: ["following", page, limit],
    queryFn: () => getFollowing(page, limit),
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      // For following, extract the followed_user from each result
      const results = data?.data?.results || [];
      return results.map((item: FollowingResult) => item.followed_user);
    },
  });
};

// Get Connections
export const useGetConnections = (page = 1, limit = 30) => {
  return useQuery<ApiResponse<PaginatedResponse>, Error, FollowerUser[]>({
    queryKey: ["connections", page, limit],
    queryFn: () => getConnections(page, limit),
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.data?.results || [],
  });
};
