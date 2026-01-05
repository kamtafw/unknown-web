import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFriendSuggestions,
  getForYouFeed,
  getFollowingFeed,
  likePost,
  repostPost,
} from "./socialQueries";
import { followAUser } from "../auth/userAuthQueries";

// Define types at the top of this file (NOT exported)
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

interface ApiPost {
  pkid: number;
  id: string;
  user: {
    first_name: string;
    last_name: string;
    username: string;
    profile_photo: string;
  };
  created_at: string;
  post_location: Array<{ address: string }>;
  content_text: string;
  post_media: Array<{ external_url: string }>;
  post_like_count: number;
  post_comment_count: number;
  repost_count: number;
  liked_by_me: boolean;
  reposted_by_me: boolean;
  is_repost: boolean;
  original_post: ApiPost | null;
}

const transformPost = (apiPost: ApiPost) => ({
  id: apiPost.pkid,
  pkid: apiPost.pkid,
  postId: apiPost.id,
  name: `${apiPost.user.first_name} ${apiPost.user.last_name}`,
  username: apiPost.user.username,
  time: new Date(apiPost.created_at).toLocaleString(),
  location: apiPost.post_location?.[0]?.address || "",
  content: apiPost.content_text || "",
  media: apiPost.post_media?.map((m) => m.external_url) || [],
  profilePic: apiPost.user.profile_photo || "/default-avatar.png",
  likes: apiPost.post_like_count || 0,
  comments: apiPost.post_comment_count || 0,
  reposts: apiPost.repost_count || 0,
  likedByMe: apiPost.liked_by_me || false,
  repostedByMe: apiPost.reposted_by_me || false,
  isRepost: apiPost.is_repost || false,
  originalPost: apiPost.original_post
    ? {
        id: apiPost.original_post.pkid,
        pkid: apiPost.original_post.pkid,
        postId: apiPost.original_post.id,
        name: `${apiPost.original_post.user.first_name} ${apiPost.original_post.user.last_name}`,
        username: apiPost.original_post.user.username,
        time: new Date(apiPost.original_post.created_at).toLocaleString(),
        location: apiPost.original_post.post_location?.[0]?.address || "",
        content: apiPost.original_post.content_text || "",
        media:
          apiPost.original_post.post_media?.map((m) => m.external_url) || [],
        profilePic:
          apiPost.original_post.user.profile_photo || "/default-avatar.png",
        likes: apiPost.original_post.post_like_count || 0,
        comments: apiPost.original_post.post_comment_count || 0,
        reposts: apiPost.original_post.repost_count || 0,
      }
    : null,
});

interface FollowUserPayload {
  followed_user: number;
}

interface FollowUserResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: Record<string, unknown>;
}

