// @vitest-environment node
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
const fetchJson = vi.fn()

vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))
vi.mock("@/lib/server-fetch", () => ({
  fetchJson: (...args: unknown[]) => fetchJson(...args),
  UpstreamError: class UpstreamError extends Error {
    status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
}))

import { POST } from "./route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId = ID) => ({ params: Promise.resolve({ eventId }) })
const request = (body?: unknown) =>
  new NextRequest("http://localhost/api/events/" + ID + "/join", {
    method: "POST",
    ...(body === undefined
      ? {}
      : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
  })

beforeEach(() => {
  vi.clearAllMocks()
  getAccessToken.mockResolvedValue("token")
  fetchJson.mockResolvedValue({
    status: 201,
    json: { success: true, status_code: 201, data: { live_session_id: 72, socket: null } },
  })
})

describe("POST /api/events/[eventId]/join", () => {
  it("requires authentication", async () => {
    getAccessToken.mockResolvedValue(undefined)
    expect((await POST(request(), ctx())).status).toBe(401)
    expect(fetchJson).not.toHaveBeenCalled()
  })

  it("rejects an invalid event id before calling upstream", async () => {
    expect((await POST(request(), ctx("bad-id"))).status).toBe(404)
    expect(fetchJson).not.toHaveBeenCalled()
  })

  it("forwards the optional passcode only in the JSON body", async () => {
    const response = await POST(request({ passcode: "0042" }), ctx())
    expect(response.status).toBe(201)
    const [url, init] = fetchJson.mock.calls[0]
    expect(url).toBe(expect.stringContaining("/events/" + ID + "/join"))
    expect(init.headers.Authorization).toBe("Bearer token")
    expect(JSON.parse(init.body)).toEqual({ passcode: "0042" })
    expect(url).not.toContain("0042")
  })

  it("sends an empty object when no passcode is supplied", async () => {
    await POST(request(), ctx())
    expect(JSON.parse(fetchJson.mock.calls[0][1].body)).toEqual({})
  })

  it("rejects malformed passcodes without calling upstream", async () => {
    for (const passcode of ["42", "abcd", " 042", 42]) {
      const response = await POST(request({ passcode }), ctx())
      expect(response.status).toBe(400)
    }
    expect(fetchJson).not.toHaveBeenCalled()
  })

  it("preserves backend admission errors", async () => {
    fetchJson.mockResolvedValue({
      status: 403,
      json: { success: false, message: "Incorrect passcode." },
    })
    const response = await POST(request({ passcode: "0042" }), ctx())
    expect(response.status).toBe(403)
    expect((await response.json()).message).toBe("Incorrect passcode.")
  })
})
