// @vitest-environment node
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
const fetchJson = vi.fn()

vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))
vi.mock("@/lib/server-fetch", async () => {
	// the real proxyJson on top of a mocked fetchJson, so error mapping is the real one
	class UpstreamError extends Error {
		status: number
		constructor(message: string, status: number) {
			super(message)
			this.status = status
		}
	}
	const { NextResponse } = await import("next/server")
	return {
		UpstreamError,
		fetchJson: (...args: unknown[]) => fetchJson(...args),
		proxyJson: async (url: string, init: unknown) => {
			try {
				const { status, json } = await fetchJson(url, init)
				return NextResponse.json(json, { status })
			} catch (error) {
				if (error instanceof UpstreamError) {
					return NextResponse.json(
						{ success: false, message: error.message },
						{ status: error.status },
					)
				}
				return NextResponse.json(
					{ success: false, message: "Unexpected server error" },
					{ status: 500 },
				)
			}
		},
	}
})

import { UpstreamError } from "@/lib/server-fetch"
import { GET as getComments } from "./[eventId]/comments/route"
import { GET as getGuests } from "./[eventId]/guests/route"
import { GET as getResources } from "./[eventId]/resources/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (url: string) => new NextRequest(`http://localhost${url}`)
const ok = (data: unknown, status = 200) => ({
	status,
	json: { success: true, status_code: status, data },
})

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchJson.mockResolvedValue(ok({}))
})

const routes = [
	{ name: "resources", get: getResources, paged: false },
	{ name: "comments", get: getComments, paged: true },
	{ name: "guests", get: getGuests, paged: true },
] as const

for (const { name, get, paged } of routes) {
	describe(`GET /api/events/[eventId]/${name}`, () => {
		it("returns 401 without a session and never calls upstream", async () => {
			getAccessToken.mockResolvedValue(undefined)
			expect((await get(req(`/api/events/${ID}/${name}`), ctx())).status).toBe(401)
			expect(fetchJson).not.toHaveBeenCalled()
		})

		it("answers a malformed id with the normal 404 envelope, without calling upstream", async () => {
			const res = await get(req(`/api/events/x/${name}`), ctx("not-a-uuid"))
			expect(res.status).toBe(404)
			expect((await res.json()).code).toBe("not_found")
			expect(fetchJson).not.toHaveBeenCalled()
		})

		it("rejects an id that tries to alter the upstream path", async () => {
			for (const bad of ["../x", `${ID}/guests`, `${ID}?x=1`, `${ID}%2F..`]) {
				expect((await get(req(`/api/events/x/${name}`), ctx(bad))).status).toBe(404)
			}
			expect(fetchJson).not.toHaveBeenCalled()
		})

		it("forwards the bearer token to the matching upstream endpoint", async () => {
			await get(req(`/api/events/${ID}/${name}`), ctx())
			const [url, init] = fetchJson.mock.calls[0]
			expect(url).toContain(`/events/${ID}/${name}`)
			expect(init.headers.Authorization).toBe("Bearer token")
			expect(init.cache).toBe("no-store")
		})

		it("passes upstream 403 and 404 through unchanged", async () => {
			for (const status of [403, 404]) {
				fetchJson.mockResolvedValue({
					status,
					json: { success: false, message: "denied", code: "x" },
				})
				const res = await get(req(`/api/events/${ID}/${name}`), ctx())
				expect(res.status).toBe(status)
				expect((await res.json()).message).toBe("denied")
			}
		})

		it("does not crash on a non-JSON upstream body (502 envelope)", async () => {
			fetchJson.mockRejectedValue(
				new UpstreamError("Upstream returned an unexpected response", 502),
			)
			const res = await get(req(`/api/events/${ID}/${name}`), ctx())
			expect(res.status).toBe(502)
			expect((await res.json()).success).toBe(false)
		})

		it("returns a 500 envelope on an unexpected failure", async () => {
			fetchJson.mockRejectedValue(new Error("boom"))
			expect((await get(req(`/api/events/${ID}/${name}`), ctx())).status).toBe(500)
		})

		it("never forwards an unrelated client parameter", async () => {
			await get(
				req(`/api/events/${ID}/${name}?filter=x&q=y&radius_km=999&token=z&page=2&limit=5`),
				ctx(),
			)
			const url = new URL(fetchJson.mock.calls[0][0])
			expect([...url.searchParams.keys()].sort()).toEqual(paged ? ["limit", "page"] : [])
		})
	})
}

for (const { name, get } of routes.filter((r) => r.paged)) {
	describe(`${name}: page and limit`, () => {
		const sent = () => new URL(fetchJson.mock.calls[0][0]).searchParams

		it("forwards a valid page and limit", async () => {
			await get(req(`/api/events/${ID}/${name}?page=3&limit=25`), ctx())
			expect(sent().get("page")).toBe("3")
			expect(sent().get("limit")).toBe("25")
		})

		it("clamps limit to the backend maximum of 100", async () => {
			await get(req(`/api/events/${ID}/${name}?limit=5000`), ctx())
			expect(sent().get("limit")).toBe("100")
		})

		it("falls back on invalid values instead of forwarding them", async () => {
			await get(req(`/api/events/${ID}/${name}?page=-1&limit=abc`), ctx())
			expect(sent().get("page")).toBe("1")
			expect(Number(sent().get("limit"))).toBeGreaterThanOrEqual(1)
			expect(Number(sent().get("limit"))).toBeLessThanOrEqual(100)
			fetchJson.mockClear()
			await get(req(`/api/events/${ID}/${name}?page=1.5&limit=0`), ctx())
			expect(sent().get("page")).toBe("1")
			expect(Number(sent().get("limit"))).toBeGreaterThanOrEqual(1)
		})

		it("cannot inject extra upstream parameters through page or limit", async () => {
			await get(req(`/api/events/${ID}/${name}?page=2%26filter%3Dall&limit=5%26x%3D1`), ctx())
			expect([...sent().keys()].sort()).toEqual(["limit", "page"])
			expect(sent().get("page")).toBe("1")
		})
	})
}

describe("resources: no query is forwarded", () => {
	it("calls the bare endpoint even when a page is supplied", async () => {
		await getResources(req(`/api/events/${ID}/resources?page=2&limit=5`), ctx())
		expect(fetchJson.mock.calls[0][0].endsWith(`/events/${ID}/resources`)).toBe(true)
	})
})
