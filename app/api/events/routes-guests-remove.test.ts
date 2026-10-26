// @vitest-environment node
//
// P3-08A: POST /api/events/[eventId]/guests/remove. Only cookies are mocked; the real
// `@/lib/server-fetch` runs on a stubbed global `fetch`. Backend behaviour is guide-derived (§4.14).
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { POST as removeGuest } from "./[eventId]/guests/remove/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const post = (body: unknown, headers: Record<string, string> = { "content-type": "application/json" }) =>
	new NextRequest(`http://localhost/api/events/${ID}/guests/remove`, {
		method: "POST",
		headers,
		body: typeof body === "string" ? body : JSON.stringify(body),
	})

const fetchMock = vi.fn()
const reply = (body: unknown, status = 200) =>
	new Response(typeof body === "string" ? body : JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})
const removed = () => ({ success: true, status_code: 200, message: "Guest removed successfully.", data: {} })
const sentInit = () => fetchMock.mock.calls[0][1] as RequestInit & { headers: Record<string, string> }

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchMock.mockImplementation(async () => reply(removed()))
	vi.stubGlobal("fetch", fetchMock)
	for (const m of ["error", "log", "warn"] as const) vi.spyOn(console, m).mockImplementation(() => {})
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe("POST /api/events/[eventId]/guests/remove", () => {
	it("forwards only user_id to guests/remove with the bearer token", async () => {
		const res = await removeGuest(post({ user_id: 42, role: "host", event: "x", is_host: true }), ctx())
		expect(res.status).toBe(200)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const url = new URL(String(fetchMock.mock.calls[0][0]))
		expect(url.pathname.endsWith(`/events/${ID}/guests/remove`)).toBe(true)
		expect(url.search).toBe("")
		expect(sentInit().method).toBe("POST")
		expect(sentInit().headers.Authorization).toBe("Bearer token")
		expect(JSON.parse(String(sentInit().body))).toEqual({ user_id: 42 })
	})

	it("returns the success envelope with empty data", async () => {
		fetchMock.mockImplementation(async () => reply({ ...removed(), data: { leaked: "x" } }))
		const res = await removeGuest(post({ user_id: 5 }), ctx())
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual(removed())
	})

	it.each([undefined, null, "5", "abc", 0, -3, 1.5, NaN, true, [5], { id: 5 }, 2 ** 60])(
		"rejects user_id %j with 400 and no upstream request",
		async (user_id) => {
			const res = await removeGuest(post({ user_id }), ctx())
			expect(res.status).toBe(400)
			expect((await res.json()).code).toBe("invalid_guest")
			expect(fetchMock).not.toHaveBeenCalled()
		},
	)

	it.each([null, [], "text", 5])("rejects the body %j with 400 and no upstream request", async (body) => {
		const res = await removeGuest(post(JSON.stringify(body)), ctx())
		expect(res.status).toBe(400)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("rejects unparseable JSON and a non-JSON content type without calling upstream", async () => {
		expect((await removeGuest(post("{nope"), ctx())).status).toBe(400)
		expect((await removeGuest(post({ user_id: 1 }, { "content-type": "text/plain" }), ctx())).status).toBe(415)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("rejects a malformed event id with 404 and no upstream request", async () => {
		const res = await removeGuest(post({ user_id: 1 }), ctx("not-a-uuid"))
		expect(res.status).toBe(404)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("answers 401 without a token and makes no upstream request", async () => {
		getAccessToken.mockResolvedValue(null)
		const res = await removeGuest(post({ user_id: 1 }), ctx())
		expect(res.status).toBe(401)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("passes the host-only 403 through, distinct from a missing event", async () => {
		fetchMock.mockImplementation(async () =>
			reply({ success: false, status_code: 403, message: "Only event hosts can remove guests.", code: "permission_denied" }, 403),
		)
		const res = await removeGuest(post({ user_id: 1 }), ctx())
		expect(res.status).toBe(403)
		expect((await res.json()).message).toBe("Only event hosts can remove guests.")
	})

	it("passes the 'Guest not found' 404 through with its message", async () => {
		fetchMock.mockImplementation(async () =>
			reply({ success: false, status_code: 404, message: "Guest not found in this event." }, 404),
		)
		const res = await removeGuest(post({ user_id: 1 }), ctx())
		expect(res.status).toBe(404)
		expect((await res.json()).message).toBe("Guest not found in this event.")
	})

	it.each([
		["a non-JSON success body", "<html>ok</html>"],
		["a success without the envelope", { removed: true }],
		["success:false on a 200", { success: false, status_code: 200, message: "no", data: {} }],
	])("turns %s into 502, never a success", async (_n, body) => {
		fetchMock.mockImplementation(async () => reply(body, 200))
		const res = await removeGuest(post({ user_id: 1 }), ctx())
		expect(res.status).toBe(502)
	})

	it("does not log the token or the body", async () => {
		fetchMock.mockImplementation(async () => reply("boom", 500))
		await removeGuest(post({ user_id: 77 }), ctx())
		const logged = JSON.stringify([...vi.mocked(console.error).mock.calls, ...vi.mocked(console.log).mock.calls])
		expect(logged).not.toContain("token")
	})
})
