"use client"

import { useEventsSocket } from "@/components/events/events-socket-provider"
import { createEventRoomRevalidator } from "@/lib/events/socket-room"
import type { EventLiveSessionState } from "@/types/events/api"
import { useEffect } from "react"

/**
 * Own the admitted live-session socket-room lifecycle for the participant surface.
 * The HTTP live-session read must say isJoined and provide the exact documented descriptor.
 * Transport reconnects are left to EventsSocketManager; this hook does not tear down membership
 * merely because the transport temporarily changes status.
 */
export function useEventLiveRoom(liveState: EventLiveSessionState | null): void {
  const { manager, status } = useEventsSocket()
  const eventId = liveState?.eventId ?? null
  const sessionId = liveState?.session.id ?? null
  const descriptor = liveState?.socket ?? null
  const eligible =
    liveState?.session.status === "live" &&
    liveState.session.isJoined &&
    eventId !== null &&
    sessionId !== null &&
    descriptor !== null &&
    descriptor.namespace === "/live" &&
    descriptor.joinEvent === "live:join" &&
    descriptor.sessionId === sessionId

  useEffect(() => {
    if (!manager || status !== "connected" || !eligible || !descriptor || sessionId === null) return
    void manager.joinRoom(descriptor, createEventRoomRevalidator(eventId!, sessionId)).catch(() => {
      // The manager retains the classified room state; the HTTP roster remains independently readable.
    })
  }, [manager, status, eligible, descriptor?.namespace, descriptor?.joinEvent, descriptor?.sessionId, eventId, sessionId])

  useEffect(() => {
    if (!manager || !eligible || sessionId === null) return
    return () => {
      if (manager.getRoomStatus(sessionId) !== "idle") manager.leaveRoom(sessionId)
    }
  }, [manager, eligible, eventId, sessionId, descriptor?.namespace, descriptor?.joinEvent, descriptor?.sessionId])
}
