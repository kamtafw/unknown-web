// @vitest-environment node
// Live-session lifecycle BFF routes: the real server-fetch implementation runs over stubbed fetch.
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { POST as createSession } from "./[eventId]/live-session/route"
import { POST as startSession } from "./[eventId]/live-session/start/route"
import { POST as endSession } from "./[eventId]/live-session/end/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (url: string) => new NextRequest(`http://localhost${url}`)
const fetchMock = vi.fn()
const reply = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
const sentInit = () => fetchMock.mock.calls[0][1] as RequestInit
const sentHeaders = () => new Headers(sentInit().headers)

const sessionBody = (status = "waiting") => ({
	success: true,
	status_code: 201,
	message: "Event live session created successfully.",
	data: {
		event_id: ID,
		is_live: status === "live",
		live_session: {
			id: 71,
			title: "Test live session",
			status,
			session_type: "private",
			participant_count: 1,
			current_user_role: "host",
			is_joined: true,
			media: { provider: "p2p", status: "legacy" },
			token: "must-not-reach-browser",
			room_id: "private-room-secret",
		},
		socket: {
			namespace: "/live",
			join_event: "live:join",
			join_payload: { sessionId: 71 },
			access_token: "must-not-reach-browser",
		},
	},
})

describe("event live-session lifecycle routes", () => {
	beforeEach(() => {
		getAccessToken.mockResolvedValue("access-token")
		fetchMock.mockReset()
		vi.stubGlobal("fetch", fetchMock)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.clearAllMocks()
	})

	it("creates a waiting session without a body and sends web platform/version headers", async () => {
		fetchMock.mockResolvedValue(reply(sessionBody(), 201))

		const response = await createSession(req(`/api/events/${ID}/live-session`), ctx())
		const body = await response.json()

		expect(response.status).toBe(201)
		expect(body.data.live_session.id).toBe(71)
		expect(JSON.stringify(body)).not.toContain("must-not-reach-browser")
		expect(sentInit().method).toBe("POST")
		expect(sentInit().body).toBeUndefined()
		expect(sentHeaders().get("authorization")).toBe("Bearer access-token")
		expect(sentHeaders().get("x-platform")).toBe("web")
		expect(sentHeaders().get("x-app-version")).toBe("0.1.0")
		expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
			"/api/v1/events/" + ID + "/live-session",
		)
	})

	it("starts a waiting session through the documented endpoint with web metadata", async () => {
		fetchMock.mockResolvedValue(reply(sessionBody("live"), 200))

		const response = await startSession(req(`/api/events/${ID}/live-session/start`), ctx())
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(body.data.live_session.status).toBe("live")
		expect(sentInit().body).toBeUndefined()
		expect(sentHeaders().get("x-platform")).toBe("web")
		expect(sentHeaders().get("x-app-version")).toBe("0.1.0")
		expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
			"/api/v1/events/" + ID + "/live-session/start",
		)
	})

	it("ends a session and returns only the documented lifecycle fields", async () => {
		fetchMock.mockResolvedValue(
			reply({
				success: true,
				status_code: 200,
				message: "Event live session ended successfully.",
				data: {
					event_id: ID,
					is_live: false,
					live_session_id: 71,
					synchronization_status: "synchronized",
					token: "must-not-reach-browser",
					room_id: "private-room-secret",
				},
			}),
		)

		const response = await endSession(req(`/api/events/${ID}/live-session/end`), ctx())
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(body.data).toEqual({
			event_id: ID,
			is_live: false,
			live_session_id: 71,
			synchronization_status: "synchronized",
		})
		expect(JSON.stringify(body)).not.toContain("must-not-reach-browser")
		expect(sentInit().body).toBeUndefined()
		expect(sentHeaders().get("x-platform")).toBeNull()
		expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe(
			"/api/v1/events/" + ID + "/live-session/end",
		)
	})

	it("preserves backend host-authorization errors", async () => {
		fetchMock.mockResolvedValue(reply({ success: false, message: "Only event hosts can start." }, 403))

		const response = await endSession(req(`/api/events/${ID}/live-session/end`), ctx())
		expect(response.status).toBe(403)
	})

	it("rejects malformed event ids before contacting the backend", async () => {
		const response = await createSession(req("/api/events/not-an-id/live-session"), ctx("not-an-id"))
		expect(response.status).toBe(404)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("does not contact the backend without an authenticated session", async () => {
		getAccessToken.mockResolvedValueOnce(undefined)
		const response = await startSession(req(`/api/events/${ID}/live-session/start`), ctx())
		expect(response.status).toBe(401)
		expect(fetchMock).not.toHaveBeenCalled()
	})
})
