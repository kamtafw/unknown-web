// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { GET } from "./route"

describe("GET /api/events/socket-credential", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("requires the authenticated httpOnly-cookie session", async () => {
    getAccessToken.mockResolvedValue(undefined)

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      success: false,
      message: "Not authenticated",
    })
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(response.headers.get("vary")).toBe("Cookie")
  })

  it("returns the documented handshake token without allowing caching", async () => {
    getAccessToken.mockResolvedValue("normal-access-jwt")

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      success: true,
      data: { token: "normal-access-jwt" },
    })
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0")
    expect(response.headers.get("pragma")).toBe("no-cache")
    expect(response.headers.get("vary")).toBe("Cookie")
  })
})
