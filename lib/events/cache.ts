import type { EventCard, EventRsvpStatus, EventsPage } from "@/types/events/api"
import type { InfiniteData, QueryClient } from "@tanstack/react-query"
import { eventKeys, eventSubResourceRoots, keyBelongsTo, keyEventId } from "./query-keys"

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

export type EventSubResource = "resources" | "comments" | "guests"

const SUB_RESOURCE_ROOT: Record<EventSubResource, string> = {
	resources: eventSubResourceRoots[0][1],
	comments: eventSubResourceRoots[1][1],
	guests: eventSubResourceRoots[2][1],
}

const ALL_SUB_RESOURCES = ["resources", "comments", "guests"] as const

/** matches this event's entries for this account and login session, never anyone else's */
function subResourcePredicate(
	accountId: number | null,
	sessionGeneration: number | null,
	eventId: string,
	parts: readonly EventSubResource[],
) {
	const roots = new Set(parts.map((p) => SUB_RESOURCE_ROOT[p]))
	return (query: { queryKey: readonly unknown[] }): boolean => {
		const key = query.queryKey
		return (
			accountId !== null &&
			key[0] === eventKeys.all[0] &&
			roots.has(key[1] as string) &&
			keyBelongsTo(key, accountId, sessionGeneration) &&
			keyEventId(key) === eventId
		)
	}
}

/**
 * Drops the cached resources, comments and guests of one event (it was deleted, or a section
 * answered 404). The account and login session must match, so another account's entries stay.
 */
export function removeEventSubResources(
	client: QueryClient,
	accountId: number | null,
	sessionGeneration: number | null,
	eventId: string,
): void {
	if (accountId === null) return
	client.removeQueries({
		predicate: subResourcePredicate(accountId, sessionGeneration, eventId, ALL_SUB_RESOURCES),
	})
}

/** marks the named sections (default: all three) of one event stale so they refetch */
export function invalidateEventSubResources(
	client: QueryClient,
	accountId: number | null,
	sessionGeneration: number | null,
	eventId: string,
	parts: readonly EventSubResource[] = ALL_SUB_RESOURCES,
): Promise<void> {
	if (accountId === null) return Promise.resolve()
	return client.invalidateQueries({
		predicate: subResourcePredicate(accountId, sessionGeneration, eventId, parts),
	})
}

/**
 * After the viewer posts a comment: keep only page 1 of this event's cached thread (later pages
 * shift once a newer comment exists, so they are dropped and re-loaded on demand) and refetch it.
 * The new comment then appears through the normal read path, newest first; nothing is inserted
 * by hand. Only this account's and login session's entries for this event are touched.
 */
export function refreshCommentsFromFirstPage(
	client: QueryClient,
	accountId: number | null,
	sessionGeneration: number | null,
	eventId: string,
): Promise<void> {
	if (accountId === null) return Promise.resolve()
	const predicate = subResourcePredicate(accountId, sessionGeneration, eventId, ["comments"])
	client.setQueriesData<InfiniteData<unknown>>({ predicate }, (old) =>
		old && old.pages.length > 1
			? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) }
			: old,
	)
	return client.invalidateQueries({ predicate })
}
