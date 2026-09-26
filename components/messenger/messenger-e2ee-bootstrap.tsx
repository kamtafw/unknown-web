"use client"

import { e2eeRuntime } from "@/lib/messenger/e2ee"
import { useAuthStore } from "@/stores/auth-store"
import type { Pkid } from "@/types/messenger"
import { useEffect } from "react"

/**
 * Renders nothing — side-effect only, mirrors
 * `messenger-socket-bootstrap.tsx`. Keeps `e2eeRuntime` (the in-memory
 * identity/trust cache — see `lib/messenger/e2ee/runtime.ts`) in sync with
 * whichever account is active in `useAuthStore`.
 *
 * Behaviour, per the E0.2 lifecycle decision:
 *
 *   accountId: null → number   Account becomes active (fresh login, or a
 *                               page reload that rehydrates an already-
 *                               logged-in session). `activate()` re-reads
 *                               this account's persisted identity/trust
 *                               state from IndexedDB — NO PIN is needed for
 *                               this; the PIN is only ever needed once, by
 *                               E2's recovery flow, to originally install
 *                               the identity.
 *
 *   accountId: A → B           Account switch. React runs the effect
 *                               CLEANUP for A (→ `clear()`, wiping A's
 *                               in-memory state) before running the new
 *                               effect for B (→ `activate(B)`) — so A's
 *                               private key is never simultaneously live
 *                               alongside B's.
 *
 *   accountId: number → null   Logout. `clear()` wipes in-memory state.
 *                               A's PERSISTED identity/trust state in
 *                               IndexedDB is left untouched, so logging
 *                               back into the same account later rehydrates
 *                               it again without re-running PIN recovery.
 *
 * The selector reads only `user?.pkid`, not the whole `user` object.
 * `DashboardAuthBootstrap` calls `setUser` on every successful `/me`
 * refetch — including while the SAME account stays logged in across every
 * `/messenger` page visit — and a same-value primitive selector means this
 * effect only re-runs on a genuine account change, never on that routine
 * refetch.
 */
export function MessengerE2eeBootstrap() {
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))

	useEffect(() => {
		if (accountId === null) {
			e2eeRuntime.clear()
			return
		}

		void e2eeRuntime.activate(accountId)

		return () => {
			e2eeRuntime.clear()
		}
	}, [accountId])

	return null
}
