"use client"

import { eventsApi } from "@/lib/events/api"
import { findCachedRsvp } from "@/lib/events/cache"
import { describeEventError, type EventRequestError } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
	EventDetails,
	EventRsvpStatus,
	RsvpKnowledge,
} from "@/types/events/api"
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * The viewer's RSVP for one event, kept apart from joining and guest membership (RSVP creates
 * no guest row, issues no media access and does not add the event to My events).
 *
 * What the viewer's answer is known from, in order:
 *  1. a full details response (it always says whether the viewer responded);
 *  2. the response to an RSVP made in this session (a restricted preview omits the field);
 *  3. a list entry for the same event loaded by the same account and login session;
 *  otherwise it is "unknown". Unknown is never shown as "not responded".
 */
export function useEventRsvp(eventId: string, details: EventDetails | null) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const rsvpKey = eventKeys.rsvp(accountId, sessionGeneration, eventId)
	const detailKey = eventKeys.detail(accountId, sessionGeneration, eventId)

	// read-only subscription to what a successful RSVP stored; it never fetches
	const stored = useQuery<EventRsvpStatus>({
		queryKey: rsvpKey,
		queryFn: skipToken,
		staleTime: Infinity,
	})

	let rsvp: RsvpKnowledge = { state: "unknown" }
	if (details?.kind === "full") {
		rsvp = details.rsvp
	} else if (stored.data) {
		rsvp = { state: "set", status: stored.data }
	} else {
		const seeded = findCachedRsvp(client, accountId, sessionGeneration, eventId)
		if (seeded) rsvp = { state: "set", status: seeded }
	}

	const mutation = useMutation({
		mutationFn: (status: EventRsvpStatus) => eventsApi.setRsvp(eventId, status),
		onSuccess: (result) => {
			// the response is authoritative: store it, and update a full details entry in place
			client.setQueryData<EventRsvpStatus>(rsvpKey, result.status)
			client.setQueryData<EventDetails>(detailKey, (old) =>
				old?.kind === "full" ? { ...old, rsvp: { state: "set", status: result.status } } : old,
			)
		},
	})

	const error: EventRequestError | null = mutation.isError ? describeEventError(mutation.error) : null

	return {
		rsvp,
		setRsvp: (status: EventRsvpStatus) => mutation.mutate(status),
		isPending: mutation.isPending,
		/** the status being saved, while pending */
		pendingStatus: mutation.isPending ? mutation.variables : null,
		error,
		clearError: mutation.reset,
	}
}
