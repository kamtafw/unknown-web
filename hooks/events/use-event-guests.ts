"use client"

import { eventsApi } from "@/lib/events/api"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import type { EventGuest, EventGuestsPage } from "@/types/events/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * Accumulated pages in the order the backend returned them (newest `joined_at` first; the date
 * itself is not kept, A-17), with a repeated user id kept once at its first position. Nothing is
 * sorted by the client.
 */
export function flattenGuestPages(pages: EventGuestsPage[] | undefined): EventGuest[] {
	const seen = new Set<number>()
	const out: EventGuest[] = []
	for (const page of pages ?? []) {
		for (const guest of page.guests) {
			if (seen.has(guest.userId)) continue
			seen.add(guest.userId)
			out.push(guest)
		}
	}
	return out
}

/**
 * Guests of one FULL event, read-only (P3-07). An infinite query driven by the backend's `next`
 * link, never by how many rows a page had. Cache entries are scoped by account, login session,
 * event and page size like every other Events query. The caller mounts this only for a full event's
 * active Guests section, so a restricted preview, even with `tab=guests` in the URL, makes no
 * request; an invalid id makes none either.
 *
 * Only the host and users with a guest record may read the list (guide §4.12): a 403 is reported as
 * `forbidden`, never as an empty list. Failures keep what was already loaded; `phase` says whether
 * it was the first load or a later page.
 */
export function useEventGuests(eventId: string, limit = EVENTS_PAGE_SIZE) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const valid = isEventId(eventId)

	const query = useInfiniteQuery({
		queryKey: eventKeys.guests(accountId, sessionGeneration, eventId, limit),
		queryFn: ({ pageParam, signal }) =>
			eventsApi.getEventGuestsPage({ eventId, page: pageParam, limit }, signal),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
		enabled: valid && accountId !== null,
		staleTime: 30_000,
		// a refusal or a missing page will not change on retry
		retry: (count, error) => {
			const status = statusOf(error)
			return status === 401 || status === 403 || status === 404 ? false : count < 1
		},
	})

	const pages = valid ? query.data?.pages : undefined
	const guests = useMemo(() => flattenGuestPages(pages), [pages])
	const hasLoaded = pages !== undefined

	const error: EventErrorKind | null =
		valid && query.isError ? describeEventError(query.error).kind : null
	const phase: "initial" | "next-page" | "refresh" | null = !error
		? null
		: !hasLoaded
			? "initial"
			: query.isFetchNextPageError
				? "next-page"
				: "refresh"

	return {
		guests,
		hasLoaded,
		isInitialLoading: valid && !hasLoaded && !query.isError,
		error,
		phase,
		hasNextPage: valid && hasLoaded && query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch,
	}
}
