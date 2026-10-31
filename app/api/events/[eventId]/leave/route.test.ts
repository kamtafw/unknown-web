// @vitest-environment node
import { NextRequest, NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
const fetchOrError = vi.fn()

vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))
vi.mock("@/lib/events/bff", () => ({
  envelope: (status: number, message: string, code: string) =>
    NextResponse.json({ success: false, status_code: status, message, code, errors: null }, { status }),
  eventNotFound: () =>
    NextResponse.json({ success: false, status_code: 404, message: "Event not found.", code: "not_found" }, { status: 404 }),
  fetchOrError: (...args: unknown[]) => fetchOrError(...args),
  unauthenticated: () =>
    NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 }),
}))

import { POST } from "./route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId = ID) => ({ params: Promise.resolve({ eventId }) })
const request = () => new NextRequest(`http://localhost/api/events/${ID}/leave`, { method: "POST" })

beforeEach(() => {
  vi.clearAllMocks()
  getAccessToken.mockResolvedValue("token")
  fetchOrError.mockResolvedValue({
    ok: true,
    status: 200,
    json: { success: true, status_code: 200, message: "You have left the event.", data: {} },
  })
})

describe("POST /api/events/[eventId]/leave", () => {
  it("requires authentication", async () => {
    getAccessToken.mockResolvedValue(undefined)
    expect((await POST(request(), ctx())).status).toBe(401)
    expect(fetchOrError).not.toHaveBeenCalled()
  })

  it("rejects an invalid event id before calling upstream", async () => {
    expect((await POST(request(), ctx("bad-id"))).status).toBe(404)
    expect(fetchOrError).not.toHaveBeenCalled()
  })

  it("forwards an authenticated bodyless POST to the event leave endpoint", async () => {
    const response = await POST(request(), ctx())
    expect(response.status).toBe(200)
    const [url, init] = fetchOrError.mock.calls[0]
    expect(url).toMatch(/\/events\/[0-9a-f-]+\/leave$/i)
    expect(init.method).toBe("POST")
    expect(init.headers.Authorization).toBe("Bearer token")
    expect(init.body).toBeUndefined()
    expect(await response.json()).toEqual({
      success: true,
      status_code: 200,
      message: "You have left the event.",
      data: {},
    })
  })

  it("preserves backend admission and authorization errors", async () => {
    fetchOrError.mockResolvedValue({
      ok: true,
      status: 403,
      json: { success: false, message: "Only event guests can leave." },
    })
    const response = await POST(request(), ctx())
    expect(response.status).toBe(403)
    expect((await response.json()).message).toBe("Only event guests can leave.")
  })

  it("returns the upstream error response when fetchOrError cannot complete", async () => {
    fetchOrError.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ success: false, message: "Unexpected server error" }, { status: 500 }),
    })
    expect((await POST(request(), ctx())).status).toBe(500)
  })

  it("rejects malformed 2xx bodies instead of reporting a successful leave", async () => {
    for (const json of [
      { success: false, data: {} },
      { success: true, data: { event: "unexpected" } },
      { success: true, data: [] },
      { success: true },
    ]) {
      fetchOrError.mockResolvedValue({ ok: true, status: 200, json })
      expect((await POST(request(), ctx())).status).toBe(502)
    }
  })
})
