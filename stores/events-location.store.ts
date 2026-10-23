"use client"

import { create } from "zustand"

/**
 * The place label that Events discovery last resolved, so My events can show it
 * (read-only) without requesting browser location itself.
 *
 * Deliberately small:
 *  - in memory only (no `persist`): nothing about location survives a reload;
 *  - the label only, never coordinates;
 *  - tagged with the account and session generation that resolved it, so a reader
 *    for any other account or login session sees nothing (same scoping as the
 *    Events query keys).
 *
 * This is display state, not data: it never feeds a request, and nothing about
 * nearby discovery or My events fetching reads it.
 */
export interface RememberedLocation {
	accountId: number
	sessionGeneration: number
	/** reverse-geocoded label; null when only the address lookup failed (a location was still resolved) */
	address: string | null
}

interface EventsLocationState {
	last: RememberedLocation | null
	remember: (location: RememberedLocation) => void
	forget: () => void
}

export const useEventsLocationStore = create<EventsLocationState>()((set) => ({
	last: null,
	remember: (location) => set({ last: location }),
	forget: () => set((state) => (state.last === null ? state : { last: null })),
}))
