"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StatusMuteState {
	mutedPkids: number[]
	mute: (pkid: number) => void
	unmute: (pkid: number) => void
	isMuted: (pkid: number) => boolean
}

/**
 * Confirmed via mobile's store/messenger-status.store.ts: muting someone's
 * status has NO backend endpoint — it's a device-local preference only.
 * Do not add an API call here without new backend evidence.
 */
export const useStatusMuteStore = create<StatusMuteState>()(
	persist(
		(set, get) => ({
			mutedPkids: [],
			mute: (pkid) =>
				set((s) => (s.mutedPkids.includes(pkid) ? s : { mutedPkids: [...s.mutedPkids, pkid] })),
			unmute: (pkid) => set((s) => ({ mutedPkids: s.mutedPkids.filter((id) => id !== pkid) })),
			isMuted: (pkid) => get().mutedPkids.includes(pkid),
		}),
		{ name: "messenger-status-mute-store" },
	),
)
