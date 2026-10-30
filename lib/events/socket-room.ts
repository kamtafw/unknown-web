import { eventsApi } from "./api"
import type { EventsRoomRevalidator } from "./socket-manager"

/**
 * Re-check the server's authoritative live participation before replaying a
 * socket room after reconnect. A full session read is permitted only for the
 * event host or an online guest; isJoined confirms active live participation.
 */
export function createEventRoomRevalidator(
  eventId: string,
  sessionId: number,
): EventsRoomRevalidator {
  return async () => {
    let state
    try {
      state = await eventsApi.getEventLiveSession(eventId)
    } catch (error) {
      const status = (error as { response?: { status?: unknown } } | null)?.response?.status
      if (status === 403 || status === 404) return false
      // Keep the membership pending on auth/network/server failures. The caller
      // can retry rejoinRooms after the app's auth or network recovery completes.
      throw error
    }

    return (
      state.session.id === sessionId &&
      state.session.status === "live" &&
      state.session.isJoined &&
      state.socket?.namespace === "/live" &&
      state.socket.joinEvent === "live:join" &&
      state.socket.sessionId === sessionId
    )
  }
}
