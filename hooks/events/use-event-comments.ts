"use client"

import { eventsApi } from "@/lib/events/api"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import type { EventComment, EventCommentsPage } from "@/types/events/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * Accumulated pages in the order the backend returned them (newest first within a page, later
 * pages appended), with a repeated comment id kept once at its first position. Nothing is sorted:
 * the client never reorders by timestamp.
 */
export function flattenCommentPages(pages: EventCommentsPage[] | undefined): EventComment[] {
	const seen = new Set<string>()
	const out: EventComment[] = []
	for (const page of pages ?? []) {
		for (const comment of page.comments) {
			if (seen.has(comment.id)) continue
			seen.add(comment.id)
			out.push(comment)
		}
	}
	return out
}

/**
 * Comments of one FULL event, read side (posting is `usePostEventComment`). An infinite query driven by the backend's `next`
 * link (`hasNext`): an empty page with a `next` still offers another page. Cache entries are
 * scoped by account, login session, event and page size like every other Events query. The
 * caller mounts this only for a full event's active Comments section, so a restricted preview,
 * even with `tab=comments` in the URL, makes no request; an invalid id makes none either.
 *
 * Failures keep what was already loaded: `error` says what went wrong and `phase` says whether it
 * was the first load, a later page, or a manual refresh. There is no polling, socket or
 * optimistic comment (A-21, EV-030): the thread is as fresh as the last load or refresh.
 */
export function useEventComments(eventId: string, limit = EVENTS_PAGE_SIZE) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const valid = isEventId(eventId)

	const query = useInfiniteQuery({
		queryKey: eventKeys.comments(accountId, sessionGeneration, eventId, limit),
		queryFn: ({ pageParam, signal }) =>
			eventsApi.getEventCommentsPage({ eventId, page: pageParam, limit }, signal),
		initialPageParam: 1,
		// from the backend `next` link only, never from the number of comments on the page
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
	const comments = useMemo(() => flattenCommentPages(pages), [pages])
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
		comments,
		hasLoaded,
		isInitialLoading: valid && !hasLoaded && !query.isError,
		error,
		phase,
		hasNextPage: valid && hasLoaded && query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		isRefreshing: query.isRefetching && !query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch,
	}
}
