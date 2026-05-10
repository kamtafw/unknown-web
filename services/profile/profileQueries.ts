import axiosInstanceAuthenticated from "../../lib/api/axiosInstance";

// Get Current User Profile
export const getCurrentUserProfile = async () => {
  const response = await axiosInstanceAuthenticated.get("/users/me");
  return response.data;
};

// Update Profile Photo
export const updateProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("profile_photo", file);

  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-profile-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Update Cover Photo
export const updateCoverPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("cover_photo", file);

  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-cover-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Update Name
export const updateName = async (payload: {
  first_name: string;
  last_name: string;
}) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-name",
    payload
  );
  return response.data;
};

// Update Username
export const updateUsername = async (payload: { username: string }) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/change-username",
    payload
  );
  return response.data;
};

// Update Bio
export const updateBio = async (payload: { about_me: string }) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-bio",
    payload
  );
  return response.data;
};

// Update DOB
export const updateDob = async (payload: { dob: string }) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-dob",
    payload
  );
  return response.data;
};

// Update DOB Visibility
export const updateDobVisibility = async (payload: {
  dob_visibility: string;
}) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/dob-visibility",
    payload
  );
  return response.data;
};

// Get Live Location
// export const getLiveLocation = async (userId: string) => {
//   const response = await axiosInstanceAuthenticated.get(
//     `/users/${userId}/live-location`
//   );
//   return response.data;
// };

// Update Location
export const updateLocation = async (payload: {
  country: string;
  state: string;
}) => {
  const response = await axiosInstanceAuthenticated.patch(
    "/users/update-location",
    payload
  );
  return response.data;
};

// Add External Link
export const addExternalLink = async (payload: {
  url: string;
  label: string;
}) => {
  const response = await axiosInstanceAuthenticated.post(
    "/users/external-links",
    payload
  );
  return response.data;
};

// Get External Links
export const getExternalLinks = async (page = 1, limit = 30) => {
  const response = await axiosInstanceAuthenticated.get(
    `/users/external-links?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Update External Link
export const updateExternalLink = async (
  linkId: number,
  payload: { url: string; label: string }
) => {
  const response = await axiosInstanceAuthenticated.put(
    `/users/external-links/${linkId}`,
    payload
  );
  return response.data;
};

// Delete External Link
export const deleteExternalLink = async (linkId: number) => {
  const response = await axiosInstanceAuthenticated.delete(
    `/users/external-links/${linkId}`
  );
  return response.data;
};

// Get Followers
export const getFollowers = async (page = 1, limit = 30) => {
  const response = await axiosInstanceAuthenticated.get(
    `/users/followers?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Get Following
export const getFollowing = async (page = 1, limit = 30) => {
  const response = await axiosInstanceAuthenticated.get(
    `/users/followings?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Get Connections
export const getConnections = async (page = 1, limit = 30) => {
  const response = await axiosInstanceAuthenticated.get(
    `/users/connections?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Get Mutual Follows
export const getMutualFollows = async (page = 1, limit = 30) => {
  const response = await axiosInstanceAuthenticated.get(
    `/users/mutual-follows?page=${page}&limit=${limit}`
  );
  return response.data;
};