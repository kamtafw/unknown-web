/**
 * Socket connection status only. This is the one store M0 has an actual
 * responsibility for — everything else (typing state, active conversation,
 * chat list cache, etc.) belongs to the milestone that introduces it
 * (M1+), not to Foundation. Don't add fields here speculatively.
 */

import { create } from "zustand"

export type MessengerConnectionStatus =
	| "idle" // never connected this session
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected" // deliberate (e.g. logout)
	| "error"

interface MessengerConnectionStore {
	status: MessengerConnectionStatus
	lastError: string | null
	setStatus: (status: MessengerConnectionStatus) => void
	setError: (message: string) => void
}

export const useMessengerConnectionStore = create<MessengerConnectionStore>()((set) => ({
	status: "idle",
	lastError: null,
	setStatus: (status) => set({ status, ...(status !== "error" ? { lastError: null } : {}) }),
	setError: (message) => set({ status: "error", lastError: message }),
}))
