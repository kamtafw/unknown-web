"use client"

import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"

/** Renders nothing — side-effect only, mirrors
 * providers/dashboard-auth-bootstrap.tsx. Mount once, inside the Messenger
 * layout, so the socket connects while the user is inside /messenger and
 * disconnects on unmount/logout rather than staying open app-wide. */
export function MessengerSocketBootstrap() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

	useEffect(() => {
		if (!isAuthenticated) return

		messengerSocket.connect().catch(() => undefined)

		return () => {
			messengerSocket.disconnect()
		}
	}, [isAuthenticated])

	return null
}
