// @vitest-environment node
//
// Pass 3 read-side BFF routes. Only cookies are mocked: the real `@/lib/server-fetch`
// (fetchJson / UpstreamError) runs on top of a stubbed global `fetch`, so the status mapping and
// the non-JSON handling tested here are the shared implementation's, not a copy of it.
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { GET as getComments } from "./[eventId]/comments/route"
import { GET as getGuests } from "./[eventId]/guests/route"
import { GET as getResources } from "./[eventId]/resources/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (url: string) => new NextRequest(`http://localhost${url}`)

const fetchMock = vi.fn()
const reply = (body: unknown, status = 200) =>
	new Response(typeof body === "string" ? body : JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})
const sentUrl = () => new URL(String(fetchMock.mock.calls[0][0]))
const sentInit = () => fetchMock.mock.calls[0][1] as RequestInit & { headers: Record<string, string> }

/* what the backend documents (guide §4.12, §4.16, §4.17), plus the fields the BFF must remove */
const guestsBody = () => ({
	success: true,
	status_code: 200,
	message: "Record retrieved successfully",
	data: {
		count: 1,
		total_pages: 1,
		limit: 20,
		current: 1,
		previous: null,
		next: null,
		results: [
			{
				user_id: 7,
				user_photo: "p.jpg",
				user_full_name: "Bola Ade",
				user_username: "bola",
				role: "guest",
				rsvp_status: "going",
				joined_at: "2026-10-30T09:00:00Z",
			},
		],
	},
})
const commentsBody = () => ({
	success: true,
	status_code: 200,
	message: "Record retrieved successfully",
	data: {
		count: 1,
		total_pages: 1,
		limit: 10,
		current: 1,
		previous: null,
		next: "https://api.example.com/events/x/comments?page=2",
		results: [
			{
				id: "c1",
				message: "See you there",
				created_at: "2026-11-01T10:00:00Z",
				user: {
					pkid: 9,
					id: "user-uuid",
					photo: "a.jpg",
					full_name: "Ada Obi",
					username: "ada",
					role: "host",
					joined_at: "2026-10-01T10:00:00Z",
				},
			},
		],
	},
})
const resourcesBody = () => ({
	success: true,
	status_code: 200,
	message: null,
	data: {
		event: "Jos Tech Meetup",
		links: [{ link_name: "Agenda", url: "https://example.com/a", date_added: "01/11/2026" }],
		documents: [
			{ doc_name: "Slides", doc_file: "d/s.pdf", size: "1 MB", file_type: "PDF", date_uploaded: "02/11/2026" },
		],
	},
})

const routes = [
	{ name: "resources", get: getResources, paged: false, body: resourcesBody, banned: ["Jos Tech Meetup", "date_added", "01/11/2026"] },
	{ name: "comments", get: getComments, paged: true, body: commentsBody, banned: ["pkid", "user-uuid", "joined_at", "2026-10-01"] },
	{ name: "guests", get: getGuests, paged: true, body: guestsBody, banned: ["rsvp_status", "going", "joined_at", "2026-10-30"] },
] as const

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchMock.mockImplementation(async () => reply({ success: true, data: {} }))
	vi.stubGlobal("fetch", fetchMock)
	// the shared fetchJson logs upstream failures; keep the test output clean
	vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

