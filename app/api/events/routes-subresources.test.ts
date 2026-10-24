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

import { UpstreamError } from "@/lib/server-fetch"
import { GET as getResources } from "./[eventId]/resources/route"
import { GET as getComments } from "./[eventId]/comments/route"
import { GET as getGuests } from "./[eventId]/guests/route"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const ctx = (eventId = ID) => ({ params: Promise.resolve({ eventId }) })
const req = (url: string) => new NextRequest(`http://localhost${url}`)
const ok = (json: unknown, status = 200) => ({ status, json })

beforeEach(() => {
	vi.clearAllMocks()
	getAccessToken.mockResolvedValue("token")
	fetchJson.mockResolvedValue(ok({ success: true, data: { results: [], next: null } }))
})

describe.each([
	["resources", getResources, `/api/events/${ID}/resources`],
	["comments", getComments, `/api/events/${ID}/comments`],
	["guests", getGuests, `/api/events/${ID}/guests`],
] as const)("%s route", (_name, handler, path) => {
	it("returns 401 without calling upstream", async () => {
		getAccessToken.mockResolvedValue(undefined)
		expect((await handler(req(path), ctx())).status).toBe(401)
		expect(fetchJson).not.toHaveBeenCalled()
	})
	it("rejects a malformed id with the normal envelope and no upstream call", async () => {
		expect((await handler(req(path.replace(ID, "bad-id")), ctx("bad-id"))).status).toBe(404)
		expect(fetchJson).not.toHaveBeenCalled()
	})
	it("forwards the bearer token and no caller-controlled query fields", async () => {
		const response = await handler(req(`${path}?page=2&limit=1000&filter=all&q=secret&passcode=1234`), ctx())
		expect(response.status).toBe(200)
		const [url, init] = fetchJson.mock.calls[0]
		expect(init.headers.Authorization).toBe("Bearer token")
		if (_name === "resources") {
			expect(url.endsWith(`/events/${ID}/resources`)).toBe(true)
			expect(url).not.toContain("?")
		} else {
			const parsed = new URL(url)
			expect(parsed.searchParams.get("page")).toBe("2")
			expect(parsed.searchParams.get("limit")).toBe("100")
			expect([...parsed.searchParams.keys()].sort()).toEqual(["limit", "page"])
		}
	})
	it.each([403, 404])("passes upstream %s through", async (status) => {
		fetchJson.mockResolvedValue(ok({ success: false, message: "upstream" }, status))
		expect((await handler(req(path), ctx())).status).toBe(status)
	})
	it("turns a non-JSON upstream response into a gateway response without crashing", async () => {
		fetchJson.mockRejectedValue(new UpstreamError("Upstream returned an unexpected response", 502))
		expect((await handler(req(path), ctx())).status).toBe(502)
	})
})
