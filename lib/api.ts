import {
	AddCommentPayload,
	AddCommentResponse,
	AddExternalLinkResponse,
	ApiResponse,
	BookmarkResponse,
	CommentsResponse,
	CompleteProfilePayload,
	CompleteProfileResponse,
	ConfirmPasswordResponse,
	CreatePostPayload,
	CreatePostResponse,
	FeedResponse,
	FollowersResponse,
	FollowingsResponse,
	FriendSuggestionsResponse,
	FullUser,
	GenerateTotpResponse,
	InterestsPayload,
	InterestsResponse,
	LikeResponse,
	LoginPayload,
	LoginResponseData,
	NullResponse,
	PostDetailResponse,
	PostStatsResponse,
	RepostPayload,
	RepostResponse,
	ResetPasswordPayload,
	ResetPasswordResponse,
	SetPinResponse,
	SignupPayload,
	UnknownResponse,
	UpdateBioResponse,
	UpdateCoverPhotoResponse,
	UpdateDobResponse,
	UpdateDobVisibilityResponse,
	UpdateExternalLinkResponse,
	UpdateLocationResponse,
	UpdateNameResponse,
	UpdateProfilePhotoResponse,
	UpdateUsernameResponse,
	UploadMediaResponse,
	UserListResponse,
	VerifyOtpPayload,
	VerifyOtpResponseData,
	VerifyTotpResponse,
} from "@/types/api"
import { apiClient } from "./axios"

// all calls go to Next.js route handlers and not Django directly,
// so HTTP-only cookies are set/read server-side

export const authApi = {
	login: (payload: LoginPayload) =>
		apiClient.post<ApiResponse<LoginResponseData>>("/api/auth/login", payload).then((r) => r.data),

	signup: (payload: SignupPayload) =>
		apiClient.post<NullResponse>("/api/auth/signup", payload).then((r) => r.data),

	verifyOtp: (payload: VerifyOtpPayload) =>
		apiClient
			.post<
				ApiResponse<VerifyOtpResponseData & { otp_token: string }>
			>("/api/auth/verify-otp", payload)
			.then((r) => r.data),

	resendOtp: (email: string) =>
		apiClient.post<NullResponse>("/api/auth/resend-otp", { email }).then((r) => r.data),

	forgotPassword: (email: string) =>
		apiClient
			.post<ResetPasswordResponse>("/api/auth/forgot-password", { email })
			.then((r) => r.data),

	resetPassword: (payload: ResetPasswordPayload) =>
		apiClient.post<ResetPasswordResponse>("/api/auth/reset-password", payload).then((r) => r.data),

	generateTotp: (payload: { email: string }) =>
		apiClient.post<GenerateTotpResponse>("/api/auth/generate-totp", payload).then((r) => r.data),

	verifyTotp: (payload: { email: string; otp: string }) =>
		apiClient.post<VerifyTotpResponse>("/api/auth/verify-totp", payload).then((r) => r.data),

	logout: () => apiClient.post("/api/auth/logout").then((r) => r.data),
}

