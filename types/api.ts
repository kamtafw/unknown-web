export interface ApiResponse<T> {
	success: boolean
	status_code: number
	message: string | null
	data: T
}

export interface PaginatedResponse<T> {
	count: number
	total_pages: number
	limit: number
	current: number
	previous: string | null
	next: string | null
	results: T[]
}

export type OtpDefault = "email" | "pin" | "2fa"

/** minimal user shape returned by login — enough to drive routing */
export interface LoginUser {
	pkid: number
	id: string
	first_name: string
	last_name: string
	email: string
	username: string
	phone_number: string
	dob: string | null
	dob_visibility: "full" | "partial" | "hidden"
	profile_photo: string
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	otp_default: OtpDefault
	is_active: boolean
	is_administrator: boolean
}

export interface LoginResponseData {
	user: LoginUser
	pre_auth_token: string
}

/** full user shape from `/users/me` */
export interface FullUser {
	pkid: number
	id: string
	first_name: string | null
	last_name: string | null
	email: string
	username: string
	phone_number: string
	dob: string | null
	country: string
	state: string
	date_joined: string
	dob_visibility: "full" | "partial"
	profile_photo: string
	cover_photo: string
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	otp_default: OtpDefault
	is_active: boolean
	is_administrator: boolean
	profile: {
		occupation: string
		interests: string[]
		about_me: string
	}
	external_links: Array<{
		id: number
		url: string
		label: string
	}>
	follower_count: number
	following_count: number
	connection_count: number
}

/** data returned by verify-otp — tokens stay server-side; client gets user + otp_token */
export interface VerifyOtpResponseData {
	user: {
		pkid: number
		id: string
		first_name: string | null
		last_name: string | null
		email: string
		username: string
		phone_number: string
		profile_photo: string
		is_2fa_enabled: boolean
		is_pin_enabled: boolean
		is_active: boolean
	}
	/** opaque token for actions that need OTP re-confirmation */
	otp_token: string
}

export interface LoginPayload {
	identifier: string
	password: string
}

export interface SignupPayload {
	email: string
	phone_number: string
	password: string
}

export interface VerifyOtpPayload {
	email: string
	otp: string
	email_only?: boolean
	need_tokens?: boolean
	need_otp_token?: boolean
	pre_auth_token?: string
}

export interface ResetPasswordPayload {
	email: string
	otp_token: string
	new_password: string
	confirm_password: string
}

export type ResetPasswordResponse = ApiResponse<Record<string, never>>
export type NullResponse = ApiResponse<null>
export type UnknownResponse = ApiResponse<unknown>

export interface PostUser {
	pkid: number
	id: string
	first_name: string
	last_name: string
	email: string
	username: string
	phone_number: string
	profile_photo: string | null
	youBlockedThisUser?: boolean
	youMutedThisUser?: boolean
	youFollowThisUser?: boolean
	thisUserFollowsYou?: boolean
	youAreConnectedThisUser?: boolean
}

export interface PostLocation {
	longitude: string
	latitude: string
	address: string
}

export interface PostMedia {
	external_url: string
}

/** original post (inside a repost)
 * can be a Post or Comment depending on reposted_object_type
 */
export interface OriginalPost {
	id: string
	pkid: number | string
	content_text: string | null
	user: PostUser
	post_location: PostLocation[]
	post_media: PostMedia[]
	post_hashtagged: string[]
	liked_by_me?: boolean
	bookmarked_by_me?: boolean
	reposted_by_me?: boolean
	my_repost_pkid?: number | null
	post_like_count?: number
	post_comment_count?: number
	repost_count?: number
	created_at: string
}

export interface OriginalComment {
	id: string
	pkid: number
	user: PostUser
	post: number /** pkid of the parent Post this comment belongs to */
	message: string | null
	uploaded_media: string[]
	comment_location: PostLocation | null
	comment_hashtagged: string[]
	replies: OriginalComment[] /** The API embeds replies in full on this shape */
	created_at: string
	updated_at?: string
}

export type WhoCanSee = "EVERYONE" | "ONLY_FOLLOWERS"

export type WhoCanReply =
	| "EVERYONE"
	| "ONLY_FOLLOWERS"
	| "ACCOUNTS_YOU_FOLLOW"
	| "VERIFIED_ACCOUNTS"
	| "ONLY_ACCOUNTS_YOU_MENTION"

