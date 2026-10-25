// @vitest-environment node
//
// P3-06: POST /api/events/[eventId]/comments. Only cookies are mocked; the real `@/lib/server-fetch`
// runs on a stubbed global `fetch`, so status mapping and non-JSON handling are the shared code's.
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getAccessToken = vi.fn()
vi.mock("@/lib/cookies", () => ({ getAccessToken: () => getAccessToken() }))

import { GET as getComments, POST as postComment } from "./[eventId]/comments/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const post = (body: unknown, headers: Record<string, string> = { "content-type": "application/json" }) =>
	new NextRequest(`http://localhost/api/events/${ID}/comments`, {
		method: "POST",
		headers,
		body: typeof body === "string" ? body : JSON.stringify(body),
	})

const fetchMock = vi.fn()
const reply = (body: unknown, status = 201) =>
	new Response(typeof body === "string" ? body : JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})
const created = (message = "hi") => ({ success: true, status_code: 201, message: null, data: { message } })
const sentInit = () => fetchMock.mock.calls[0][1] as RequestInit & { headers: Record<string, string> }
const sentBody = () => JSON.parse(String(sentInit().body))

let logs: ReturnType<typeof vi.spyOn>[]

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchMock.mockImplementation(async () => reply(created()))
	vi.stubGlobal("fetch", fetchMock)
	logs = [
		vi.spyOn(console, "error").mockImplementation(() => {}),
		vi.spyOn(console, "log").mockImplementation(() => {}),
		vi.spyOn(console, "warn").mockImplementation(() => {}),
	]
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe("POST /api/events/[eventId]/comments", () => {
	it("forwards only the trimmed message to comments/create with the bearer token", async () => {
		const res = await postComment(post({ message: "  hello there  ", user: 1, event: "x", is_host: true }), ctx())
		expect(res.status).toBe(201)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const url = new URL(String(fetchMock.mock.calls[0][0]))
		expect(url.pathname.endsWith(`/events/${ID}/comments/create`)).toBe(true)
		expect(url.search).toBe("")
		expect(sentInit().method).toBe("POST")
		expect(sentInit().headers.Authorization).toBe("Bearer token")
		expect(sentBody()).toEqual({ message: "hello there" })
	})

	it("returns the documented 201 envelope with only data.message", async () => {
		fetchMock.mockImplementation(async () =>
			reply({ ...created("ok"), data: { message: "ok", id: "c9", user: { pkid: 1, email: "a@b.c" } } }),
		)
		const res = await postComment(post({ message: "ok" }), ctx())
		expect(res.status).toBe(201)
		expect(await res.json()).toEqual({ success: true, status_code: 201, message: null, data: { message: "ok" } })
	})

	it.each(["", "   ", "\n\t  \n", null, 42, undefined, ["a"], { a: 1 }])(
		"rejects the blank or non-string message %j with 400 and no upstream request",
		async (message) => {
			const res = await postComment(post({ message }), ctx())
			expect(res.status).toBe(400)
			expect((await res.json()).code).toBe("invalid_comment")
			expect(fetchMock).not.toHaveBeenCalled()
		},
	)

	it.each([null, [], "text", 5])("rejects the body %j with 400 and no upstream request", async (body) => {
		const res = await postComment(post(JSON.stringify(body)), ctx())
		expect(res.status).toBe(400)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("rejects unparseable JSON with 400 and no upstream request", async () => {
		const res = await postComment(post("{not json"), ctx())
		expect(res.status).toBe(400)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("rejects a non-JSON content type with 415 and no upstream request", async () => {
		const res = await postComment(post("message=hi", { "content-type": "text/plain" }), ctx())
		expect(res.status).toBe(415)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("reports an oversized body as a request-size error (413), not a comment-length rule, with no upstream request", async () => {
		const res = await postComment(post({ message: "x".repeat(300 * 1024) }), ctx())
		expect(res.status).toBe(413)
		const json = await res.json()
		expect(json.code).toBe("request_too_large")
		expect(JSON.stringify(json)).not.toMatch(/character|length|too long/i)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("imposes no comment-specific maximum: long messages under the generic guard are forwarded whole", async () => {
		for (const length of [1_001, 5_000, 100_000]) {
			fetchMock.mockClear()
			const message = "a".repeat(length)
			const res = await postComment(post({ message }), ctx())
			expect(res.status).toBe(201)
			expect(sentBody().message).toBe(message)
		}
	})

	it("answers 401 without a session and makes no upstream request", async () => {
		getAccessToken.mockResolvedValue(undefined)
		const res = await postComment(post({ message: "hi" }), ctx())
		expect(res.status).toBe(401)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("answers 404 for a malformed event id and makes no upstream request", async () => {
		const res = await postComment(post({ message: "hi" }), ctx("../../etc/passwd"))
		expect(res.status).toBe(404)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		[400, { success: false, status_code: 400, message: "Comment cannot be blank.", code: "request_error" }],
		[401, { success: false, status_code: 401, message: "Invalid token", code: "authentication_error" }],
		[403, { success: false, status_code: 403, message: "Join this event before accessing its live session.", code: "authentication_error" }],
		[
			404,
			{ success: false, status_code: 404, message: "The user has not joined this event. Only users that have joined can comment.", code: "request_error" },
		],
	])("passes an upstream %i through with its own status and body", async (status, body) => {
		fetchMock.mockImplementation(async () => reply(body, status))
		const res = await postComment(post({ message: "hi" }), ctx())
		expect(res.status).toBe(status)
		expect(await res.json()).toEqual(body)
	})

	it.each([
		["a 2xx body without data.message", reply({ success: true, status_code: 201, data: {} })],
		["a 2xx body with a non-string message", reply({ success: true, status_code: 201, data: { message: 5 } })],
		["a 2xx body with no data", reply({ success: true })],
		["a 204", new Response(null, { status: 204 })],
	])("answers 502, never success, for %s", async (_name, response) => {
		fetchMock.mockImplementation(async () => response)
		const res = await postComment(post({ message: "hi" }), ctx())
		expect(res.status).toBe(502)
		expect((await res.json()).code).toBe("invalid_upstream_response")
	})

	it("answers 502 for a non-JSON upstream body", async () => {
		fetchMock.mockImplementation(async () => new Response("<html>oops</html>", { status: 201 }))
		expect((await postComment(post({ message: "hi" }), ctx())).status).toBe(502)
	})

	it("answers 502 when the upstream is unreachable", async () => {
		fetchMock.mockImplementation(async () => {
			throw new Error("ECONNREFUSED")
		})
		expect((await postComment(post({ message: "hi" }), ctx())).status).toBe(502)
	})

	it("never logs the comment text, on success or on failure", async () => {
		const secret = "SECRET-COMMENT-TEXT-123"
		await postComment(post({ message: secret }), ctx())
		fetchMock.mockImplementation(async () => new Response("<html>bad</html>", { status: 500 }))
		await postComment(post({ message: secret }), ctx())
		fetchMock.mockImplementation(async () => {
			throw new Error("down")
		})
		await postComment(post({ message: secret }), ctx())
		for (const spy of logs) expect(JSON.stringify(spy.mock.calls)).not.toContain(secret)
	})

	it("leaves the GET contract alone (the same route still serves a page)", async () => {
		fetchMock.mockImplementation(async () =>
			reply({ success: true, status_code: 200, message: "ok", data: { count: 0, total_pages: 1, limit: 10, current: 1, previous: null, next: null, results: [] } }, 200),
		)
		const res = await getComments(new NextRequest(`http://localhost/api/events/${ID}/comments?page=2&limit=5`), ctx())
		expect(res.status).toBe(200)
		const url = new URL(String(fetchMock.mock.calls[0][0]))
		expect(url.pathname.endsWith(`/events/${ID}/comments`)).toBe(true)
		expect(url.searchParams.get("page")).toBe("2")
	})
})
