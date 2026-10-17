"use client"

import { EVENTS_PAGE_SIZE, NEARBY_RADIUS_KM } from "@/lib/events/constants"
import { eventsApi } from "@/lib/events/api"
import { flattenPages } from "@/lib/events/normalize"
import {
	searchCoverage,
	shouldAdvancePastEmptyPage,
	shouldScanForSearch,
	trailingEmptyPages,
} from "@/lib/events/pagination"
import { eventKeys } from "@/lib/events/query-keys"
import { filterNearbyEvents, normalizeQuery } from "@/lib/events/search"
import { useAuthStore } from "@/stores/auth-store"
import type { Coordinates } from "@/types/events/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

/**
 * Nearby discovery for one resolved location. Pass `null` coordinates while
 * location is unresolved or has failed: the query is then disabled and NO
 * request of any kind is made (there is no global fallback).
 *
 * Cache scope: account + session generation + rounded coordinates + radius + limit.
 * No `placeholderData`, so another location's results are never shown as a stand-in.
 *
 * Search is local: the nearby endpoint has no search parameter and the global search
 * endpoint must not be used. While a search is active the remaining nearby pages are
 * fetched (up to a cap) so "no matches" is only claimed for the whole nearby set;
 * `coverage` says how much was searched.
 */
export function useNearbyEvents(
	coordinates: Coordinates | null,
	search = "",
	limit = EVENTS_PAGE_SIZE,
) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const enabled = coordinates !== null && accountId !== null

	const query = useInfiniteQuery({
		// a distinct key when disabled, so a real (0, 0) location can never share it
		queryKey: coordinates
			? eventKeys.nearby(accountId, sessionGeneration, coordinates, NEARBY_RADIUS_KM, limit)
			: ([...eventKeys.nearbyRoot(), "unresolved"] as const),
		queryFn: ({ pageParam, signal }) =>
			eventsApi.getNearbyPage({ ...coordinates!, page: pageParam, limit }, signal),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
		enabled,
		staleTime: 60_000,
	})

	const { data, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage } = query
	const pagesLoaded = data?.pages.length ?? 0

	// empty page + non-null `next` is not the end of nearby results
	const advancePastEmpty = shouldAdvancePastEmptyPage({
		pages: data?.pages,
		hasNextPage,
		isFetching,
		fetchFailed: isFetchNextPageError,
	})
	useEffect(() => {
		if (advancePastEmpty) void fetchNextPage()
	}, [advancePastEmpty, fetchNextPage])

	const normalizedSearch = normalizeQuery(search)
	// before the first page arrives there is no `next` to inspect: that is "not scanned yet",
	// never "complete" (and a failed first page is "partial", not complete)
	const firstPageDone = pagesLoaded > 0
	const coverage = searchCoverage({
		active: normalizedSearch.length > 0 && enabled,
		hasNextPage: firstPageDone ? hasNextPage : true,
		pagesLoaded,
		fetchFailed: isFetchNextPageError || (!firstPageDone && query.isError),
	})
	const scanForSearch = firstPageDone && shouldScanForSearch({ coverage, isFetching })
	useEffect(() => {
		if (scanForSearch) void fetchNextPage()
	}, [scanForSearch, fetchNextPage])

	const allEvents = useMemo(() => flattenPages(data?.pages), [data?.pages])
	const events = useMemo(
		() => filterNearbyEvents(allEvents, normalizedSearch),
		[allEvents, normalizedSearch],
	)

	/** nothing to show yet but pages remain (empty-page advance, or a search still scanning) */
	const isScanning =
		enabled &&
		hasNextPage &&
		events.length === 0 &&
		!isFetchNextPageError &&
		(trailingEmptyPages(data?.pages) > 0 || coverage === "scanning")

	return {
		events,
		/** events for the location before any search filter */
		totalLoaded: allEvents.length,
		coverage,
		isScanning,
		// includes the moment before the account is known (query disabled, still pending)
		isInitialLoading: coordinates !== null && query.isPending,
		isError: query.isError && !data,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch: query.refetch,
	}
}
