import { feedKeys } from "@/hooks/use-feed"
import { isOriginalComment } from "@/lib/post-helpers"
import { OriginalPost, Post } from "@/types/api"
import { InfiniteData, QueryClient } from "@tanstack/react-query"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

const ENGAGEMENT_FEED_KEYS = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks] as const

/**
 * finds whichever occurrence of `id` currently holds engagement state — a direct
 * feed post, or nested inside someone's bare repost of it — across every feed
 * cache; bare reposts don't carry their own engagement state, so their
 * `original_post` is checked too
 */
export function findEngagementEntity(qc: QueryClient, id: string): Post | OriginalPost | undefined {
	for (const key of ENGAGEMENT_FEED_KEYS) {
		const cache = qc.getQueryData<FeedCache>(key)
		for (const page of cache?.pages ?? []) {
			for (const p of page.posts) {
				if (p.id === id) return p
				if (p.original_post && !isOriginalComment(p.original_post) && p.original_post.id === id) {
					return p.original_post
				}
			}
		}
	}
	return undefined
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