// Get Friend Suggestions
export const useGetFriendSuggestions = () => {
  return useQuery({
    queryKey: ["friendSuggestions"],
    queryFn: getFriendSuggestions,
    select: (data: FriendSuggestionsApiResponse) => {
      const results = data?.data?.results || [];
      return results;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Follow User from Suggestions
export const useFollowUserFromSuggestions = () => {
  const queryClient = useQueryClient();

  return useMutation<FollowUserResponse, Error, FollowUserPayload>({
    mutationFn: (payload) => followAUser(payload),
    onSuccess: (data) => {
      if (data?.status_code === 201 || data?.status_code === 200) {
        queryClient.invalidateQueries({ queryKey: ["friendSuggestions"] });
        queryClient.invalidateQueries({ queryKey: ["following"] });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("User followed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to follow user";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get For You Feed
export const useGetForYouFeed = () => {
  return useQuery({
    queryKey: ["forYouFeed"],
    queryFn: getForYouFeed,
    select: (data) => {
      const results = data?.data?.results || [];
      return results.map(transformPost);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Get Following Feed
export const useGetFollowingFeed = () => {
  return useQuery({
    queryKey: ["followingFeed"],
    queryFn: getFollowingFeed,
    select: (data) => {
      const results = data?.data?.results || [];
      return results.map(transformPost);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Get Like Post
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postUuid }: { postUuid: string; postPkid: number }) => {
      return likePost(postUuid);
    },
    onMutate: async ({ postPkid }) => {
      await queryClient.cancelQueries({ queryKey: ["forYouFeed"] });
      await queryClient.cancelQueries({ queryKey: ["followingFeed"] });

      const previousForYou = queryClient.getQueryData(["forYouFeed"]);
      const previousFollowing = queryClient.getQueryData(["followingFeed"]);

      queryClient.setQueryData(["forYouFeed"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { data?: { results?: ApiPost[] } };
        if (!data.data?.results) return old;

        return {
          ...data,
          data: {
            ...data.data,
            results: data.data.results.map((post) =>
              post.pkid === postPkid
                ? {
                    ...post,
                    liked_by_me: !post.liked_by_me,
                    post_like_count: post.liked_by_me
                      ? post.post_like_count - 1
                      : post.post_like_count + 1,
                  }
                : post
            ),
          },
        };
      });

      queryClient.setQueryData(["followingFeed"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { data?: { results?: ApiPost[] } };
        if (!data.data?.results) return old;

        return {
          ...data,
          data: {
            ...data.data,
            results: data.data.results.map((post) =>
              post.pkid === postPkid
                ? {
                    ...post,
                    liked_by_me: !post.liked_by_me,
                    post_like_count: post.liked_by_me
                      ? post.post_like_count - 1
                      : post.post_like_count + 1,
                  }
                : post
            ),
          },
        };
      });

      return { previousForYou, previousFollowing };
    },
    onError: (err, variables, context) => {
      if (context?.previousForYou) {
        queryClient.setQueryData(["forYouFeed"], context.previousForYou);
      }
      if (context?.previousFollowing) {
        queryClient.setQueryData(["followingFeed"], context.previousFollowing);
      }
      toast.error("Failed to like post", {
        style: { background: "red", color: "white" },
      });
    },
    onSuccess: () => {
    },
  });
};

// Repost Post
export const useRepostPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postUuid }: { postUuid: string; postPkid: number }) => {
      return repostPost(postUuid);
    },
    onMutate: async ({ postPkid }) => {
      await queryClient.cancelQueries({ queryKey: ["forYouFeed"] });
      await queryClient.cancelQueries({ queryKey: ["followingFeed"] });

      const previousForYou = queryClient.getQueryData(["forYouFeed"]);
      const previousFollowing = queryClient.getQueryData(["followingFeed"]);

      queryClient.setQueryData(["forYouFeed"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { data?: { results?: ApiPost[] } };
        if (!data.data?.results) return old;

        return {
          ...data,
          data: {
            ...data.data,
            results: data.data.results.map((post) =>
              post.pkid === postPkid
                ? {
                    ...post,
                    reposted_by_me: !post.reposted_by_me,
                    repost_count: post.reposted_by_me
                      ? post.repost_count - 1
                      : post.repost_count + 1,
                  }
                : post
            ),
          },
        };
      });

      queryClient.setQueryData(["followingFeed"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { data?: { results?: ApiPost[] } };
        if (!data.data?.results) return old;

        return {
          ...data,
          data: {
            ...data.data,
            results: data.data.results.map((post) =>
              post.pkid === postPkid
                ? {
                    ...post,
                    reposted_by_me: !post.reposted_by_me,
                    repost_count: post.reposted_by_me
                      ? post.repost_count - 1
                      : post.repost_count + 1,
                  }
                : post
            ),
          },
        };
      });

      return { previousForYou, previousFollowing };
    },
    onError: (err, variables, context) => {
      if (context?.previousForYou) {
        queryClient.setQueryData(["forYouFeed"], context.previousForYou);
      }
      if (context?.previousFollowing) {
        queryClient.setQueryData(["followingFeed"], context.previousFollowing);
      }
      toast.error("Failed to repost", {
        style: { background: "red", color: "white" },
      });
    },
    onSuccess: () => {
      toast.success("Reposted successfully", {
        style: { background: "green", color: "white" },
      });
    },
  });
};
