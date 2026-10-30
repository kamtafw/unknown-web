import type { EventsSocketAuthProvider } from "./socket-manager"

interface SocketCredentialResponse {
  success?: boolean
  data?: { token?: unknown }
}

/**
 * The access JWT remains in the httpOnly cookie at rest. This provider fetches
 * it just-in-time from the Events BFF and returns it only in Socket.IO's
 * handshake auth object (never in a URL, storage, logs, or React state).
 * Called again after connection errors so refreshed access cookies are used.
 */
export const eventsSocketAuthProvider: EventsSocketAuthProvider = {
  async getAuth() {
    const response = await fetch("/api/events/socket-credential", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Your session has expired. Sign in again."
          : "Unable to authenticate the Events connection",
      )
    }

    const body = (await response.json()) as SocketCredentialResponse
    const token = body.success === true ? body.data?.token : null
    if (typeof token !== "string" || token.length === 0) {
      throw new Error("Events socket credentials were invalid")
    }

    return { token }
  },
}
