/**
 * Centralized Events query-key registry.
 *
 * Every key that holds user-visible data is scoped by the authenticated
 * account (`pkid`) AND the in-memory `sessionGeneration` from auth-store, the
 * same convention as `chatKeys.list` — so data never crosses accounts or
 * login sessions. Nearby and My Events live under different roots on purpose:
 * they have different scopes (location vs membership) and must never share a
 * cache entry.
 *
 * Infinite queries carry the page as `pageParam`, so `page` is not in the key;
 * the scope (coordinates, radius, limit, search) is.
 */

import type { Coordinates } from "@/types/events/api"
import { roundForKey } from "./location"

export const eventKeys = {
	all: ["events"] as const,

	nearbyRoot: () => [...eventKeys.all, "nearby"] as const,
	nearby: (
		accountId: number | null,
		sessionGeneration: number | null,
		coords: Coordinates,
		radiusKm: number,
		limit: number,
	) =>
		[
			...eventKeys.nearbyRoot(),
			accountId,
			sessionGeneration,
			{
				latitude: roundForKey(coords.latitude),
				longitude: roundForKey(coords.longitude),
				radiusKm,
				limit,
			},
		] as const,

	myEventsRoot: () => [...eventKeys.all, "my-events"] as const,
	myEvents: (
		accountId: number | null,
		sessionGeneration: number | null,
		search: string,
		limit: number,
	) => [...eventKeys.myEventsRoot(), accountId, sessionGeneration, { search, limit }] as const,

	addressRoot: () => [...eventKeys.all, "address"] as const,
	address: (accountId: number | null, sessionGeneration: number | null, coords: Coordinates) =>
		[
			...eventKeys.addressRoot(),
			accountId,
			sessionGeneration,
			{ latitude: roundForKey(coords.latitude), longitude: roundForKey(coords.longitude) },
		] as const,

	detailRoot: () => [...eventKeys.all, "detail"] as const,
	detail: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.detailRoot(), accountId, sessionGeneration, eventId] as const,

	/** what the viewer last RSVP'd in this session; the only source for a restricted preview */
	rsvpRoot: () => [...eventKeys.all, "rsvp"] as const,
	rsvp: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.rsvpRoot(), accountId, sessionGeneration, eventId] as const,

	/** links and documents; no pagination */
	resourcesRoot: () => [...eventKeys.all, "resources"] as const,
	resources: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.resourcesRoot(), accountId, sessionGeneration, eventId] as const,

	/** infinite; the page is the `pageParam`, so only the page size is in the key */
	commentsRoot: () => [...eventKeys.all, "comments"] as const,
	comments: (
		accountId: number | null,
		sessionGeneration: number | null,
		eventId: string,
		limit: number,
	) => [...eventKeys.commentsRoot(), accountId, sessionGeneration, eventId, { limit }] as const,

	/** infinite; the page is the `pageParam` */
	guestsRoot: () => [...eventKeys.all, "guests"] as const,
	guests: (
		accountId: number | null,
		sessionGeneration: number | null,
		eventId: string,
		limit: number,
	) => [...eventKeys.guestsRoot(), accountId, sessionGeneration, eventId, { limit }] as const,

	/** the event-specific live-session read (P4-01); one object, no pagination */
	liveSessionRoot: () => [...eventKeys.all, "live-session"] as const,
	liveSession: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.liveSessionRoot(), accountId, sessionGeneration, eventId] as const,
}

/** the per-event Pass 3 roots, for cache helpers that act on all of them */
export const eventSubResourceRoots = [
	eventKeys.resourcesRoot(),
	eventKeys.commentsRoot(),
	eventKeys.guestsRoot(),
] as const

/** the event id of a per-event key (`[events, root, account, session, eventId, …]`) */
export function keyEventId(key: readonly unknown[]): string | null {
	return typeof key[4] === "string" ? key[4] : null
}

/** do the account + session slots (positions 2 and 3 of every scoped key) match? */
export function keyBelongsTo(
	key: readonly unknown[],
	accountId: number | null,
	sessionGeneration: number | null,
): boolean {
	return accountId !== null && key[2] === accountId && key[3] === sessionGeneration
}
