// @vitest-environment node
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { GET } from "./[sessionId]/participants/route"

const fetchMock = vi.fn()
const reply = (body: unknown, status = 200) =>
	new Response(typeof body === "string" ? body : JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})
const ctx = (sessionId = "42") => ({ params: Promise.resolve({ sessionId }) })
const req = (url: string) => new NextRequest("http://localhost" + url)
const body = () => ({
	success: true,
	status_code: 200,
	message: "Participants retrieved successfully.",
	data: {
		count: 1, total_pages: 1, limit: 20, current: 1, previous: null, next: null,
		results: [{
			id: 9,
			user: { id: "u9", pkid: 9, username: "ada", first_name: "Ada", last_name: "Obi", profile_photo: null, email: "secret@example.com" },
			role: "listener", is_active: true, is_muted: false, media_connected: false,
			microphone_published: false, camera_published: false, joined_at: "2026-10-30T09:00:00Z",
			permissions: { can_publish_microphone: true }, token: "secret-token",
		}],
	},
})

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("access-token")
	fetchMock.mockImplementation(async () => reply(body()))
	vi.stubGlobal("fetch", fetchMock)
	vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe("GET /api/events/live-sessions/:sessionId/participants", () => {
	it("requires authentication", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await GET(req("/api/events/live-sessions/42/participants"), ctx())).status).toBe(401)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("rejects malformed session ids before calling upstream", async () => {
		for (const id of ["0", "-1", "1.2", "1/2", "9007199254740992"]) {
			expect((await GET(req("/api/events/live-sessions/" + id + "/participants"), ctx(id))).status).toBe(404)
		}
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("forwards only page, limit and an optional valid role to the live endpoint", async () => {
		await GET(req("/api/events/live-sessions/42/participants?page=3&limit=500&role=co_host&token=x&filter=all"), ctx())
		const url = new URL(String(fetchMock.mock.calls[0][0]))
		expect(url.pathname).toBe("/api/v1/live/sessions/42/participants")
		expect([...url.searchParams.entries()].sort()).toEqual([["limit", "100"], ["page", "3"], ["role", "co_host"]])
		expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-token")
		expect(fetchMock.mock.calls[0][1].cache).toBe("no-store")
	})

	it("rejects unknown role values without an upstream request", async () => {
		const response = await GET(req("/api/events/live-sessions/42/participants?role=admin"), ctx())
		expect(response.status).toBe(400)
		expect((await response.json()).code).toBe("invalid_participant_role")
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("minimizes the participant and user payload before returning it", async () => {
		const response = await GET(req("/api/events/live-sessions/42/participants"), ctx())
		expect(response.status).toBe(200)
		const serialized = await response.text()
		expect(serialized).not.toContain("secret@example.com")
		expect(serialized).not.toContain("secret-token")
		expect(serialized).not.toContain("permissions")
		expect(serialized).toContain("microphone_published")
	})

	it("passes upstream access and missing-session errors through unchanged", async () => {
		for (const status of [403, 404]) {
			const failure = { success: false, status_code: status, message: "denied", code: "x" }
			fetchMock.mockImplementationOnce(async () => reply(failure, status))
			const response = await GET(req("/api/events/live-sessions/42/participants"), ctx())
			expect(response.status).toBe(status)
			expect(await response.json()).toEqual(failure)
		}
	})

	it("answers 502 for a malformed successful page", async () => {
		fetchMock.mockImplementationOnce(async () => reply({ success: true, data: { results: [{ id: 1, user: null }] } }))
		const response = await GET(req("/api/events/live-sessions/42/participants"), ctx())
		expect(response.status).toBe(502)
		expect((await response.json()).code).toBe("invalid_upstream_response")
	})
})