export interface ViewerPermissions {
	can_view: boolean
	can_reply: boolean
}

export interface Post {
	pkid: number
	id: string
	user: PostUser
	content_text: string
	is_shared: boolean | null
	is_repost: boolean
	is_pinned: boolean | null
	reposted_object_type: "Comment" | "Post" | null
	original_post: OriginalPost | OriginalComment | null
	bookmarked_by_me: boolean
	liked_by_me: boolean
	reposted_by_me: boolean
	my_repost_pkid: number | null
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	created_at: string
	updated_at: string
	post_location: PostLocation[]
	post_media: PostMedia[]
	post_like_count: number
	post_comment_count: number
	repost_count: number
	post_hashtagged: string[]
	viewer_permissions?: ViewerPermissions
}

export interface PostStats {
	total_views: number
	total_reactions: number
	total_comments: number
	total_reposts: number
	total_shares: number
	total_bookmarks: number
	watch_time: string
}

export type FeedResponse = ApiResponse<PaginatedResponse<Post>>

export interface SuggestionUser {
	pkid: number
	id: string
	username: string
	first_name: string
	last_name: string
	email: string
	profile_photo: string
	youFollowThisUser: boolean
	followsYou: boolean
}

export interface FollowerUser {
	pkid: number
	id: string
	username: string
	first_name: string | null
	last_name: string | null
	profile_photo: string
	cover_photo: string
	is_friends: boolean
}

export interface FollowingUser {
	pkid: number
	id: string
	username: string
	first_name: string | null
	last_name: string | null
	profile_photo: string
}

export type FriendSuggestionsResponse = ApiResponse<PaginatedResponse<SuggestionUser>>

export type FollowersResponse = ApiResponse<PaginatedResponse<FollowerUser>>
export type FollowingsResponse = ApiResponse<PaginatedResponse<FollowingUser>>
export type LikeResponse = ApiResponse<{ post_is_liked?: boolean }>
export type BookmarkResponse = ApiResponse<{ created_at?: string }>
export type PostStatsResponse = ApiResponse<PostStats>
export type LikeCommentResponse = ApiResponse<Record<string, never>>

export interface PostCommentDetail {
	pkid: number
	user: number // commenter's pkid
	post: number // comment's parent post pkid
	message: string | null
	created_at: string
	updated_at: string
	uploaded_media: string[]
	comment_location: PostLocation
	comment_hashtagged: string[]
}

export interface Comment {
	id: string
	pkid: number
	user: PostUser
	post: number
	message: string
	parent_comment: number | null
	created_at: string
	updated_at: string
	uploaded_media: string[]
	comment_location: PostLocation | null
	comment_hashtagged: string[]
	like_count: number
	replies_count: number
	repost_count: number
	liked_by_me: boolean
	reposted_by_me: boolean
}

export interface AddCommentPayload {
	post: number
	message?: string
	parent_comment?: number
	hashtags?: string[]
	media_urls?: string[]
	location?: { longitude: string; latitude: string }
}

export interface RepostPayload {
	is_repost: true
	original_post: string
	content_text?: string
	hashtags?: string[]
	media_urls?: string[]
	location?: { longitude: string; latitude: string }
	who_can_reply?: WhoCanReply
	who_can_see?: WhoCanSee
}

export type PostDetailResponse = ApiResponse<Post>
export type CommentsResponse = ApiResponse<PaginatedResponse<Comment>>
export type AddCommentResponse = ApiResponse<Comment>
export type RepostResponse = ApiResponse<{
	repost_id: string
	repost_created_at: string
	original_post: { reposts: { pkid: number; id: string }[] }
}>

export interface RepostCommentPayload {
	is_repost: true
	original_comment: string
	content_text?: string
	hashtags?: string[]
	media_urls?: string[]
	location?: { latitude: string; longitude: string }
}

export type RepostCommentResponse = ApiResponse<{
	data: {
		reposted_by: string
		repost_id: string
		repost_content: string
		repost_created_at: string
		repost_location: PostLocation[]
		repost_media: string[]
		repost_hashtagged: string[]
		original_comment: OriginalComment
	}
}>

export type MediaKind = "image" | "video" | "audio" | "existing"

