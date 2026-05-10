// import axiosInstanceAuthenticated from "@/lib/api/axiosInstance";

// export const callKeys = {
//   all: ["calls"] as const,
//   contacts: () => [...callKeys.all, "contacts"] as const,
//   history: () => [...callKeys.all, "history"] as const,
//   active: () => [...callKeys.all, "active"] as const,
// };

// // Get contacts for calls
// export const getUserFollowings = async () => {
//   const response = await axiosInstanceAuthenticated.get("/users/followings");
//   return response.data;
// };

// services/calls/callQueries.ts
import axiosInstanceAuthenticated from "@/lib/api/axiosInstance";

export const callKeys = {
  all: ["calls"] as const,
  contacts: () => [...callKeys.all, "contacts"] as const,
  history: () => [...callKeys.all, "history"] as const,
  active: () => [...callKeys.all, "active"] as const,
};

// ADD THIS INTERFACE
export interface FollowingUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string;
  phone_number: string;
  profile_photo: string | null;
}

export interface FollowingResult {
  id: number;
  followed_user: FollowingUser; // Data is nested here
  created_at: string;
}

export interface FollowingsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    results: FollowingResult[]; // Changed from followings to results
    count: number;
    current: number;
    limit: number;
    total_pages: number;
  };
}

// Get contacts for calls
export const getUserFollowings = async (): Promise<FollowingsResponse> => {
  const response = await axiosInstanceAuthenticated.get("/users/followings");
  return response.data;
};
