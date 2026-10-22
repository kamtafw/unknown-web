// @vitest-environment node
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MAX_EVENT_REQUEST_BYTES } from "@/lib/events/constants"

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

import { UpstreamError } from "@/lib/server-fetch"
import { POST as postCreate } from "./create/route"
import { DELETE as deleteEvent, GET as getDetails, PATCH as patchEvent } from "./[eventId]/route"
import { POST as postRsvp } from "./rsvp/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId: string = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
	new NextRequest(`http://localhost${url}`, init)
const json = (body: unknown, method = "POST") =>
	req("/api/events/x", {
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	})

const createBody = {
	name: "Jos Tech Meetup",
	start_date: "2026-11-01",
	start_time: "18:00:00",
	end_date: "2026-11-01",
	end_time: "20:00:00",
	latitude: 9.92,
	longitude: 8.89,
}

const ok = (data: unknown, status = 200) => ({ status, json: { success: true, status_code: status, data } })

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchJson.mockResolvedValue(ok({}))
	proxyJson.mockResolvedValue(new Response("{}"))
})

describe("GET /api/events/[eventId]", () => {
	it("returns 401 without a session and never calls upstream", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await getDetails(req("/api/events/x"), ctx())).status).toBe(401)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("answers a malformed id with the normal 404 envelope, without calling upstream", async () => {
		const res = await getDetails(req("/api/events/x"), ctx("not-a-uuid"))
		expect(res.status).toBe(404)
		expect((await res.json()).code).toBe("not_found")
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("calls the details endpoint with the bearer token and no query", async () => {
		await getDetails(req("/api/events/x"), ctx())
		const [url, init] = fetchJson.mock.calls[0]
		expect(url.endsWith(`/events/${ID}/details`)).toBe(true)
		expect(init.headers.Authorization).toBe("Bearer token")
	})

	it("removes guests and host contact data before the response reaches the browser", async () => {
		fetchJson.mockResolvedValue(
			ok({
				id: ID,
				name: "A",
				guests: [{ user_id: 1, user_full_name: "Someone" }],
				hosts: [{ id: "h", username: "u", email: "h@x.io", phone_number: "+234", first_name: "H" }],
			}),
		)
		const body = await (await getDetails(req("/api/events/x"), ctx())).json()
		expect(body.data).not.toHaveProperty("guests")
		expect(body.data.hosts[0]).not.toHaveProperty("email")
		expect(body.data.hosts[0]).not.toHaveProperty("phone_number")
		expect(body.data.hosts[0].username).toBe("u")
	})

	it("passes a restricted preview through unchanged", async () => {
		const preview = { id: ID, name: "A", is_locked: true, address: "Jos", hashtags: ["a"] }
		fetchJson.mockResolvedValue(ok(preview))
		expect((await (await getDetails(req("/api/events/x"), ctx())).json()).data).toEqual(preview)
	})

	it("keeps an upstream 404 as a 404", async () => {
		fetchJson.mockResolvedValue({ status: 404, json: { success: false, message: "Not found" } })
		expect((await getDetails(req("/api/events/x"), ctx())).status).toBe(404)
	})
})

describe("POST /api/events/create", () => {
	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await postCreate(json(createBody))).status).toBe(401)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("forwards an allow-listed JSON body to events/create and drops is_live", async () => {
		fetchJson.mockResolvedValue(ok({ id: ID }, 201))
		const res = await postCreate(json({ ...createBody, is_live: true, room_id: "x" }))
		expect(res.status).toBe(201)
		const [url, init] = fetchJson.mock.calls[0]
		expect(url.endsWith("/events/create")).toBe(true)
		expect(init.method).toBe("POST")
		const sent = JSON.parse(init.body)
		expect(sent).not.toHaveProperty("is_live")
		expect(sent).not.toHaveProperty("room_id")
		expect(sent.start_time).toBe("18:00:00")
	})

	it("sends the passcode as a string in the body, never in the URL", async () => {
		await postCreate(json({ ...createBody, is_locked: true, passcode: "0042" }))
		const [url, init] = fetchJson.mock.calls[0]
		expect(JSON.parse(init.body).passcode).toBe("0042")
		expect(url).not.toContain("0042")
	})

	it("rejects an invalid body with the error envelope and never calls upstream", async () => {
		const res = await postCreate(json({ ...createBody, start_time: "18:00" }))
		expect(res.status).toBe(400)
		expect((await res.json()).code).toBe("invalid_schedule")
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("rejects a malformed JSON body", async () => {
		const bad = req("/api/events/create", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{nope",
		})
		expect((await postCreate(bad)).status).toBe(400)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("rejects other content types", async () => {
		const res = await postCreate(
			req("/api/events/create", { method: "POST", headers: { "content-type": "text/plain" }, body: "x" }),
		)
		expect(res.status).toBe(415)
	})

	describe("multipart", () => {
		const CT = "multipart/form-data; boundary=----abc"
		const multipart = (body: BodyInit, headers: Record<string, string> = {}) =>
			req("/api/events/create", { method: "POST", headers: { "content-type": CT, ...headers }, body })

		it("streams the body with its boundary, declared length, a longer timeout and half duplex", async () => {
			fetchJson.mockResolvedValue(ok({ id: ID }, 201))
			const payload = "------abc\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nA\r\n------abc--\r\n"
			const res = await postCreate(multipart(payload, { "content-length": String(payload.length) }))
			expect(res.status).toBe(201)
			const [, init] = fetchJson.mock.calls[0]
			expect(init.headers["Content-Type"]).toBe(CT)
			expect(init.headers["Content-Length"]).toBe(String(payload.length))
			expect(init.duplex).toBe("half")
			expect(init.timeoutMs).toBe(120_000)
			// a stream, not a parsed FormData or a buffered string
			expect(init.body).toBeInstanceOf(ReadableStream)
		})

		it("refuses a declared length over the cap before reading anything", async () => {
			const res = await postCreate(multipart("x", { "content-length": String(MAX_EVENT_REQUEST_BYTES + 1) }))
			expect(res.status).toBe(413)
			expect((await res.json()).code).toBe("upload_too_large")
			expect(fetchJson).not.toHaveBeenCalled()
		})

		it("refuses a multipart content type without a boundary", async () => {
			const bad = req("/api/events/create", {
				method: "POST",
				headers: { "content-type": "multipart/form-data" },
				body: "x",
			})
			expect((await postCreate(bad)).status).toBe(400)
			expect(fetchJson).not.toHaveBeenCalled()
		})

		it("stops a body that exceeds the cap without a declared length and answers 413", async () => {
			fetchJson.mockImplementation(async (_url: string, init: { body: ReadableStream<Uint8Array> }) => {
				const reader = init.body.getReader()
				try {
					for (;;) if ((await reader.read()).done) break
				} catch {
					throw new UpstreamError("Service temporarily unavailable", 502)
				}
				return ok({}, 201)
			})
			const chunk = new Uint8Array(1024 * 1024)
			let sent = 0
			const stream = new ReadableStream<Uint8Array>({
				pull(controller) {
					if (sent > MAX_EVENT_REQUEST_BYTES) return controller.close()
					sent += chunk.byteLength
					controller.enqueue(chunk)
				},
			})
			const big = new NextRequest("http://localhost/api/events/create", {
				method: "POST",
				headers: { "content-type": CT },
				body: stream,
				duplex: "half",
			} as ConstructorParameters<typeof NextRequest>[1])
			const res = await postCreate(big)
			expect(res.status).toBe(413)
			expect((await res.json()).code).toBe("upload_too_large")
		})
	})

	it("reports an upstream network failure as a gateway error, not a 413", async () => {
		fetchJson.mockRejectedValue(new UpstreamError("Service temporarily unavailable", 502))
		expect((await postCreate(json(createBody))).status).toBe(502)
	})
})

describe("PATCH /api/events/[eventId]", () => {
	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await patchEvent(json({ name: "B" }, "PATCH"), ctx())).status).toBe(401)
	})

	it("rejects a malformed id without calling upstream", async () => {
		expect((await patchEvent(json({ name: "B" }, "PATCH"), ctx("nope"))).status).toBe(404)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("sends a partial update to events/{id}/update with PATCH", async () => {
		await patchEvent(json({ name: "B" }, "PATCH"), ctx())
		const [url, init] = fetchJson.mock.calls[0]
		expect(url.endsWith(`/events/${ID}/update`)).toBe(true)
		expect(init.method).toBe("PATCH")
		expect(JSON.parse(init.body)).toEqual({ name: "B" })
	})

	it("keeps an empty collection as an explicit clear", async () => {
		await patchEvent(json({ links: [], hashtags: [], documents: [] }, "PATCH"), ctx())
		expect(JSON.parse(fetchJson.mock.calls[0][1].body)).toEqual({ links: [], hashtags: [], documents: [] })
	})

	it("passes the backend's 403 through", async () => {
		fetchJson.mockResolvedValue({ status: 403, json: { success: false, message: "Only an event host can perform this action." } })
		expect((await patchEvent(json({ name: "B" }, "PATCH"), ctx())).status).toBe(403)
	})
})

describe("DELETE /api/events/[eventId]", () => {
	const detailsThenDelete = (details: unknown, deleteResult: unknown = { status: 204, json: { success: true, data: null } }) =>
		fetchJson.mockImplementation(async (url: string) =>
			url.endsWith("/details") ? details : deleteResult,
		)
	const calls = () => fetchJson.mock.calls.map(([url, init]) => `${init?.method ?? "GET"} ${new URL(url).pathname}`)

	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())).status).toBe(401)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("rejects a malformed id without calling upstream", async () => {
		expect((await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx("nope"))).status).toBe(404)
		expect(fetchJson).not.toHaveBeenCalled()
	})

	it("checks the event first, then deletes, and answers 204 with no body", async () => {
		detailsThenDelete(ok({ id: ID, name: "A", is_live: false, live_session: { status: "waiting" } }))
		const res = await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())
		expect(res.status).toBe(204)
		expect(await res.text()).toBe("")
		expect(calls()).toEqual([
			expect.stringMatching(/^GET .*\/details$/),
			expect.stringMatching(/^DELETE .*\/delete$/),
		])
	})

	it("refuses while the event is live and never sends the delete", async () => {
		detailsThenDelete(ok({ id: ID, name: "A", is_live: true }))
		const res = await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())
		expect(res.status).toBe(409)
		expect((await res.json()).code).toBe("event_live")
		expect(calls().some((c) => c.startsWith("DELETE"))).toBe(false)
	})

	it("refuses while only the attached session is live", async () => {
		detailsThenDelete(ok({ id: ID, name: "A", is_live: false, live_session: { status: "live" } }))
		expect((await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())).status).toBe(409)
		expect(calls().some((c) => c.startsWith("DELETE"))).toBe(false)
	})

	it("fails closed when the state cannot be checked", async () => {
		fetchJson.mockRejectedValueOnce(new UpstreamError("Upstream request timed out", 504))
		const res = await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())
		expect(res.status).toBe(504)
		expect(fetchJson).toHaveBeenCalledTimes(1)
	})

	it("fails closed when the details payload has no data", async () => {
		detailsThenDelete({ status: 200, json: { success: true, data: null } })
		const res = await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())
		expect(res.status).toBe(502)
		expect((await res.json()).code).toBe("state_unverified")
		expect(calls().some((c) => c.startsWith("DELETE"))).toBe(false)
	})

	it("passes through a missing event", async () => {
		detailsThenDelete({ status: 404, json: { success: false, message: "Not found" } })
		expect((await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())).status).toBe(404)
		expect(calls().some((c) => c.startsWith("DELETE"))).toBe(false)
	})

	it("passes the backend's 403 for a non-host through", async () => {
		detailsThenDelete(ok({ id: ID, name: "A", is_live: false }), {
			status: 403,
			json: { success: false, message: "Only an event host can perform this action." },
		})
		expect((await deleteEvent(req("/api/events/x", { method: "DELETE" }), ctx())).status).toBe(403)
	})
})

describe("POST /api/events/rsvp", () => {
	it("returns 401 without a session", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await postRsvp(json({ event_id: ID, status: "going" }))).status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("rejects an invalid event or status without calling upstream", async () => {
		expect((await postRsvp(json({ event_id: "x", status: "going" }))).status).toBe(400)
		expect((await postRsvp(json({ event_id: ID, status: "maybe" }))).status).toBe(400)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("forwards only event_id and status", async () => {
		await postRsvp(json({ event_id: ID, status: "interested", is_live: true }))
		const [url, init] = proxyJson.mock.calls[0]
		expect(url.endsWith("/events/rsvp")).toBe(true)
		expect(JSON.parse(init.body)).toEqual({ event_id: ID, status: "interested" })
	})
})
