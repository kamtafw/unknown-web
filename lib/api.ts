import {
	ApiResponse,
	BookmarkResponse,
	FeedResponse,
	FollowersResponse,
	FollowingsResponse,
	FriendSuggestionsResponse,
	FullUser,
	LikeResponse,
	LoginPayload,
	LoginResponseData,
	SignupPayload,
	UsersListResponse,
	VerifyOtpPayload,
	VerifyOtpResponseData,
} from "@/types/api"
import { apiClient } from "./axios"

// all calls go to Next.js route handlers and not Django directly,
// so HTTP-only cookies are set/read server-side

export const authApi = {
	login: (payload: LoginPayload) =>
		apiClient.post<ApiResponse<LoginResponseData>>("/api/auth/login", payload).then((r) => r.data),

	signup: (payload: SignupPayload) =>
		apiClient.post<ApiResponse<null>>("/api/auth/signup", payload).then((r) => r.data),

	verifyOtp: (payload: VerifyOtpPayload) =>
		apiClient
			.post<
				ApiResponse<VerifyOtpResponseData & { otp_token: string }>
			>("/api/auth/verify-otp", payload)
			.then((r) => r.data),

	logout: () => apiClient.post("/api/auth/logout").then((r) => r.data),
}

export const userApi = {
	/** full profile — call immediately after verify-otp success */
	getMe: () =>
		apiClient.get<ApiResponse<FullUser>>("/api/users/me").then((r) => {
			const user = r.data.data
			if (!user) throw new Error("getMe returned empty data")
			return user
		}),

	getFriendSuggestions: async (): Promise<FriendSuggestionsResponse> =>
		await apiClient
			.get<FriendSuggestionsResponse>("/api/users/friend-suggestions")
			.then((r) => r.data),

	getFollowers: async (): Promise<FollowersResponse> =>
		await apiClient.get<FollowersResponse>("/api/users/followers").then((r) => r.data),

	getFollowings: async (): Promise<FollowingsResponse> =>
		await apiClient.get<FollowingsResponse>("/api/users/followings").then((r) => r.data),

	followUser: (payload: { followed_user: number }) =>
		apiClient.post<ApiResponse<{}>>("/api/users/follow", payload).then((r) => r.data),

	unfollowUser: (payload: { followed_user: number }) =>
		apiClient.post<ApiResponse<{}>>("/api/users/unfollow", payload).then((r) => r.data),
}

export const socialApi = {
	getForYouFeed: async (page = 1): Promise<FeedResponse> =>
		await apiClient.get<FeedResponse>(`/api/socials/for-you-feed?page=${page}`).then((r) => r.data),

	getFollowingFeed: async (page = 1): Promise<FeedResponse> =>
		await apiClient
			.get<FeedResponse>(`/api/socials/following-feed?page=${page}`)
			.then((r) => r.data),

	getFeedByPath: (path: string) => apiClient.get<FeedResponse>(path).then((r) => r.data),

	likePost: (payload: { post: string }) =>
		apiClient.post<LikeResponse>("/api/socials/like-post", payload).then((r) => r.data),

	bookmarkPost: (payload: { post: string }) =>
		apiClient.post<BookmarkResponse>("/api/socials/bookmark-post", payload).then((r) => r.data),
}
