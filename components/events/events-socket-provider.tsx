"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { EventsSocketManager, type EventsSocketAuthProvider, type EventsSocketStatus } from "@/lib/events/socket-manager"
import { useAuthStore } from "@/stores/auth-store"

interface EventsSocketContextValue {
	status: EventsSocketStatus
	manager: EventsSocketManager | null
}

const EventsSocketContext = createContext<EventsSocketContextValue>({ status: "idle", manager: null })

interface EventsSocketProviderProps {
	children: ReactNode
	/** Optional until the backend confirms browser handshake auth. Never reuse Messenger's temporary query-string auth. */
	authProvider?: EventsSocketAuthProvider
}

/** Owns one Events-only connection per authenticated account. Without a confirmed auth provider it stays inert. */
export function EventsSocketProvider({ children, authProvider }: EventsSocketProviderProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const accountId = useAuthStore((state) => state.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((state) => state.sessionGeneration)
	const [status, setStatus] = useState<EventsSocketStatus>("idle")

	const manager = useMemo(() => {
		if (!authProvider || !isAuthenticated || accountId == null) return null
		return new EventsSocketManager({ authProvider, onStatusChange: setStatus })
	}, [authProvider, isAuthenticated, accountId, sessionGeneration])

	useEffect(() => {
		if (!manager) {
			setStatus("idle")
			return
		}
		let active = true
		manager.connect().catch(() => {
			if (active) setStatus(manager.getStatus())
		})
		return () => {
			active = false
			manager.disconnect()
		}
	}, [manager])

	const value = useMemo(() => ({ status, manager }), [status, manager])
	return <EventsSocketContext.Provider value={value}>{children}</EventsSocketContext.Provider>
}

export function useEventsSocket(): EventsSocketContextValue {
	return useContext(EventsSocketContext)
}
