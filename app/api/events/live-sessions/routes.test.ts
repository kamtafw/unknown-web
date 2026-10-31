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
		constructor(message: string, status: number) { super(message); this.status = status }
	},
}))

import { GET as getComments } from "./[sessionId]/comments/list/route"
import { POST as postComment } from "./[sessionId]/comments/route"
import { POST as postReaction } from "./[sessionId]/reactions/route"
import { UpstreamError } from "@/lib/server-fetch"

const ctx = (sessionId = "12") => ({ params: Promise.resolve({ sessionId }) })
const req = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
	new NextRequest(`http://localhost${url}`, init)
const json = (url: string, body: unknown) => req(url, {
	method: "POST",
	headers: { "content-type": "application/json" },
	body: JSON.stringify(body),
})
const ok = (data: unknown, status = 200) => ({
	status,
	json: { success: true, status_code: status, message: "ok", data },
})

const user = {
	id: "user-uuid", pkid: 5, first_name: "Ada", last_name: "Obi", username: "ada",
	profile_photo: "a.jpg", email: "private@example.com", phone_number: "+234", is_online: true,
}
const comment = { id: 9, content: "Hello", created_at: "2026-10-31T09:00:00Z", user, private_field: "drop" }
const reaction = { event_id: "r1", emoji: "👍", emoji_count: 2, created_at: "2026-10-31T09:00:00Z", user }

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchJson.mockResolvedValue(ok({}))
})

describe("live-session comments list BFF", () => {
	it("requires authentication and validates the numeric session id", async () => {
		getAccessToken.mockResolvedValueOnce(undefined)
		expect((await getComments(req("/"), ctx())).status).toBe(401)
		expect(fetchJson).not.toHaveBeenCalled()
		expect((await getComments(req("/"), ctx("12x"))).status).toBe(404)
		expect(fetchJson).not.toHaveBeenCalled()
	})
	it("forwards only page/limit and sanitizes comment authors", async () => {
		fetchJson.mockResolvedValue(ok({ count: 1, total_pages: 1, limit: 50, current: 1, next: null, previous: null, results: [comment] }))
		const res = await getComments(req("/?page=2&limit=50&ignored=yes"), ctx())
		const [url, init] = fetchJson.mock.calls[0]
		expect(url).toContain("/live/sessions/12/comments/list?page=2&limit=50")
		expect(init.headers.Authorization).toBe("Bearer token")
		const body = await res.json()
		expect(body.data.results[0].user).toEqual({
			id: "user-uuid", pkid: 5, first_name: "Ada", last_name: "Obi", username: "ada", profile_photo: "a.jpg",
		})
		expect(JSON.stringify(body)).not.toMatch(/private@example|phone_number|is_online|private_field|ignored/)
	})
})

describe("live-session comment create BFF", () => {
	it("trims and forwards only content, then sanitizes the created comment", async () => {
		fetchJson.mockResolvedValue(ok({ comment }, 201))
		const res = await postComment(json("/", { content: "  Hello  ", extra: "drop" }), ctx())
		expect(res.status).toBe(201)
		const [url, init] = fetchJson.mock.calls[0]
		expect(url).toContain("/live/sessions/12/comments")
		expect(JSON.parse(init.body)).toEqual({ content: "Hello" })
		const body = await res.json()
		expect(body.data.comment.id).toBe(9)
		expect(body.data.comment.user).not.toHaveProperty("email")
	})
	it("rejects blank content without calling upstream", async () => {
		const res = await postComment(json("/", { content: "   " }), ctx())
		expect(res.status).toBe(400)
		expect((await res.json()).code).toBe("invalid_comment")
		expect(fetchJson).not.toHaveBeenCalled()
	})
})

describe("live-session reaction BFF", () => {
	it("allows only the mobile enum and forwards a minimal request", async () => {
		fetchJson.mockResolvedValue(ok({ session_id: 12, reaction }, 201))
		const res = await postReaction(json("/", { emoji: "👍", extra: "drop" }), ctx())
		expect(res.status).toBe(201)
		const [url, init] = fetchJson.mock.calls[0]
		expect(url).toContain("/live/sessions/12/reactions")
		expect(JSON.parse(init.body)).toEqual({ emoji: "👍" })
		expect((await res.json()).data.reaction.emoji_count).toBe(2)
	})
	it("rejects unknown emoji and preserves upstream 429 status", async () => {
		const invalid = await postReaction(json("/", { emoji: "🎉" }), ctx())
		expect(invalid.status).toBe(400)
		expect(fetchJson).not.toHaveBeenCalled()
		fetchJson.mockRejectedValue(new UpstreamError("Too many requests", 429))
		const limited = await postReaction(json("/", { emoji: "🔥" }), ctx())
		expect(limited.status).toBe(429)
	})
})
