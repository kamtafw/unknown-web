"use client"

import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails, EventLiveSessionState } from "@/types/events/api"
import { useQuery } from "@tanstack/react-query"

/** what a failed live-session read means for the screen (guide §4.18) */
export type LiveSessionErrorKind =
	/** 404 "This event does not have a live session." (after the viewer was authorised) */
	| "no_session"
	/** 403: the viewer is not the host or an online guest. A business rule, not an expired login */
	| "not_admitted"
	/** any other 404: the event itself is gone or hidden */
	| "unavailable"
	| "error"

export type EventLiveSessionStatus =
	/** no request is made (restricted preview, nothing attached, invalid id, unknown account) */
	| "disabled"
	| "loading"
	| "ready"
	| LiveSessionErrorKind

const NO_SESSION_MESSAGE = /does not have a live session/i

/**
 * Tells the two documented 404s apart. The guide gives both a 404 and no distinct code, so the
 * backend's message decides: "This event does not have a live session." is `no_session`; any other
 * 404 (including the BFF's own "Event not found.") means the event is not available. A 403 is
 * `not_admitted` whatever its text: the guide reuses the "Join this event…" wording across
 * endpoints, so the text is never shown and never taken for an expired login.
 */
export function classifyLiveSessionError(error: unknown): LiveSessionErrorKind {
	const response = (error as { response?: { status?: unknown; data?: unknown } } | null)?.response
	const status = typeof response?.status === "number" ? response.status : null
	if (status === 403) return "not_admitted"
	if (status === 404) {
		const message = (response?.data as { message?: unknown } | null | undefined)?.message
		return typeof message === "string" && NO_SESSION_MESSAGE.test(message)
			? "no_session"
			: "unavailable"
	}
	return "error"
}

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * The attached live session of one event, read only (P4-01). The read is made only for FULL
 * details of an event that has a session attached or is live: a restricted preview never makes it
 * (even when the id is valid and a session id is shown), and an event with nothing attached has
 * nothing to ask about. Entries are scoped by account, login session and event like every other
 * Events query, and nothing cached is served while the query is disabled, so a viewer who drops
 * from full details to a preview (for example when a session ends) sees no session state.
 *
 * It only reads: it creates no session and does not join the caller. A 403 is an access state, a
 * 404 is either "no session" or "event unavailable", and a failure is never shown as an empty or
 * ended session.
 */
export function useEventLiveSession(details: EventDetails | null) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const eventId = details?.id ?? null
	const enabled =
		details?.kind === "full" &&
		eventId !== null &&
		isEventId(eventId) &&
		accountId !== null &&
		(details.liveSessionId !== null || details.isLive)

	const query = useQuery({
		queryKey:
			enabled && eventId
				? eventKeys.liveSession(accountId, sessionGeneration, eventId)
				: ([...eventKeys.liveSessionRoot(), "unresolved"] as const),
		queryFn: ({ signal }) => eventsApi.getEventLiveSession(eventId!, signal),
		enabled,
		staleTime: 30_000,
		// a refusal or a missing session will not change on retry
		retry: (count, error) => {
			const status = statusOf(error)
			return status === 401 || status === 403 || status === 404 ? false : count < 1
		},
	})

	const state: EventLiveSessionState | null = enabled ? (query.data ?? null) : null

	let status: EventLiveSessionStatus
	if (!enabled) status = "disabled"
	else if (state) status = "ready"
	else if (query.isError) status = classifyLiveSessionError(query.error)
	else status = "loading"

	return { status, state, refetch: query.refetch, isRefetching: query.isRefetching }
}
