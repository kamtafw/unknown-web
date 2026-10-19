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
 * Add details / guests / comments keys in the phase that needs them, not now.
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
}
