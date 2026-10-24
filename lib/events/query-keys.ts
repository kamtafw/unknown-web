/**
 * Centralized Events query-key registry (Phase 1: discovery + My Events only).
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
 *
 * Pass 2 adds details and the viewer's RSVP. Guests / comments keys belong to Pass 3.
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

	resourcesRoot: () => [...eventKeys.all, "resources"] as const,
	resources: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.resourcesRoot(), accountId, sessionGeneration, eventId] as const,
	commentsRoot: () => [...eventKeys.all, "comments"] as const,
	comments: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.commentsRoot(), accountId, sessionGeneration, eventId] as const,
	guestsRoot: () => [...eventKeys.all, "guests"] as const,
	guests: (accountId: number | null, sessionGeneration: number | null, eventId: string) =>
		[...eventKeys.guestsRoot(), accountId, sessionGeneration, eventId] as const,
}

/** do the account + session slots (positions 2 and 3 of every scoped key) match? */
export function keyBelongsTo(
	key: readonly unknown[],
	accountId: number | null,
	sessionGeneration: number | null,
): boolean {
	return accountId !== null && key[2] === accountId && key[3] === sessionGeneration
}
