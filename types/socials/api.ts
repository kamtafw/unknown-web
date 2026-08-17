import { ApiResponse, PaginatedResponse } from "../api"

export type WhoCanSee = "EVERYONE" | "ONLY_FOLLOWERS"

export type WhoCanReply =
	| "EVERYONE"
	| "ONLY_FOLLOWERS"
	| "ACCOUNTS_YOU_FOLLOW"
	| "VERIFIED_ACCOUNTS"
	| "ONLY_ACCOUNTS_YOU_MENTION"

export type SocialContentKind = "post" | "comment" | "reply"

/**
 * Author of a piece content. `pkid` is not part of the canonical
 * contract's `user` shape, but is preserved here because it identifies a
 * *user*, not a piece of social content — it's still required by code this
 * migration doesn't touch: AuthorHoverCard, follow/mute/block actions, and
 * user profile routing (`profile/[pkid]`). Carrying it forward is not
 * inventing a field; it's the same author-user shape the API already
 * returns today. See migration doc S~2.7.
 */
export interface SocialContentUser {
	id: string
	pkid: number
	username: string
	first_name: string
	last_name: string
	profile_photo: string | null
	youBlockedThisUser?: boolean
	youMutedThisUser?: boolean
	youFollowThisUser?: boolean
	thisUserFollowsYou?: boolean
	youAreConnectedThisUser?: boolean
}

/** Alias — same shape, kept so existing "author" call sites (AuthorHoverCard,
 * follow/mute/block, profile nav) don't have to be touched by this migration */
export type PostUser = SocialContentUser

/** Read-shape location. Note lat/long are numbers here, unlike the write
 * payloads below (which stay string-keyed geolocation coords, matching what
 * `navigator.geolocation` already promises at the call sites) — this
 * asymmetry is in the contract as given, not a mistake. */
export interface SocialContentLocation {
	latitude: number
	longitude: number
	address: string
}

export interface SocialContentMetrics {
	likes: number
	replies: number /** direct children only — never a total descendant count */
	reposts: number
	reactions: number
	shares: number
	bookmarks: number
	views: number
}

export interface SocialContentViewerState {
	liked: boolean
	reposted: boolean
	bookmarked: boolean
	shared: boolean
}

export interface SocialContentPermissions {
	visibility: WhoCanSee
	reply_policy: WhoCanReply
	can_view: boolean
	can_reply: boolean
}

export interface SocialContentFlags {
	pinned: boolean
	repost: boolean
	shared: boolean
}

export interface SocialContent {
	id: string
	kind: SocialContentKind

	/** Root conversation identity. null only for a post itself. */
	post_id: string | null
	/** Immediate parent identity. null for a post and for a top-level
	 * comment; for a reply, this is the comment/reply directly above it,
	 * never the root post. */
	parent_id: string | null

	user: SocialContentUser

	/** Read-shape field name is `message` per contract, even though the
	 * write payloads below use `content` — this is an intentional asymmetry
	 * in the supplied contract, not a bug to "fix" into consistency. */
	message: string
	media: string[]

	location: SocialContentLocation | null
	hashtags: string[]
	metrics: SocialContentMetrics
	viewer: SocialContentViewerState
	permissions: SocialContentPermissions
	flags: SocialContentFlags

	/** Present only on reposts. A repost's `original` never itself has a
	 * repost — `original.original` must always be null. `original.kind` can
	 * be `post`, `comment`, or `reply`; never assume it's always `post`. */
	original: SocialContent | null

	/**
	 * Points at *my own* repost of this content, if any — powers "Undo
	 * repost" (delete that repost by id). Not part of the supplied
	 * contract's `viewer` object; this is a frontend-observed need carried
	 * forward from the old `my_repost_pkid` field, UNVERIFIED against the
	 * new backend response, See migration doc S~4 and S~17.
	 */
	my_repost_id: string | null

	created_at: string
	updated_at: string
}

export function isPost(content: SocialContent): boolean {
	return content.kind === "post"
}

export function isComment(content: SocialContent): boolean {
	return content.kind === "comment"
}

export function isReply(content: SocialContent): boolean {
	return content.kind === "reply"
}

/** Semantic aliases — NOT separate types. `Post`/`Comment` are the exact
 * same canonical `SocialContent` shape; the alias exists so call sites can
 * express intent (`post: Post`) without every signature reading
 * `SocialContent`. Never add a field to one alias that isn't on
 * `SocialContent` itself — that would silently recreate the old
 * fragmented-type problem this migration removes. */
export type Post = SocialContent
export type Comment = SocialContent

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

export type LikeResponse = ApiResponse<{ post_is_liked?: boolean }>
export type BookmarkResponse = ApiResponse<{ created_at?: boolean }>
export type PostStatsResponse = ApiResponse<PostStats>
export type LikeCommentResponse = ApiResponse<Record<string, never>>

