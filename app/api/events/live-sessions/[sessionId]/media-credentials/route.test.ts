// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))
vi.mock("@/lib/server-config", () => ({ DJANGO_API_URL: "https://api.example.test/api/v1" }))

import { POST } from "./route"

const ctx = (sessionId = "72") => ({ params: Promise.resolve({ sessionId }) })
const request = () => new Request("http://localhost/api/events/live-sessions/72/media-credentials", { method: "POST" })
const fetchMock = vi.fn()
const credentials = {
  success: true,
  data: {
    server_url: "wss://media.example.test",
    token: "issued-livekit-token",
    room: "event-room-72",
    identity: "viewer-9",
    permissions: {
      can_subscribe: true,
      can_publish_microphone: true,
      can_publish_screen_share: false,
      can_publish_camera: false,
      can_publish_data: false,
      room_admin: true,
    },
  },
}
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("NODE_ENV", "production")
  getAccessToken.mockResolvedValue("access-token")
  fetchMock.mockResolvedValue(reply(credentials))
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "info").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("POST /api/events/live-sessions/[sessionId]/media-credentials", () => {
  it("requires authentication without calling the backend", async () => {
    getAccessToken.mockResolvedValue(null)
    const response = await POST(request(), ctx())
    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("requests backend-issued credentials with the authenticated web client contract", async () => {
    const response = await POST(request(), ctx())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(credentials.data)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://api.example.test/api/v1/live/sessions/72/media/credentials")
    expect(init.method).toBe("POST")
    expect(init.cache).toBe("no-store")
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer access-token")
    expect(new Headers(init.headers).get("x-platform")).toBe("web")
    expect(new Headers(init.headers).get("x-app-version")).toBe("0.1.0")
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it("rejects malformed session IDs before calling the backend", async () => {
    const response = await POST(request(), ctx("../72"))
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("preserves backend authorization denial without exposing credentials", async () => {
    fetchMock.mockResolvedValue(reply({ message: "Access denied" }, 403))
    const response = await POST(request(), ctx())
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: "Access denied" })
  })

  it("rejects incomplete or malformed credential responses", async () => {
    fetchMock.mockResolvedValue(reply({
      success: true,
      data: {
        server_url: "wss://media.example.test", token: "token", room: "room", identity: "viewer",
        permissions: { can_subscribe: true, can_publish_microphone: true },
      },
    }))
    const response = await POST(request(), ctx())
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ message: "Invalid media credentials response" })
  })
})
