import { OriginalComment, OriginalPost, Post } from "@/types/api"

export function isOriginalComment(
	obj: OriginalPost | OriginalComment | null | undefined,
): obj is OriginalComment {
	return !!obj && "message" in obj
}

/** true when `post` is a bare repost — no quote text — of another Post (not a Comment) */
export function isUnquotedPostRepost(post: Post): post is Post & { original_post: OriginalPost } {
	return (
		post.is_repost &&
		!post.content_text?.trim() &&
		post.reposted_object_type === "Post" &&
		!!post.original_post &&
		!isOriginalComment(post.original_post)
	)
}

/**
 * returns the Post-shaped object that should drive every engagement affordance —
 * like/comment/repost/bookmark counts and my-interaction flags — for a card
 */
export function resolveEngagementPost(post: Post): Post {
	if (!isUnquotedPostRepost(post)) return post
	const original = post.original_post

	return {
		...post,
		id: original.id,
		pkid: typeof original.pkid === "number" ? original.pkid : Number(original.pkid),
		user: original.user,
		content_text: original.content_text ?? "",
		post_media: original.post_media,
		post_location: original.post_location,
		post_hashtagged: original.post_hashtagged,
		created_at: original.created_at,
		is_repost: false,
		is_shared: null,
		reposted_object_type: null,
		original_post: null,
		post_like_count: original.post_like_count ?? 0,
		post_comment_count: original.post_comment_count ?? 0,
		repost_count: original.repost_count ?? 0,
		liked_by_me: original.liked_by_me ?? false,
		bookmarked_by_me: original.bookmarked_by_me ?? false,
		reposted_by_me: original.reposted_by_me ?? false,
	}
}

/**
 * normalizes whatever engagement entity we found (a real Post, or an OriginalPost
 * nested inside someone's repost) into a full Post shape — needed when inserting
 * it as a standalone card, e.g. into the Bookmarks feed
 */
export function toStandalonePost(entity: Post | OriginalPost): Post {
	if ("is_repost" in entity) return entity

	const original = entity
	return {
		pkid: typeof original.pkid === "number" ? original.pkid : Number(original.pkid),
		id: original.id,
		user: original.user,
		content_text: original.content_text ?? "",
		is_shared: null,
		is_repost: false,
		is_pinned: null,
		reposted_object_type: null,
		original_post: null,
		bookmarked_by_me: original.bookmarked_by_me ?? false,
		liked_by_me: original.liked_by_me ?? false,
		reposted_by_me: original.reposted_by_me ?? false,
		who_can_see: "EVERYONE",
		who_can_reply: "EVERYONE",
		created_at: original.created_at,
		updated_at: original.created_at,
		post_location: original.post_location,
		post_media: original.post_media,
		post_like_count: original.post_like_count ?? 0,
		post_comment_count: original.post_comment_count ?? 0,
		repost_count: original.repost_count ?? 0,
		post_hashtagged: original.post_hashtagged,
	}
}
