export interface ApiResponse<T> {
	success: boolean
	status_code: number
	message: string
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
	dob_visibility: "full" | "partial" | "hidden"
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
	need_tokens?: boolean
	need_otp_token?: boolean
}

export interface PostUser {
	pkid: number
	id: string
	first_name: string
	last_name: string
	email: string
	username: string
	phone_number: string
	profile_photo: string | null
}

export interface PostLocation {
	pkid: number
	id: string
	longitude: string
	latitude: string
	address: string
	created_at: string
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
	updated_at: string
}

export type WhoCanSee = "EVERYONE" | "ONLY_FOLLOWERS"

export type WhoCanReply =
	| "EVERYONE"
	| "ONLY_FOLLOWERS"
	| "ACCOUNTS_YOU_FOLLOW"
	| "VERIFIED_ACCOUNTS"
	| "ONLY_ACCOUNTS_YOU_MENTION"

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
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	created_at: string
	updated_at: string
	post_location: PostLocation[]
	post_media: PostMedia[]
	post_like_count: number
	post_comment_count: number
	repost_count: number
	post_reaction: unknown[]
	post_hashtagged: string[]
	post_bookmarked: unknown[]
	post_comment: unknown[]
	post_liked: unknown[]
	reposts: unknown[]
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

export interface UsersListData {
	count: number
	next: string | null
	previous: string | null
	results: SuggestionUser[]
}

export interface UsersListResponse {
	success: boolean
	status_code: number
	message: string | null
	data: UsersListData
}

export type FriendSuggestionsResponse = ApiResponse<PaginatedResponse<SuggestionUser>>

export type FollowersResponse = ApiResponse<PaginatedResponse<FollowerUser>>
export type FollowingsResponse = ApiResponse<PaginatedResponse<FollowingUser>>
export type LikeResponse = ApiResponse<{ post_is_liked?: boolean } | {}>
export type BookmarkResponse = ApiResponse<{ created_at?: string } | {}>
export type PostStatsResponse = ApiResponse<PostStats>

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

export interface PostDetail {
	pkid: number
	id: string
	user: PostUser
	content_text: string
	bookmarked_by_me: boolean
	liked_by_me: boolean
	is_shared: boolean | null
	is_repost: boolean
	original_post: OriginalPost | null
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	created_at: string
	updated_at: string
	post_location: PostLocation[]
	post_media: PostMedia[]
	post_bookmarked: Array<{ pkid: number; user: number; post: number; created_at: string }>
	post_liked: Array<{
		pkid: number
		user: number
		post: number
		post_is_liked: boolean
		created_at: string
	}>
	post_like_count: number
	post_comment: PostCommentDetail[]
	post_comment_count: number
	repost: unknown[]
	repost_count: number
	post_hashtagged: string[]
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

export type PostDetailResponse = ApiResponse<PostDetail>
export type CommentsResponse = ApiResponse<PaginatedResponse<Comment>>