export interface MediaItem {
	id: string
	file: File
	preview: string
	urls: string[] | null
	uploading: boolean
	error: boolean
}

export type UploadMediaResponse = ApiResponse<{ media_type: string; media_urls: string[] }>

export interface CompleteProfilePayload {
	first_name: string
	last_name: string
	dob: string // YYYY-MM-DD format I guess
}

export interface InterestsPayload {
	interests: string[]
}

export type CompleteProfileResponse = ApiResponse<CompleteProfilePayload>

export type InterestsResponse = ApiResponse<InterestsPayload>

export type UserListResponse = ApiResponse<PaginatedResponse<FullUser>>

export interface CreatePostPayload {
	content_text: string | null
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	is_shared: null
	is_repost: false
	original_post: null
	hashtags?: string[]
	media_urls?: string[]
	location?: { longitude: string; latitude: string }
}

export type CreatePostResponse = ApiResponse<{
	pkid: number
	id: string
	content_text: string | null
	uploaded_media: string[]
	created_at: string[]
}>

export interface ExternalLink {
	id: number
	url: string
	label: string
}

export type UpdateProfilePhotoResponse = ApiResponse<{ profile_photo: string }>
export type UpdateCoverPhotoResponse = ApiResponse<{ cover_photo: string }>
export type UpdateNameResponse = ApiResponse<{ first_name: string; last_name: string }>
export type UpdateUsernameResponse = ApiResponse<{ username: string }>
export type UpdateBioResponse = ApiResponse<{ about_me: string }>
export type UpdateDobResponse = ApiResponse<{ dob: string; last_dob_update: string }>
export type UpdateDobVisibilityResponse = ApiResponse<{ dob_visibility: "full" | "partial" }>
export type UpdateLocationResponse = ApiResponse<{ country: string; state: string }>
export type AddExternalLinkResponse = ApiResponse<ExternalLink>
export type UpdateExternalLinkResponse = ApiResponse<ExternalLink>

export interface ConfirmTwoFaUser {
	id: string
	email: string
	first_name: string | null
	last_name: string | null
	phone_number: string
	profile_photo: string | null
}

export type ChangeOtpDefaultResponse = ApiResponse<{ otp_default: OtpDefault }>
export type SetPinResponse = ApiResponse<Record<string, never>>
export type ConfirmPasswordResponse = ApiResponse<Record<string, never>>
export type GenerateTotpResponse = ApiResponse<{ secret: string; otp_auth_url: string }>
export type VerifyTotpResponse = ApiResponse<Record<string, never>>

export interface LinkedAccount {
	id: number
	first_name: string
	last_name: string
	username: string
	email: string
	phone_number: string
	profile_photo: string
	otp_default: OtpDefault
	is_primary: boolean
	created_at: string
}

export type LinkedAccountsResponse = ApiResponse<{ accounts: LinkedAccount[] }>

export type AddLinkedAccountResponse = ApiResponse<{
	id: number
	user: {
		pkid: number
		id: string
		email: string
		username: string
		first_name: string
		last_name: string
		phone_number: string
		otp_default: OtpDefault
		profile_photo: string
		cover_photo: string
	}
	is_verified: boolean
	created_at: string
}>

export type ConfirmLinkedAccountResponse = ApiResponse<Record<string, never>>

export type SwitchAccountResponse = ApiResponse<{ user: FullUser }>

export interface SwitchOtpDefaultPayload {
	identifier: string
	otp_default: OtpDefault
}

export type SwitchOtpDefaultResponse = ApiResponse<{ otp_default: OtpDefault }>

export type DeleteAccountReason = "privacy" | "not_useful" | "technical" | "other"

export interface DeleteAccountRequest {
	id: number
	email: string
	is_verified: boolean
	reason: string
	feedback: string | null
	deletion_due_date: string | null
	created_at: string
}

export type InitiateDeleteAccountResponse = ApiResponse<{
	request: DeleteAccountRequest
	otp_token: string
}>

export type ConfirmDeleteAccountResponse = ApiResponse<{ request: DeleteAccountRequest }>

export interface SocialAccount {
	platform: string
	linked: boolean
	user_id: string | null
	platform_url: string
	platform_login_url: string
}

export type SocialAccountsResponse = ApiResponse<{ linked_accounts: SocialAccount[] }>
export type SocialLinkResponse = ApiResponse<{ redirect_url: string }>
export type SocialUnlinkResponse = ApiResponse<{ platform: string }>

