import axiosIstanceAuthenticated from "@/lib/api/axiosInstance";

// Get Last Seen Visibility (includes except_users) - NEEDS TOKEN
export const getLastSeenVisibility = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/privacy/get-last-seen-visibility"
  );
  return response.data;
};

// Get All Privacy Settings (for overview) - NEEDS TOKEN
export const getPrivacySettings = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/privacy/visibility-settings"
  );
  return response.data;
};

// Update Last Seen Visibility - NEEDS TOKEN
export const updateLastSeenVisibility = async (payload: {
  last_seen_visibility: string;
}) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/privacy/last-seen",
    payload
  );
  return response.data;
};

// Update Online Visibility - NEEDS TOKEN
export const updateOnlineVisibility = async (payload: {
  online_visibility: string;
}) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/privacy/online-visibility",
    payload
  );
  return response.data;
};

// Get Online Visibility - NEEDS TOKEN
// export const getOnlineVisibility = async () => {
//   const response = await axiosIstanceAuthenticated.get(
//     "/users/privacy/online-visibility"
//   );
//   return response.data;
// };

// Get Contacts/Followings - NEEDS TOKEN
export const getContacts = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/followings"
  );
  return response.data;
};

// Get Status Visibility - NEEDS TOKEN
export const getStatusVisibility = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/privacy/get-status-visibility"
  );
  return response.data;
};

// Update Status Visibility - NEEDS TOKEN
export const updateStatusVisibility = async (payload: {
  status_visibility: string;
  except_users?: number[];
  only_share_with_users?: number[];
}) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/privacy/status-visibility",
    payload
  );
  return response.data;
};

// Get Blocked Users - NEEDS TOKEN
export const getBlockedUsers = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/privacy/blocked-users"
  );
  return response.data;
};

// Unblock Single User - NEEDS TOKEN
export const unblockUser = async (userId: number) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/privacy/unblock-user",
    { user_id: userId }
  );
  return response.data;
};

// Unblock Multiple Users - NEEDS TOKEN
export const unblockUsers = async (userIds: number[]) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/privacy/unblock-users",
    { user_ids: userIds }
  );
  return response.data;
};


// Get Live Location Sharing Status - NEEDS TOKEN (POST)
export const getUserLiveLocation = async () => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/security/location-sharing"
  );
  return response.data;
};

// Start/Stop Live Location Sharing - NEEDS TOKEN (PATCH)
export const toggleLiveLocationSharing = async (payload: {
  location_sharing_enabled: boolean;
  duration_minutes?: number;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await axiosIstanceAuthenticated.patch(
    "/users/security/update-location",
    payload
  );
  return response.data;
};

