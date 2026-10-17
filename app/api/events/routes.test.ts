// @vitest-environment node
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
const proxyJson = vi.fn()
const fetchJson = vi.fn()

vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))
vi.mock("@/lib/server-fetch", () => ({
	proxyJson: (...args: unknown[]) => proxyJson(...args),
	fetchJson: (...args: unknown[]) => fetchJson(...args),
	UpstreamError: class UpstreamError extends Error {
		status: number
		constructor(message: string, status: number) {
			super(message)
			this.status = status
		}
	},
}))

import { GET as getMyEvents } from "./my-events/route"
import { POST as postMyLocation } from "./my-location/route"
import { GET as getNearby } from "./nearby/route"

const req = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
	new NextRequest(`http://localhost${url}`, init)
const upstreamUrl = () => new URL(proxyJson.mock.calls[0][0] as string)

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	proxyJson.mockResolvedValue(new Response("{}"))
})

describe("GET /api/events/nearby", () => {
	it("returns 401 without a session and never calls upstream", async () => {
		getAccessToken.mockResolvedValue(undefined)
		const res = await getNearby(req("/api/events/nearby?latitude=9.9&longitude=8.9"))
		expect(res.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("returns 400 for invalid coordinates and never calls upstream", async () => {
		const res = await getNearby(req("/api/events/nearby?latitude=&longitude="))
		expect(res.status).toBe(400)
		expect((await res.json()).code).toBe("invalid_coordinates")
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("calls only location/nearby with radius_km=25 even if the client asks for more", async () => {
		await getNearby(req("/api/events/nearby?latitude=9.9&longitude=8.9&radius_km=500"))
		const url = upstreamUrl()
		expect(url.pathname.endsWith("/events/location/nearby")).toBe(true)
		expect(url.searchParams.getAll("radius_km")).toEqual(["25"])
	})

	it("sends the bearer token from the cookie", async () => {
		await getNearby(req("/api/events/nearby?latitude=0&longitude=0"))
		expect(proxyJson.mock.calls[0][1].headers.Authorization).toBe("Bearer token")
	})
})

describe("GET /api/events/my-events", () => {
	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await getMyEvents(req("/api/events/my-events"))).status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("calls list with filter=my_events when there is no search", async () => {
		await getMyEvents(req("/api/events/my-events?filter=all"))
		const url = upstreamUrl()
		expect(url.pathname.endsWith("/events/list")).toBe(true)
		expect(url.searchParams.getAll("filter")).toEqual(["my_events"])
	})

	it("calls search with q and filter=my_events when searching", async () => {
		await getMyEvents(req("/api/events/my-events?q=jos"))
		const url = upstreamUrl()
		expect(url.pathname.endsWith("/events/search")).toBe(true)
		expect(url.searchParams.get("q")).toBe("jos")
		expect(url.searchParams.getAll("filter")).toEqual(["my_events"])
	})
})

describe("POST /api/events/my-location", () => {
	const post = (body: unknown) =>
		postMyLocation(
			req("/api/events/my-location", {
				method: "POST",
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			}),
		)

	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await post({ latitude: 1, longitude: 1 })).status).toBe(401)
	})

	it("returns 400 for invalid coordinates", async () => {
		expect((await post({ latitude: 1 })).status).toBe(400)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("always asks the backend to resolve the supplied point", async () => {
		fetchJson.mockResolvedValue({ status: 201, json: { success: true, data: { address: "Jos" } } })
		const res = await post({ latitude: 9.9, longitude: 8.9 })
		expect(res.status).toBe(201)
		expect(JSON.parse(fetchJson.mock.calls[0][1].body).use_live_location).toBe(false)
	})

	it("downgrades upstream failures to 200 + success:false so no global toast fires", async () => {
		fetchJson.mockResolvedValue({ status: 400, json: { success: false } })
		const res = await post({ latitude: 9.9, longitude: 8.9 })
		expect(res.status).toBe(200)
		expect(await res.json()).toMatchObject({ success: false, data: null })
	})

	it("downgrades network/timeout failures the same way", async () => {
		const { UpstreamError } = await import("@/lib/server-fetch")
		fetchJson.mockRejectedValue(new UpstreamError("timeout", 504))
		const res = await post({ latitude: 9.9, longitude: 8.9 })
		expect(res.status).toBe(200)
		expect((await res.json()).success).toBe(false)
	})

	it("still passes a 401 through so the session can refresh", async () => {
		fetchJson.mockResolvedValue({ status: 401, json: { success: false } })
		expect((await post({ latitude: 9.9, longitude: 8.9 })).status).toBe(401)
	})
})
