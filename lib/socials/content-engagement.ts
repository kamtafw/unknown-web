import { CommentsResponse, SocialContent } from "@/types/socials/api"
import { InfiniteData, QueryClient } from "@tanstack/react-query"
import { contentKeys, FeedCache, feedKeys } from "./query-keys"

// Replaces the pre-migration lib/post-engagement.ts (posts-only) and
// lib/comment-engagement.ts (comments-only) — two independent systems doing
// the same job for two different shapes. Now that Post/Comment/Reply are
// one canonical SocialContent, there's one patcher. See
// docs/social/social-content-migration-inspection.md S~14, S~16 risk item 6.

/**
 * A patch for `applyContentPatch` below. Top-level fields overwrite as
 * normal; the four nested state objects merge shallowly *within
 * themselves* instead of replacing the whole sub-object. This matters
 * because the canonical contract nests engagement state (`metrics.likes`,
 * `metrics.reposts`, `metrics.replies`, ... all under one object) where the
 * pre-migration types had them as flat top-level fields — a naive
 * `{...content, ...patch}` merge on `{metrics: {reposts: 5}}` would
 * silently wipe out `likes`/`replies`/every other metric. This is a
 * correctness fix that applies to every mutation hook, not just one.
 */
export type SocialContentPatch = Partial<
	Omit<SocialContent, "metrics" | "viewer" | "flags" | "permissions">
> & {
	metrics?: Partial<SocialContent["metrics"]>
	viewer?: Partial<SocialContent["viewer"]>
	flags?: Partial<SocialContent["flags"]>
	permissions?: Partial<SocialContent["permissions"]>
}

export function applyContentPatch(base: SocialContent, patch: SocialContentPatch): SocialContent {
	return {
		...base,
		...patch,
		metrics: patch.metrics ? { ...base.metrics, ...patch.metrics } : base.metrics,
		viewer: patch.viewer ? { ...base.viewer, ...patch.viewer } : base.viewer,
		flags: patch.flags ? { ...base.flags, ...patch.flags } : base.flags,
		permissions: patch.permissions
			? { ...base.permissions, ...patch.permissions }
			: base.permissions,
	}
}

type ChildrenCache = InfiniteData<CommentsResponse>

/**
 * Finds whichever occurrence of `id` currently holds engagement state — a
 * direct feed post, or nested inside someone's bare repost of it — across
 * every feed cache. Bare reposts don't carry their own engagement state, so
 * their `original` is checked too.
 */
export function findEngagementEntity(qc: QueryClient, id: string): SocialContent | undefined {
	for (const key of feedKeys.engagement()) {
		const cache = qc.getQueryData<FeedCache>(key)
		for (const page of cache?.pages ?? []) {
			for (const p of page.posts) {
				if (p.id === id) return p
				if (p.original && p.original.id === id) return p.original
			}
		}
	}
	return undefined
}

/** Searches every currently-mounted content-detail query — post, comment,
 * or reply alike, since they all share `contentDetailKeys`. */
export function findDetailEntity(qc: QueryClient, id: string): SocialContent | undefined {
	const entries = qc.getQueriesData<SocialContent>({ queryKey: contentKeys.details() })
	for (const [, data] of entries) {
		if (data && data.id === id) return data
	}
	return undefined
}

/** Searches every currently-mounted direct-children query — top-level
 * comments of any post, or replies of any comment/reply at any depth,
 * since they all share `contentChildrenKeys`. */
export function findChildEntity(qc: QueryClient, id: string): SocialContent | undefined {
	const entries = qc.getQueriesData<ChildrenCache>({ queryKey: contentKeys.children() })
	for (const [, data] of entries) {
		for (const page of data?.pages ?? []) {
			const found = page.data.results.find((c) => c.id === id)
			if (found) return found
		}
	}
	return undefined
}

/**
 * Feeds first (cheap, covers the common case), then any open content-detail
 * page, then any open direct-children list — needed because content
 * reached via direct link/share, or a reply that's never been paged into
 * its parent's children list, may not be in a feed cache at all.
 */
export function findEngagementEntityAnywhere(
	qc: QueryClient,
	id: string,
): SocialContent | undefined {
	return findEngagementEntity(qc, id) ?? findDetailEntity(qc, id) ?? findChildEntity(qc, id)
}

/** Applies `patch` to every occurrence of `id` — direct and nested inside a
 * bare repost — across all feed caches. */
export function patchEngagementInFeeds(qc: QueryClient, id: string, patch: SocialContentPatch) {
	feedKeys.engagement().forEach((key) => {
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.map((p) => {
						if (p.id === id) return applyContentPatch(p, patch)
						if (p.original && p.original.id === id) {
							return { ...p, original: applyContentPatch(p.original, patch) }
						}
						return p
					}),
				})),
			}
		})
	})
}

/** Patches every open content-detail query matching `id` — works whether
 * that detail query is a post, a comment, or a reply. */
export function patchDetailEverywhere(qc: QueryClient, id: string, patch: SocialContentPatch) {
	qc.setQueriesData<SocialContent>({ queryKey: contentKeys.details() }, (old) =>
		old && old.id === id ? applyContentPatch(old, patch) : old,
	)
}

/** Patches `id` wherever it appears inside any mounted direct-children
 * list — a top-level comment list, or a replies list at any depth. */
export function patchChildrenEverywhere(qc: QueryClient, id: string, patch: SocialContentPatch) {
	qc.setQueriesData<ChildrenCache>({ queryKey: contentKeys.children() }, (old) => {
		if (!old) return old
		return {
			...old,
			pages: old.pages.map((page) => ({
				...page,
				data: {
					...page.data,
					results: page.data.results.map((c) => (c.id === id ? applyContentPatch(c, patch) : c)),
				},
			})),
		}
	})
}

/**
 * The single engagement-patch entry point for the whole app. Patches feeds,
 * any open detail query, and any open direct-children list in one call —
 * works identically for a post, a top-level comment, or a reply at any
 * depth, which is the whole point of the merge.
 */
export function patchEngagementEverywhere(qc: QueryClient, id: string, patch: SocialContentPatch) {
	patchEngagementInFeeds(qc, id, patch)
	patchDetailEverywhere(qc, id, patch)
	patchChildrenEverywhere(qc, id, patch)
}
