// @vitest-environment node
//
// P4-01: GET /api/events/[eventId]/live-session. Only cookies are mocked; the real
// `@/lib/server-fetch` runs on a stubbed global `fetch`. Backend behaviour is guide-derived (§4.18).
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import * as liveSessionRoute from "./[eventId]/live-session/route"

const { GET } = liveSessionRoute

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (path = `/api/events/${ID}/live-session`) => new NextRequest(`http://localhost${path}`)

const fetchMock = vi.fn()
const reply = (body: unknown, status = 200) =>
	new Response(typeof body === "string" ? body : JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})
const sentUrl = () => new URL(String(fetchMock.mock.calls[0][0]))
const sentInit = () =>
	fetchMock.mock.calls[0][1] as RequestInit & { headers: Record<string, string> }

/** the full §5.1 session, with everything the BFF must not forward */
const upstream = () => ({
	success: true,
	status_code: 200,
	message: null,
	data: {
		event_id: ID,
		live_session: {
			id: 55,
			title: "Jazz night",
			description: "private notes",
			host: { id: "u-host", pkid: 3, username: "hosty", first_name: "Ho", last_name: "Sty" },
			session_type: "private",
			status: "live",
			participant_count: 2,
			hashtags: ["secrethash"],
			invite_code: "11111111-2222-3333-4444-555555555555",
			participants: [
				{ id: 1, user: { pkid: 9, username: "someone-else", first_name: "Else" }, role: "host" },
			],
			started_at: "2026-11-01T18:00:00Z",
			ended_at: null,
			created_at: "2026-10-30T10:00:00Z",
			is_joined: false,
			current_user_role: null,
			media: {
				provider: "p2p",
				status: "legacy",
				room: "room-secret-name",
				last_webhook_at: "2026-11-01T18:01:00Z",
				permissions: { can_subscribe: true, room_admin: false },
			},
			reaction_counts: { "👍": 3 },
			series: { id: 1 },
			scheduled_start_at: null,
		},
		socket: {
			namespace: "/live",
			join_event: "live:join",
			join_payload: { sessionId: 55 },
			server_url: "wss://leak.example",
			token: "leaked-token",
		},
	},
})

const BANNED = [
	"private notes",
	"hosty",
	"someone-else",
	"secrethash",
	"11111111-2222",
	"room-secret-name",
	"last_webhook_at",
	"can_subscribe",
	"leak.example",
	"leaked-token",
	"reaction_counts",
	"scheduled_start_at",
	"created_at",
]

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchMock.mockImplementation(async () => reply(upstream()))
	vi.stubGlobal("fetch", fetchMock)
	for (const m of ["error", "log", "warn"] as const)
		vi.spyOn(console, m).mockImplementation(() => {})
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe("GET /api/events/[eventId]/live-session", () => {
	it("returns 401 without a session and never calls upstream", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await GET(req(), ctx())).status).toBe(401)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("answers a malformed id with the normal 404 envelope, without calling upstream", async () => {
		const res = await GET(req("/api/events/x/live-session"), ctx("not-a-uuid"))
		expect(res.status).toBe(404)
		expect((await res.json()).code).toBe("not_found")
		for (const bad of ["../x", `${ID}/start`, `${ID}?x=1`, `${ID}%2F..`]) {
			expect((await GET(req("/api/events/x/live-session"), ctx(bad))).status).toBe(404)
		}
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("reads the documented upstream path with the bearer token, uncached, and no query", async () => {
		await GET(req(`/api/events/${ID}/live-session?page=2&x=1&is_live=true`), ctx())
		expect(fetchMock).toHaveBeenCalledTimes(1)
		expect(sentUrl().pathname.endsWith(`/events/${ID}/live-session`)).toBe(true)
		expect(sentUrl().search).toBe("")
		expect(sentInit().method ?? "GET").toBe("GET")
		expect(sentInit().body).toBeUndefined()
		expect(sentInit().headers.Authorization).toBe("Bearer token")
		expect(sentInit().cache).toBe("no-store")
	})

	it("sends no platform or version header (the read does not need them)", async () => {
		await GET(req(), ctx())
		const names = Object.keys(sentInit().headers).map((h) => h.toLowerCase())
		expect(names).not.toContain("x-platform")
		expect(names).not.toContain("x-app-version")
	})

	it("returns only the status-level fields; other people's data never reaches the browser", async () => {
		const res = await GET(req(), ctx())
		expect(res.status).toBe(200)
		const text = await res.text()
		for (const gone of BANNED) expect(text).not.toContain(gone)
		expect(JSON.parse(text)).toEqual({
			success: true,
			status_code: 200,
			message: null,
			data: {
				event_id: ID,
				live_session: {
					id: 55,
					title: "Jazz night",
					session_type: "private",
					status: "live",
					participant_count: 2,
					started_at: "2026-11-01T18:00:00Z",
					ended_at: null,
					is_joined: false,
					current_user_role: null,
					media: { provider: "p2p", status: "legacy" },
				},
				socket: { namespace: "/live", join_event: "live:join", join_payload: { sessionId: 55 } },
			},
		})
	})

	it("keeps a null socket (legacy event) as null", async () => {
		const body = upstream()
		body.data.socket = null as never
		fetchMock.mockImplementation(async () => reply(body))
		const res = await GET(req(), ctx())
		expect(res.status).toBe(200)
		expect((await res.json()).data.socket).toBeNull()
	})

	it("passes upstream 403 and both 404s through with their own status and body", async () => {
		const cases = [
			[403, "Join this event before accessing its live session."],
			[404, "This event does not have a live session."],
			[404, "Event not found."],
		] as const
		for (const [status, message] of cases) {
			const body = { success: false, status_code: status, message, code: "x", errors: null }
			fetchMock.mockImplementation(async () => reply(body, status))
			const res = await GET(req(), ctx())
			expect(res.status).toBe(status)
			expect(await res.json()).toEqual(body)
		}
	})

	it("passes an upstream 401 through (the shared auth flow handles it)", async () => {
		fetchMock.mockImplementation(async () =>
			reply({ success: false, message: "Token invalid" }, 401),
		)
		expect((await GET(req(), ctx())).status).toBe(401)
	})

	it("answers 502 when a successful body is not the documented shape (fail closed)", async () => {
		for (const bad of [
			{ success: true, data: null },
			{ success: true, data: {} },
			{ success: true, data: { event_id: ID, live_session: null } },
			{ success: true, data: { event_id: ID, live_session: [] } },
			{ success: true },
			[],
			"text-as-json",
		]) {
			fetchMock.mockImplementation(async () => reply(JSON.stringify(bad)))
			const res = await GET(req(), ctx())
			expect(res.status).toBe(502)
			const out = await res.json()
			expect(out.code).toBe("invalid_upstream_response")
			expect(JSON.stringify(out)).not.toContain("text-as-json")
		}
	})

	it("answers 502 for a successful empty body, and for a network failure", async () => {
		fetchMock.mockImplementation(async () => new Response(null, { status: 204 }))
		expect((await GET(req(), ctx())).status).toBe(502)
		fetchMock.mockRejectedValue(new Error("offline"))
		expect((await GET(req(), ctx())).status).toBe(502)
	})

	it("exports GET only: there is no start, end, create, join or leave here", () => {
		expect(Object.keys(liveSessionRoute).sort()).toEqual(["GET"])
	})
})
