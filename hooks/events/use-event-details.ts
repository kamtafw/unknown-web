"use client"

import { eventsApi } from "@/lib/events/api"
import { describeEventError } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails } from "@/types/events/api"
import { useQuery } from "@tanstack/react-query"

export type EventDetailsStatus =
	/** nothing selected */
	| "none"
	/** the id in the URL is not an event id: no request is made */
	| "invalid"
	| "loading"
	| "ready"
	/** deleted, or not visible to this viewer */
	| "unavailable"
	| "error"

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * Details for the selected event: a full event or a restricted preview. Cache entries are scoped
 * by account and login session like every other Events query; an invalid id never reaches the
 * network. `isHost` only decides which controls to show, and the server stays authoritative.
 */
export function useEventDetails(eventId: string | null) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const userId = useAuthStore((s) => s.user?.id ?? null)

	const valid = eventId !== null && isEventId(eventId)

	const query = useQuery({
		queryKey: valid
			? eventKeys.detail(accountId, sessionGeneration, eventId)
			: ([...eventKeys.detailRoot(), "unresolved"] as const),
		queryFn: ({ signal }) => eventsApi.getEventDetails(eventId!, signal),
		enabled: valid && accountId !== null,
		staleTime: 30_000,
		// a missing or hidden event will not appear on retry
		retry: (count, error) => {
			const status = statusOf(error)
			return status === 403 || status === 404 ? false : count < 1
		},
	})

	const details: EventDetails | null = valid ? (query.data ?? null) : null
	const isHost =
		details?.kind === "full" && userId !== null && details.hosts.some((h) => h.id === userId)

	let status: EventDetailsStatus
	if (eventId === null) status = "none"
	else if (!valid) status = "invalid"
	else if (details) status = "ready"
	else if (query.isError) {
		const kind = describeEventError(query.error).kind
		status = kind === "not_found" || kind === "forbidden" ? "unavailable" : "error"
	} else status = "loading"

	return { status, details, isHost, refetch: query.refetch, isRefetching: query.isRefetching }
}
