/**
 * Centralized Socials query-key registry.
 */

import { SocialContent } from "@/types/socials/api"
import { InfiniteData } from "@tanstack/react-query"

export const feedKeys = {
	all: ["feed"] as const,

	forYou: () => [...feedKeys.all, "for-you"] as const,
	following: () => [...feedKeys.all, "following"] as const,
	bookmarks: () => [...feedKeys.all, "bookmarks"] as const,

	engagement: () => [feedKeys.forYou(), feedKeys.following(), feedKeys.bookmarks()] as const,
}

/**
 * Any single SocialContent by id — post, comment, or reply. One identity
 * namespace regardless of which endpoint populated it (usePostDetail vs.
 * useContentDetail both write here). See
 * docs/social/social-content-migration-inspection.md S~9.
 *
 * Direct children of any content id — a post's top-level comments and a
 * comment/reply's direct replies both live under the same key shape, just
 * with a different parentId. This is what makes the thread genuinely
 * depth-agnostic (migration doc S~9/S~10): the same cache identity model
 * works no matter how deep `parentId` is.
 *
 * NOTE: the *fetcher* still differs by parent kind (usePostComments calls
 * the post-comments endpoint; useContentReplies calls the comment-replies
 * endpoint) because the backend genuinely exposes two different read
 * endpoints for "children of a post" vs "children of a comment/reply" —
 * unifying the query *key* without pretending there's one backend call
 * where there are two. See migration doc S~8.
 */
export const contentKeys = {
	all: ["content"] as const,

	details: () => [...contentKeys.all, "detail"] as const,
	detail: (contentId: string) => [...contentKeys.details(), contentId] as const,

	children: () => [...contentKeys.all, "children"] as const,
	child: (parentId: string) => [...contentKeys.children(), parentId] as const,
}

export const profileFeedKeys = {
	all: ["profile-feed"] as const,

	posts: (id: string) => [...profileFeedKeys.all, "posts", id] as const,
	reposts: (id: string) => [...profileFeedKeys.all, "reposts", id] as const,
	liked: (id: string) => [...profileFeedKeys.all, "liked", id] as const,
	media: (id: string) => [...profileFeedKeys.all, "media", id] as const,
	replies: (id: string) => [...profileFeedKeys.all, "replies", id] as const,
}

/**
 * Consolidated from 9 identical local definitions across
 * hooks/socials/use-post-actions.ts, use-create-post.ts, use-post-detail.ts,
 * use-repost.ts, lib/socials/content-engagement.ts, and (previously typed
 * against a different, unrelated Post interface) hooks/use-block-actions.ts,
 * use-post-interactions.ts, use-mute-actions.ts, use-follow-actions.ts.
 *
 * One of those nine (use-block-actions.ts) was importing `Post` from the
 * old, pre-migration `@/types/api` — a structurally different, dead type
 * (still had `pkid`/`content_text`) rather than the canonical
 * `SocialContent` alias every other file used. It happened not to error
 * because the only field that file actually touches (`p.user.pkid`) exists
 * on both shapes — but the annotation was wrong regardless. This
 * consolidation corrects that as a side effect, not a separate change.
 */
export type FeedCache = InfiniteData<{ posts: SocialContent[]; nextPage: string | null }>
