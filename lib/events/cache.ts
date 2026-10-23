import type { EventCard, EventRsvpStatus, EventsPage } from "@/types/events/api"
import type { InfiniteData, QueryClient } from "@tanstack/react-query"
import { eventKeys, keyBelongsTo } from "./query-keys"

/**
 * The viewer's RSVP as already seen in a list the same account and login session loaded for the
 * same event id. Used only to fill a restricted preview, which omits `viewer_rsvp_status`.
 *
 * Only a recorded status is returned. A list card with no status is ambiguous (the field can be
 * absent as well as null), so it never means "has not responded": the caller keeps the state
 * "unknown". Another account's or another login session's entries are never read.
 */
export function findCachedRsvp(
	client: QueryClient,
	accountId: number | null,
	sessionGeneration: number | null,
	eventId: string,
): EventRsvpStatus | null {
	if (accountId === null) return null

	for (const root of [eventKeys.nearbyRoot(), eventKeys.myEventsRoot()]) {
		for (const [key, data] of client.getQueriesData<InfiniteData<EventsPage>>({ queryKey: root })) {
			if (!keyBelongsTo(key, accountId, sessionGeneration)) continue
			for (const page of data?.pages ?? []) {
				const card: EventCard | undefined = page.events.find((e) => e.id === eventId)
				if (card?.viewerRsvp) return card.viewerRsvp
			}
		}
	}
	return null
}
