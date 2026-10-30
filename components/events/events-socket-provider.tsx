"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { EventsSocketManager, type EventsSocketStatus } from "@/lib/events/socket-manager"
import { eventsSocketAuthProvider } from "@/lib/events/socket-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useQueryClient } from "@tanstack/react-query"
import {
  attachEventsRealtimeHandlers,
  invalidateEventsAfterSocketReconnect,
} from "@/lib/events/socket-events"

interface EventsSocketContextValue {
  status: EventsSocketStatus
  manager: EventsSocketManager | null
}

const EventsSocketContext = createContext<EventsSocketContextValue>({ status: "idle", manager: null })

export function EventsSocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accountId = useAuthStore((state) => state.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((state) => state.sessionGeneration)
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<EventsSocketStatus>("idle")

  const manager = useMemo(() => {
    if (!isAuthenticated || accountId == null) return null
    return new EventsSocketManager({
      authProvider: eventsSocketAuthProvider,
      onStatusChange: setStatus,
      onReconnect: () => {
        void invalidateEventsAfterSocketReconnect(queryClient, { accountId, sessionGeneration })
      },
    })
  }, [isAuthenticated, accountId, sessionGeneration, queryClient])

  // Register feature listeners before opening the transport so an early
  // server event cannot be lost during the asynchronous auth handshake.
  useEffect(() => {
    if (!manager || accountId == null) return
    return attachEventsRealtimeHandlers(manager, queryClient, { accountId, sessionGeneration })
  }, [manager, queryClient, accountId, sessionGeneration])

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
