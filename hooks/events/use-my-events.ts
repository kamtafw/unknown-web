"use client"

import { eventsApi } from "@/lib/events/api"
import { EVENTS_PAGE_SIZE, MAX_SEARCH_LENGTH } from "@/lib/events/constants"
import { flattenPages } from "@/lib/events/normalize"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

/**
 * My Events: events the viewer hosts or has a guest record for, at any distance.
 * Needs no location. Search is server-side via the My Events scope, and the BFF
 * always adds `filter=my_events` (this hook never sends a filter itself). Pass an
 * already-debounced search term.
 *
 * Lives under its own cache root, so it never shares entries with nearby discovery.
 */
export function useMyEvents(search = "", limit = EVENTS_PAGE_SIZE) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const term = search.trim().slice(0, MAX_SEARCH_LENGTH)

	const query = useInfiniteQuery({
		queryKey: eventKeys.myEvents(accountId, sessionGeneration, term, limit),
		queryFn: ({ pageParam, signal }) =>
			eventsApi.getMyEventsPage({ search: term, page: pageParam, limit }, signal),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
		enabled: accountId !== null,
		staleTime: 30_000,
	})

	const events = useMemo(() => flattenPages(query.data?.pages), [query.data?.pages])

	return {
		events,
		isInitialLoading: accountId === null || query.isPending,
		isError: query.isError && !query.data,
		isFetchingNextPage: query.isFetchingNextPage,
		hasNextPage: query.hasNextPage,
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch,
	}
}