export type ProblemType = "bug" | "performance" | "crash" | "login" | "payment" | "other"
export type ReportProblemResponse = ApiResponse<{
	report: { problem_type: ProblemType; feedback: string }
}>

export interface TimezoneEntry {
	value: string
	label: string
}

export type TimezonePreferenceResponse = ApiResponse<{ id: number; timezone: string }>
export type TimezoneListResponse = ApiResponse<{ timezones: TimezoneEntry[] }>
export type ChangeTimezoneResponse = ApiResponse<{ id: number; timezone: string }>

export interface BlockedUser {
	pkid: number
	id: string
	email: string
	username: string
	first_name: string
	last_name: string
	phone_number: string
	otp_default: OtpDefault
	profile_photo: string
	cover_photo: string
}

export type BlockedUsersResponse = ApiResponse<PaginatedResponse<BlockedUser>>
export type UnblockUsersResponse = ApiResponse<{ unblocked_ids: number[] }>

export interface UserProfileData {
	id: string
	pkid: number
	username: string
	email: string
	first_name: string | null
	last_name: string | null
	phone_number: string
	dob: string
	dob_visibility: "full" | "partial"
	profile_photo: string | null
	cover_photo: string | null
	country: string
	state: string
	date_joined: string
	profile: {
		occupation: string
		interests: string[]
		about_me: string
	}
	external_links: ExternalLink[]
	follower_count: number
	following_count: number
	connection_count: number
	is_blocked: boolean
	is_muted: boolean
	is_following_you: boolean
	is_user_you_follow: boolean
	is_connected_to_you: boolean
}

export type UserProfileResponse = ApiResponse<UserProfileData>

export type NotInterestedResponse = ApiResponse<Record<string, never>>
export type UndoNotInterestedResponse = ApiResponse<Record<string, never>>
export type RequestNoteResponse = ApiResponse<{ post: string; note_request_id: string }>
export type MuteUserResponse = ApiResponse<Record<string, never>>
export type UnmuteUserResponse = ApiResponse<Record<string, never>>
export type BlockUserResponse = ApiResponse<{ blocked_user: number }>

export interface UpdatePostPayload {
	content_text?: string
	who_can_see?: WhoCanSee
	who_can_reply?: WhoCanReply
	location?: { longitude: string; latitude: string } | null
	hashtags?: string[]
	media_urls?: string[]
}

export interface UpdatePostResponseData {
	pkid: number
	id: string
	user: number
	content_text: string
	is_shared: boolean | null
	is_repost: boolean
	original_post: OriginalPost | OriginalComment | null
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	created_at: string
	updated_at: string
	uploaded_media: string[]
	post_location: PostLocation[]
	post_hashtagged: string[]
}

export type UpdatePostResponse = ApiResponse<UpdatePostResponseData>
export type DeletePostResponse = ApiResponse<Record<string, never>>

export interface TogglePinnedPostResponseData {
	message: string
	is_pinned: boolean
}
export type TogglePinnedPostResponse = ApiResponse<TogglePinnedPostResponseData>

export interface MentionUser {
	pkid: number
	id: string
	email: string
	username: string
	first_name: string
	last_name: string
	phone_number: string
	profile_photo: string | null
	youFollowThisUser: boolean
}

export type MentionSearchResponse = ApiResponse<PaginatedResponse<MentionUser>>

export interface UserReplyParentComment {
	id: string
	pkid: number
	user: PostUser
	message: string | null
	created_at: string
}

export interface UserReplyItem {
	id: string
	pkid: number
	user: PostUser
	post: Post
	message: string | null
	parent_comment: UserReplyParentComment
	created_at: string
	updated_at: string
	uploaded_media: string[]
	comment_location: PostLocation | null
	comment_hashtagged: string[]
	like_count: number
	replies_count: number
	repost_count: number
	liked_by_me: boolean
	reposted_by_me: boolean
}

export type UserRepliesResponse = ApiResponse<PaginatedResponse<UserReplyItem>>

export type FeedPollType = "user_feed" | "following_feed"

export interface FeedCheckData {
	has_new_posts: boolean
	count: number
}

export type FeedCheckResponse = ApiResponse<FeedCheckData>
