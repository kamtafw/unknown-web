"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StatusViewedState {
	viewedIds: number[]
	markViewed: (id: number) => void
	isViewed: (id: number) => boolean
}

/**
 * Client-side overlay for status view-state — same rationale as
 * list-overlay.ts's pin/mute/archive reconciliation. chats/statuses/lists
 * is unverified to reliably reflect a just-performed view on the next
 * fetch (flagged in the SLICE F backlog). Rather than depend on server
 * timing for something as visible as "did this move to Viewed", this
 * tracks it locally and ORs with the server's own is_viewed — server
 * truth wins once/if it catches up, this just guarantees the UI doesn't
 * silently fail to move a status the user just watched.
 */
export const useStatusViewedStore = create<StatusViewedState>()(
	persist(
		(set, get) => ({
			viewedIds: [],
			markViewed: (id) =>
				set((s) => (s.viewedIds.includes(id) ? s : { viewedIds: [...s.viewedIds, id] })),
			isViewed: (id) => get().viewedIds.includes(id),
		}),
		{ name: "messenger-status-viewed-store" },
	),
)
