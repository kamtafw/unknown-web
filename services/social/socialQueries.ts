import axiosIstanceAuthenticated from "../../lib/api/axiosInstance";

interface FriendSuggestion {
  pkid: number;
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo?: string;
  youFollowThisUser: boolean;
  followsYou: boolean;
}

interface FriendSuggestionsApiResponse {
  success: boolean;
  status_code: number;
  message: string | null;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FriendSuggestion[];
  };
}

interface PostLocation {
  pkid: number;
  id: string;
  longitude: string;
  latitude: string;
  address: string;
  created_at: string;
}

interface PostMedia {
  external_url: string;
}

interface PostUser {
  pkid: number;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string;
  profile_photo: string;
}

interface Post {
  pkid: number;
  id: string;
  user: PostUser;
  content_text: string;
  is_shared: boolean | null;
  is_repost: boolean;
  original_post: Post | null;
  bookmarked_by_me: boolean;
  liked_by_me: boolean;
  reposted_by_me: boolean;
  who_can_see: string;
  who_can_reply: string;
  created_at: string;
  updated_at: string;
  post_location: PostLocation[];
  post_media: PostMedia[];
  post_like_count: number;
  post_comment_count: number;
  repost_count: number;
  post_reaction: unknown[];
  post_hashtagged: string[];
}

interface PostFeedResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    total_pages: number;
    limit: number;
    current: number;
    previous: string | null;
    next: string | null;
    results: Post[];
  };
}

// Get Friend Suggestions - NEEDS TOKEN
export const getFriendSuggestions =
  async (): Promise<FriendSuggestionsApiResponse> => {
    const response =
      await axiosIstanceAuthenticated.get<FriendSuggestionsApiResponse>(
        "/users/friend-suggestions"
      );
    return response.data;
  };

// Get For You Feed
export const getForYouFeed = async (): Promise<PostFeedResponse> => {
  const response = await axiosIstanceAuthenticated.get<PostFeedResponse>(
    "/socials/posts/feed"
  );
  return response.data;
};

// Get Following Feed
export const getFollowingFeed = async (): Promise<PostFeedResponse> => {
  const response = await axiosIstanceAuthenticated.get<PostFeedResponse>(
    "/socials/posts/following-feed"
  );
  return response.data;
};


// Like/Unlike a post
export const likePost = async (
  postUuid: string
): Promise<{ success: boolean; status_code: number; message: string }> => {
  console.log(
    " API MOCK: Simulating successful like for postUuid:",
    postUuid
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock success response
  return {
    success: true,
    status_code: 201,
    message: "Post liked successfully",
  };
};

// Repost a post
export const repostPost = async (
  postUuid: string
): Promise<{
  success: boolean;
  status_code: number;
  message: string;
  data: Record<string, unknown>;
}> => {
  const response = await axiosIstanceAuthenticated.post(
    "/socials/post/repost",
    {
      is_repost: true,
      original_post: postUuid,
    }
  );
  return response.data; 
};