for (const { name, get, body, banned } of routes) {
	describe(`GET /api/events/[eventId]/${name}`, () => {
		const call = (qs = "") => get(req(`/api/events/${ID}/${name}${qs}`), ctx())

		it("returns 401 without a session and never calls upstream", async () => {
			getAccessToken.mockResolvedValue(undefined)
			expect((await call()).status).toBe(401)
			expect(fetchMock).not.toHaveBeenCalled()
		})

		it("answers a malformed id with the normal 404 envelope, without calling upstream", async () => {
			const res = await get(req(`/api/events/x/${name}`), ctx("not-a-uuid"))
			expect(res.status).toBe(404)
			expect((await res.json()).code).toBe("not_found")
			expect(fetchMock).not.toHaveBeenCalled()
		})

		it("rejects an id that tries to alter the upstream path", async () => {
			for (const bad of ["../x", `${ID}/guests`, `${ID}?x=1`, `${ID}%2F..`]) {
				expect((await get(req(`/api/events/x/${name}`), ctx(bad))).status).toBe(404)
			}
			expect(fetchMock).not.toHaveBeenCalled()
		})

		it("sends the bearer token to the matching upstream endpoint, uncached", async () => {
			fetchMock.mockImplementation(async () => reply(body()))
			await call()
			expect(sentUrl().pathname.endsWith(`/events/${ID}/${name}`)).toBe(true)
			expect(sentInit().headers.Authorization).toBe("Bearer token")
			expect(sentInit().cache).toBe("no-store")
		})

		it("returns the minimised JSON: excluded fields never appear in the response body", async () => {
			fetchMock.mockImplementation(async () => reply(body()))
			const res = await call()
			expect(res.status).toBe(200)
			const text = await res.text()
			for (const gone of banned) expect(text).not.toContain(gone)
			expect(JSON.parse(text).success).toBe(true)
		})

		it("passes upstream 403 and 404 through with their own status and body", async () => {
			for (const status of [403, 404]) {
				const upstream = { success: false, status_code: status, message: "denied", code: "x", errors: null }
				fetchMock.mockImplementation(async () => reply(upstream, status))
				const res = await call()
				expect(res.status).toBe(status)
				expect(await res.json()).toEqual(upstream)
			}
		})

		it("answers 502 when a successful body is not the documented shape (fail closed)", async () => {
			for (const bad of [{ success: true, data: null }, { success: true, data: {} }, { success: true }, [], "text-as-json"]) {
				fetchMock.mockImplementation(async () => reply(JSON.stringify(bad)))
				const res = await call()
				expect(res.status).toBe(502)
				const out = await res.json()
				expect(out.code).toBe("invalid_upstream_response")
				expect(JSON.stringify(out)).not.toContain("text-as-json")
			}
		})

		it("answers 502 for a successful empty body, instead of forwarding it", async () => {
			fetchMock.mockImplementation(async () => new Response(null, { status: 204 }))
			expect((await call()).status).toBe(502)
		})

		it("answers 502 for a non-JSON upstream body (real fetchJson)", async () => {
			fetchMock.mockImplementation(async () => new Response("<html>bad gateway</html>", { status: 200 }))
			const res = await call()
			expect(res.status).toBe(502)
			const text = await res.text()
			expect(text).not.toContain("<html>")
			expect(JSON.parse(text).success).toBe(false)
		})

		it("answers 502 when the upstream is unreachable and 504 on a timeout (real fetchJson)", async () => {
			fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))
			expect((await call()).status).toBe(502)
			fetchMock.mockRejectedValueOnce(Object.assign(new Error("timeout"), { name: "TimeoutError" }))
			expect((await call()).status).toBe(504)
		})

		it("never forwards an unrelated client parameter", async () => {
			fetchMock.mockImplementation(async () => reply(body()))
			await call("?filter=x&q=y&radius_km=999&token=z&page=2&limit=5")
			const keys = [...sentUrl().searchParams.keys()].sort()
			expect(keys).toEqual(name === "resources" ? [] : ["limit", "page"])
		})
	})
}

for (const { name, get, body } of routes.filter((r) => r.paged)) {
	describe(`${name}: page and limit`, () => {
		const call = (qs: string) => get(req(`/api/events/${ID}/${name}${qs}`), ctx())
		beforeEach(() => fetchMock.mockImplementation(async () => reply(body())))

		it("forwards a valid page and limit", async () => {
			await call("?page=3&limit=25")
			expect(sentUrl().searchParams.get("page")).toBe("3")
			expect(sentUrl().searchParams.get("limit")).toBe("25")
		})

		it("clamps limit to the backend maximum of 100", async () => {
			await call("?limit=5000")
			expect(sentUrl().searchParams.get("limit")).toBe("100")
		})

		it("falls back on invalid values instead of forwarding them", async () => {
			await call("?page=-1&limit=abc")
			expect(sentUrl().searchParams.get("page")).toBe("1")
			const limit = Number(sentUrl().searchParams.get("limit"))
			expect(limit).toBeGreaterThanOrEqual(1)
			expect(limit).toBeLessThanOrEqual(100)
		})

		it("cannot inject extra upstream parameters through page or limit", async () => {
			await call("?page=2%26filter%3Dall&limit=5%26x%3D1")
			expect([...sentUrl().searchParams.keys()].sort()).toEqual(["limit", "page"])
			expect(sentUrl().searchParams.get("page")).toBe("1")
		})

		it("keeps the pagination fields, including a next link on an empty page", async () => {
			fetchMock.mockImplementation(async () =>
				reply({ success: true, status_code: 200, message: null, data: { count: 40, total_pages: 4, limit: 10, current: 2, previous: "p", next: "n", results: [] } }),
			)
			const out = await (await call("?page=2")).json()
			expect(out.data).toEqual({ count: 40, total_pages: 4, limit: 10, current: 2, previous: "p", next: "n", results: [] })
		})
	})
}

describe("resources: no query is forwarded", () => {
	it("calls the bare endpoint even when a page is supplied", async () => {
		fetchMock.mockImplementation(async () => reply(resourcesBody()))
		await getResources(req(`/api/events/${ID}/resources?page=2&limit=5`), ctx())
		expect(sentUrl().search).toBe("")
	})
})
