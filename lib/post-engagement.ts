import { feedKeys } from "@/hooks/use-feed"
import { isOriginalComment, isUnquotedPostRepost } from "@/lib/post-helpers"
import { OriginalPost, Post } from "@/types/api"
import { InfiniteData, QueryClient } from "@tanstack/react-query"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

const ENGAGEMENT_FEED_KEYS = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks] as const

type EntityMatcher = { id: string; pkid?: never } | { pkid: number; id?: never }

/**
 * finds whichever occurrence of `id`/`pkid` currently holds engagement state — a direct
 * feed post, or nested inside someone's bare repost of it — across every feed
 * cache; bare reposts don't carry their own engagement state, so their
 * `original_post` is checked too
 */
export function findEngagementEntity(
	qc: QueryClient,
	matcher: EntityMatcher,
): Post | OriginalPost | undefined {
	const match =
		matcher.id !== undefined
			? (p: Post | OriginalPost) => p.id === matcher.id
			: (p: Post | OriginalPost) => p.pkid === matcher.pkid

	for (const key of ENGAGEMENT_FEED_KEYS) {
		const cache = qc.getQueryData<FeedCache>(key)
		for (const page of cache?.pages ?? []) {
			for (const p of page.posts) {
				if (match(p)) return p
				if (p.original_post && !isOriginalComment(p.original_post) && match(p.original_post)) {
					return p.original_post
				}
			}
		}
	}
	return undefined
}

/** searches every currently-mounted post-detail query (["post","detail", pkid]) */
export function findDetailEntity(qc: QueryClient, matcher: EntityMatcher): Post | undefined {
	const match =
		matcher.id !== undefined
			? (p: Post) => p.id === matcher.id
			: (p: Post) => p.pkid === matcher.pkid

	const entries = qc.getQueriesData<Post>({ queryKey: ["post", "detail"] })
	for (const [, data] of entries) {
		if (data && match(data)) return data
	}
	return undefined
}

/**
 * feeds first (cheap, covers the common case), then falls back to any open
 * post-detail page — needed because a post reached via direct link/share
 * may never have been paged into a feed cache
 */
export function findEngagementEntityAnywhere(
	qc: QueryClient,
	matcher: EntityMatcher,
): Post | OriginalPost | undefined {
	return findEngagementEntity(qc, matcher) ?? findDetailEntity(qc, matcher)
}

/** applies `patch` to every occurrence of `id` — direct and nested — across all feed caches */
export function patchEngagementInFeeds(qc: QueryClient, id: string, patch: Partial<Post>) {
	ENGAGEMENT_FEED_KEYS.forEach((key) => {
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.map((p) => {
						if (p.id === id) return { ...p, ...patch }
						if (
							p.original_post &&
							!isOriginalComment(p.original_post) &&
							p.original_post.id === id
						) {
							return { ...p, original_post: { ...p.original_post, ...patch } as OriginalPost }
						}
						return p
					}),
				})),
			}
		})
	})
}

/**
 * mirrors patchEngagementInFeeds but also patches any open post-detail
 * query for the same post — without this, liking/bookmarking/reposting
 * from a post's own detail page wouldn't update that page until refetch
 */
export function patchEngagementEverywhere(qc: QueryClient, id: string, patch: Partial<Post>) {
	patchEngagementInFeeds(qc, id, patch)

	qc.setQueriesData<Post>({ queryKey: ["post", "detail"] }, (old) =>
		old && old.id === id ? { ...old, ...patch } : old,
	)
}

/** finds the pkid of *my* bare repost of `originalPostId`, if it's in any loaded feed cache */
export function findMyRepostPkid(
	qc: QueryClient,
	originalPostId: string,
	myPkid: number,
): number | undefined {
	for (const key of ENGAGEMENT_FEED_KEYS) {
		const cache = qc.getQueryData<FeedCache>(key)
		for (const page of cache?.pages ?? []) {
			for (const p of page.posts) {
				if (
					isUnquotedPostRepost(p) &&
					p.user.pkid === myPkid &&
					p.original_post.id === originalPostId
				) {
					return p.pkid
				}
			}
		}
	}
	return undefined
}
