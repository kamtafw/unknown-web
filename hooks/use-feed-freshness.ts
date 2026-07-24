"use client"

import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { FeedPollType, Post } from "@/types/api"
import { InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDocumentVisible } from "./use-document-visible"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

const POLL_INTERVAL_MS = 30_000

function buildDeltaPath(basePath: string, sinceIso: string, sort?: "newest") {
	const params = new URLSearchParams({ since_timestamp: sinceIso })
	if (sort) params.set("sort", sort)
	return `${basePath}?${params.toString()}`
}

/** prepends only the posts that aren't already in the cache — since_timestamp
 * fetches can legitimately overlap with what's already loaded at the boundary */
function mergeNewPosts(old: FeedCache | undefined, incoming: Post[]): FeedCache | undefined {
	if (!old || !incoming.length) return old

	const existingIds = new Set(old.pages.flatMap((page) => page.posts.map((p) => p.id)))
	const toInsert = incoming.filter((p) => !existingIds.has(p.id))
	if (!toInsert.length) return old

	return {
		...old,
		pages: old.pages.map((page, i) =>
			i === 0 ? { ...page, posts: [...toInsert, ...page.posts] } : page,
		),
	}
}

interface UseFeedFreshnessArgs {
	feedType: FeedPollType
	feedQueryKey: readonly unknown[]
	basePath: string
	deltaSort?: "newest" /** only meaningful for the For You feed; leave undefined for Following */
	currentPosts: Post[] /** flattened posts currently rendered — used once to seed the anchor */
	isActive: boolean /** whether this feed's tab is the one currently in view */
}

export function useFeedFreshness({
	feedType,
	feedQueryKey,
	basePath,
	deltaSort,
	currentPosts,
	isActive,
}: UseFeedFreshnessArgs) {
	const qc = useQueryClient()
	const documentVisible = useDocumentVisible()
	const currentUserPkid = useAuthStore((s) => s.user?.pkid)

	const [anchor, setAnchor] = useState<string | null>(null)
	const anchorSeededRef = useRef(false)

	// seed once from whatever's already at the top of the feed; re-seeding
	// would happen naturally after a manual invalidate/refetch too since
	// currentPosts[0] would just change and the ref guard would need reset —
	// not needed here since applyNewPosts() manages the anchor going forward
	useEffect(() => {
		if (anchorSeededRef.current || currentPosts.length === 0) return
		anchorSeededRef.current = true
		setAnchor(currentPosts[0].created_at)
	}, [currentPosts])

	const pollingEnabled = isActive && documentVisible && anchor !== null

	const checkQuery = useQuery({
		queryKey: ["feed", "check", feedType, anchor],
		queryFn: () => socialApi.checkNewPosts({ feed_type: feedType, since_timestamp: anchor! }),
		enabled: pollingEnabled,
		refetchInterval: pollingEnabled ? POLL_INTERVAL_MS : false,
		refetchOnWindowFocus: false,
		staleTime: 0,
	})

	const rawHasNewPosts = checkQuery.data?.data.has_new_posts ?? false
	const rawNewPostCount = checkQuery.data?.data.count ?? 0

	// prefetches the real posts as soon as `check` says there's something new,
	// so the pill can show avatars and clicking it is instant, not a spinner;
	// keying on newPostCount means a growing tally while the pill is showing
	// (someone else posts again before you click) silently pulls in the bigger batch
	const pendingQuery = useQuery({
		queryKey: ["feed", "pending", feedType, anchor, rawNewPostCount],
		queryFn: () =>
			socialApi
				.getFeedByPath(buildDeltaPath(basePath, anchor!, deltaSort))
				.then((res) => res.data.results as Post[]),
		enabled: pollingEnabled && rawHasNewPosts,
		staleTime: 0,
	})

	const rawPending = pendingQuery.data ?? []

	const pendingPosts = useMemo(() => {
		if (!rawPending) return []

		const cache = qc.getQueryData<FeedCache>(feedQueryKey)
		const alreadyVisibleIds = new Set(
			cache?.pages.flatMap((page) => page.posts.map((p) => p.id)) ?? [],
		)

		return rawPending.filter((p) => p.user.pkid !== currentUserPkid && !alreadyVisibleIds.has(p.id))
	}, [rawPending, currentUserPkid, qc, feedQueryKey])

	const hasNewPosts = pendingPosts.length > 0
	const newPostCount = pendingPosts.length

	const applyNewPosts = useCallback((): string[] => {
		if (!pendingPosts.length) return []

		qc.setQueryData<FeedCache>(feedQueryKey, (old) => mergeNewPosts(old, pendingPosts))

		const newestIso = pendingPosts.reduce(
			(latest, p) => (p.created_at > latest ? p.created_at : latest),
			pendingPosts[0].created_at,
		)
		setAnchor(newestIso)
		qc.removeQueries({ queryKey: ["feed", "pending", feedType] })

		return pendingPosts.map((p) => p.id)
	}, [pendingPosts, qc, feedQueryKey, feedType])

	return {
		hasNewPosts,
		newPostCount,
		pendingPosts,
		isLoadingPending: rawHasNewPosts && pendingQuery.isFetching && rawPending.length === 0,
		applyNewPosts,
	}
}
