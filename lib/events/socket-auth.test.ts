import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { eventsSocketAuthProvider } from "./socket-auth"

describe("eventsSocketAuthProvider", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches a fresh credential without caching and returns the auth.token value", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { token: "jwt-one" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    await expect(eventsSocketAuthProvider.getAuth()).resolves.toEqual({ token: "jwt-one" })
    expect(fetchMock).toHaveBeenCalledWith("/api/events/socket-credential", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
  })

  it("does not return a token when the session is unauthenticated", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }))
    await expect(eventsSocketAuthProvider.getAuth()).rejects.toThrow("Your session has expired")
  })

  it("fails closed for a malformed credential response", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { token: 12 } }), { status: 200 }),
    )
    await expect(eventsSocketAuthProvider.getAuth()).rejects.toThrow("credentials were invalid")
  })
})