export const userApi = {
	getMe: () =>
		apiClient.get<ApiResponse<FullUser>>("/api/users/me").then((r) => {
			const user = r.data.data
			if (!user) throw new Error("getMe returned empty data")
			return user
		}),

	completeProfile: (payload: CompleteProfilePayload) =>
		apiClient
			.post<CompleteProfileResponse>("/api/users/complete-profile", payload)
			.then((r) => r.data),

	confirmPassword: (payload: { password: string }) =>
		apiClient
			.post<ConfirmPasswordResponse>("/api/users/confirm-password", payload)
			.then((r) => r.data),

	updateProfilePhoto: async (file: File) => {
		const formData = new FormData()
		formData.append("profile_photo", file)

		const res = await apiClient.patch<UpdateProfilePhotoResponse>(
			"/api/users/update-profile-photo",
			formData,
		)
		return res.data
	},

	updateCoverPhoto: async (file: File) => {
		const formData = new FormData()
		formData.append("cover_photo", file)
		const res = await apiClient.patch<UpdateCoverPhotoResponse>(
			"/api/users/update-cover-photo",
			formData,
		)
		return res.data
	},

	updateName: (payload: { first_name: string; last_name: string }) =>
		apiClient.patch<UpdateNameResponse>("/api/users/update-name", payload).then((r) => r.data),

	updateUsername: (payload: { username: string }) =>
		apiClient
			.patch<UpdateUsernameResponse>("/api/users/change-username", payload)
			.then((r) => r.data),

	updateBio: (payload: { about_me: string }) =>
		apiClient.patch<UpdateBioResponse>("/api/users/update-bio", payload).then((r) => r.data),

	updateDob: (payload: { dob: string }) =>
		apiClient.patch<UpdateDobResponse>("/api/users/update-dob", payload).then((r) => r.data),

	updateDobVisibility: (payload: { dob_visibility: "full" | "partial" }) =>
		apiClient
			.patch<UpdateDobVisibilityResponse>("/api/users/update-dob-visibility", payload)
			.then((r) => r.data),

	updateLocation: (payload: { country: string; state: string }) =>
		apiClient
			.patch<UpdateLocationResponse>("/api/users/update-location", payload)
			.then((r) => r.data),

	addExternalLink: (payload: { url: string; label: string }) =>
		apiClient
			.post<AddExternalLinkResponse>("/api/users/add-external-link", payload)
			.then((r) => r.data),

	updateExternalLink: (id: number, payload: { url: string; label: string }) =>
		apiClient
			.post<UpdateExternalLinkResponse>(`/api/users/external-links/${id}`, payload)
			.then((r) => r.data),

	deleteExternalLink: (id: number) =>
		apiClient.delete<NullResponse>(`/api/users/external-links/${id}`).then((r) => r.data),

	getInterests: () => apiClient.get<InterestsResponse>("/api/users/interests").then((r) => r.data),

	saveInterests: (payload: InterestsPayload) =>
		apiClient.post<InterestsResponse>("/api/users/interests", payload).then((r) => r.data),

	getUsersList: (page = 1) =>
		apiClient.get<UserListResponse>(`/api/users/list?page=${page}`).then((r) => r.data),

	getFriendSuggestions: async (): Promise<FriendSuggestionsResponse> =>
		await apiClient
			.get<FriendSuggestionsResponse>("/api/users/friend-suggestions")
			.then((r) => r.data),

	getFollowers: async (): Promise<FollowersResponse> =>
		await apiClient.get<FollowersResponse>("/api/users/followers").then((r) => r.data),

	getFollowings: async (): Promise<FollowingsResponse> =>
		await apiClient.get<FollowingsResponse>("/api/users/followings").then((r) => r.data),

	followUser: (payload: { followed_user: number }) =>
		apiClient.post<UnknownResponse>("/api/users/follow", payload).then((r) => r.data),

	unfollowUser: (payload: { followed_user: number }) =>
		apiClient.post<UnknownResponse>("/api/users/unfollow", payload).then((r) => r.data),

	setPin: (payload: { pin: string }) =>
		apiClient.post<SetPinResponse>("/api/users/set-pin", payload).then((r) => r.data),
}

export const socialApi = {
	getForYouFeed: async (page = 1): Promise<FeedResponse> =>
		await apiClient.get<FeedResponse>(`/api/socials/for-you-feed?page=${page}`).then((r) => r.data),

	getFollowingFeed: async (page = 1): Promise<FeedResponse> =>
		await apiClient
			.get<FeedResponse>(`/api/socials/following-feed?page=${page}`)
			.then((r) => r.data),

	getFeedByPath: (path: string) => apiClient.get<FeedResponse>(path).then((r) => r.data),

	createPost: (payload: CreatePostPayload) =>
		apiClient.post<CreatePostResponse>("/api/socials/create-post", payload).then((r) => r.data),

	likePost: (payload: { post: string }) =>
		apiClient.post<LikeResponse>("/api/socials/like-post", payload).then((r) => r.data),

	bookmarkPost: (payload: { post: string }) =>
		apiClient.post<BookmarkResponse>("/api/socials/bookmark-post", payload).then((r) => r.data),

	getPostStats: async (id: string) =>
		await apiClient
			.get<PostStatsResponse>(`/api/socials/post-stats/${id}`)
			.then((r) => r.data.data),

	getPostDetail: (pkid: number) =>
		apiClient.get<PostDetailResponse>(`/api/socials/post/${pkid}`).then((r) => r.data),

	getPostComments: (pkid: number, page: number) =>
		apiClient
			.get<CommentsResponse>(`/api/socials/post-comments/${pkid}?page=${page}`)
			.then((r) => r.data),

	getCommentReplies: (commentId: string) =>
		apiClient
			.get<CommentsResponse>(`/api/socials/comment-replies/${commentId}`)
			.then((r) => r.data),

	addComment: (payload: AddCommentPayload) =>
		apiClient.post<AddCommentResponse>("/api/socials/add-comment", payload).then((r) => r.data),

	repost: (payload: RepostPayload) =>
		apiClient.post<RepostResponse>("/api/socials/repost", payload).then((r) => r.data),

	uploadMedia: async (file: File) => {
		const formData = new FormData()
		formData.append("file", file)
		formData.append("folder", "post")

		const res = await apiClient.post<UploadMediaResponse>("/api/socials/upload-media", formData)
		return res.data.data.media_urls
	},
}