// PostCommentDetail removed — confirmed zero imports anywhere in the repo
// (dead code, unrelated mechanically to this migration; deleted alongside it
// rather than left as confusing dead weight next to the new model). See
// migration doc S~6.

// `Comment` is now the `SocialContent` alias defined above — no separate
// interface. `AddCommentPayload` splits into `CreateCommentPayload` /
// `CreateReplyPayload` below so that sending both `post_id` and `parent_id`,
// or neither, is a type error rather than a runtime bug (this directly
// supports the "never blur post_id vs parent_id" rule — migration doc S~10).

export interface CreateCommentPayload {
	post_id: string
	content: string
	medial_urls?: string[]
	hashtags?: string[]
	location?: { longitude: string; latitude: string } | null
}

export interface CreateReplyPayload {
	parent_id: string
	content: string
	medial_urls?: string[]
	hashtags?: string[]
	location?: { longitude: string; latitude: string } | null
}

export interface UpdateContentPayload {
	content?: string
	medial_urls?: string[]
	hashtags?: string[]
	location?: { longitude: string; latitude: string } | null
}

export interface UpdatePostPayload extends UpdateContentPayload {
	who_can_see?: WhoCanSee
	who_can_reply?: WhoCanReply
}

/** `original_post`/`original_comment` field names on the repost payloads
 * below are kept as-is (not renamed to e.g. `original_id`) — they already
 * send a UUID string today (`types/api.ts` pre-migration), and the field
 * name itself isn't covered by the canonical write-field list (`content`,
 * `media_urls`, `post_id`, `parent_id`). Renaming it would be inventing a
 * backend field name with no evidence. See migration doc S~8. */
export interface RepostPayload {
	is_repost: true
	original_post: string
	content?: string
	hashtags?: string[]
	media_urls?: string[]
	location?: { longitude: string; latitude: string }
	who_can_reply?: WhoCanReply
	who_can_see?: WhoCanSee
}

export type PostDetailResponse = ApiResponse<SocialContent>
export type CommentsResponse = ApiResponse<PaginatedResponse<SocialContent>>
export type AddCommentResponse = ApiResponse<SocialContent>
export type RepostResponse = ApiResponse<{
	repost_id: string
	repost_created_at: string
	original_post: { reposts: { id: string }[] }
}>

export interface RepostCommentPayload {
	is_repost: true
	original_comment: string
	content?: string
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
		repost_location: SocialContentLocation | null
		repost_media: string[]
		repost_hashtagged: string[]
		original_comment: SocialContent
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

/** `is_shared`/`is_repost`/`original_post` discriminator fields the old
 * payload sent on every create-post call are dropped — the canonical create
 * example in the contract doesn't include them. See migration doc S~8. */
export interface CreatePostPayload {
	content: string | null
	who_can_see: WhoCanSee
	who_can_reply: WhoCanReply
	hashtags?: string[]
	media_urls?: string[]
	location?: { latitude: string; longitude: string } | null
	use_live_location?: boolean
}

export type CreatePostResponse = ApiResponse<SocialContent>

// Comment/reply edit and delete are new integrations — confirmed zero
// existing frontend implementation for either (no hook, no route, no UI).
// See migration doc S~8/S~11. Payload shape mirrors UpdateContentPayload
// exactly since relationship fields (id/kind/post_id/parent_id) are
// immutable and never sent.
export type UpdateCommentPayload = UpdateContentPayload
export type EditCommentResponse = ApiResponse<SocialContent>
export type DeleteCommentResponse = ApiResponse<Record<string, never>>

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

// UserReplyItem / UserReplyParentComment removed per decision — the profile
// "Replies" tab now consumes the same canonical SocialContent as every other
// surface (kind: "reply"), not a third frontend-only shape.
//
// OPEN QUESTION carried from the migration doc (S~17), not silently
// resolved here: the old UserReplyParentComment gave the Replies tab a
// preview of what was replied to (parent's author + message) without an
// extra fetch. The canonical SocialContent object has no "preview of my
// parent" field — only parent_id. If the backend's new
// user-handle/{id}/replies response doesn't supply an equivalent preview
// alongside the canonical object, the specific tab's UX regresses until
// resolved with the backend team. Do not paper over this with a per-row
// fetch of the parent (N+1, against the "no speculative fetching guidance")
// — surface it instead.
export type UserRepliesResponse = ApiResponse<PaginatedResponse<SocialContent>>

export type FeedPollType = "user_feed" | "following_feed"

export interface FeedCheckData {
	has_new_posts: boolean
	count: number
}

export type FeedCheckResponse = ApiResponse<FeedCheckData>
