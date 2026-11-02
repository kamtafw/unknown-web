import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../axios"
import { EventPayloadError, eventsApi } from "./api"

vi.mock("../axios", () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)
const patchMock = vi.mocked(apiClient.patch)
const deleteMock = vi.mocked(apiClient.delete)

const event = { id: "a", name: "A", start_date: "2026-11-01", end_date: "2026-11-01" }

beforeEach(() => vi.clearAllMocks())

describe("eventsApi.getNearbyPage", () => {
	it("calls the nearby BFF route with coordinates only — no radius, no filter", async () => {
		getMock.mockResolvedValue({ data: { data: { events: [] } } })
		await eventsApi.getNearbyPage({ latitude: 0, longitude: 0, page: 2, limit: 20 })
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe("/api/events/nearby")
		expect(config?.params).toEqual({ latitude: 0, longitude: 0, page: 2, limit: 20 })
		expect(config?.params).not.toHaveProperty("radius_km")
		expect(config?.params).not.toHaveProperty("filter")
	})

	it("normalises the empty shape", async () => {
		getMock.mockResolvedValue({ data: { data: { events: [] } } })
		expect(
			await eventsApi.getNearbyPage({ latitude: 1, longitude: 1, page: 1, limit: 20 }),
		).toEqual({
			events: [],
			page: 1,
			hasNext: false,
		})
	})

	it("normalises the paginated shape and reports the requested page", async () => {
		getMock.mockResolvedValue({
			data: { data: { next: "n", results: { detail: "1", events: [event] } } },
		})
		const page = await eventsApi.getNearbyPage({ latitude: 1, longitude: 1, page: 4, limit: 20 })
		expect(page.events).toHaveLength(1)
		expect(page.page).toBe(4)
		expect(page.hasNext).toBe(true)
	})

	it("passes the abort signal through", async () => {
		getMock.mockResolvedValue({ data: { data: { events: [] } } })
		const controller = new AbortController()
		await eventsApi.getNearbyPage(
			{ latitude: 1, longitude: 1, page: 1, limit: 20 },
			controller.signal,
		)
		expect(getMock.mock.calls[0][1]?.signal).toBe(controller.signal)
	})
})

describe("eventsApi.getMyEventsPage", () => {
	it("calls the my-events BFF route and omits an empty search term", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [event], next: null } } })
		const page = await eventsApi.getMyEventsPage({ search: "", page: 1, limit: 20 })
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe("/api/events/my-events")
		expect(config?.params).toEqual({ q: undefined, page: 1, limit: 20 })
		expect(page.events).toHaveLength(1)
		expect(page.hasNext).toBe(false)
	})

	it("sends the search term as q", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [], next: null } } })
		await eventsApi.getMyEventsPage({ search: "jos", page: 1, limit: 20 })
		expect(getMock.mock.calls[0][1]?.params.q).toBe("jos")
	})
})

describe("eventsApi.resolveAddress", () => {
	it("returns the address", async () => {
		postMock.mockResolvedValue({ data: { success: true, data: { address: " Jos, Plateau " } } })
		expect(await eventsApi.resolveAddress({ latitude: 9.9, longitude: 8.9 })).toBe("Jos, Plateau")
		expect(postMock.mock.calls[0][0]).toBe("/api/events/my-location")
	})
	it("returns null for a soft failure or a blank address", async () => {
		postMock.mockResolvedValue({ data: { success: false, data: null } })
		expect(await eventsApi.resolveAddress({ latitude: 1, longitude: 1 })).toBeNull()
		postMock.mockResolvedValue({ data: { success: true, data: { address: "  " } } })
		expect(await eventsApi.resolveAddress({ latitude: 1, longitude: 1 })).toBeNull()
	})
})

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const fullEvent = {
	id: ID,
	name: "Jos Tech Meetup",
	start_date: "2026-11-01",
	end_date: "2026-11-01",
	start_time: "18:00",
	end_time: "20:00",
	hosts: [{ id: "h1", username: "host" }],
	links: [],
	documents: [],
}

describe("eventsApi.getEventDetails", () => {
	it("calls the details BFF route with the id only", async () => {
		getMock.mockResolvedValue({ data: { data: fullEvent } })
		const details = await eventsApi.getEventDetails(ID)
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe(`/api/events/${ID}`)
		expect(config?.params).toBeUndefined()
		expect(details.kind).toBe("full")
	})

	it("returns a preview for a restricted event", async () => {
		getMock.mockResolvedValue({ data: { data: { id: ID, name: "A", is_locked: true } } })
		expect((await eventsApi.getEventDetails(ID)).kind).toBe("preview")
	})

	it("throws rather than inventing an event from an unreadable body", async () => {
		getMock.mockResolvedValue({ data: { data: null } })
		await expect(eventsApi.getEventDetails(ID)).rejects.toBeInstanceOf(EventPayloadError)
	})

	it("passes the abort signal through", async () => {
		getMock.mockResolvedValue({ data: { data: fullEvent } })
		const controller = new AbortController()
		await eventsApi.getEventDetails(ID, controller.signal)
		expect(getMock.mock.calls[0][1]?.signal).toBe(controller.signal)
	})
})

describe("eventsApi create / update / delete", () => {
	it("posts a JSON submission with the default timeout and no progress hook", async () => {
		postMock.mockResolvedValue({ data: { data: fullEvent } })
		const created = await eventsApi.createEvent({ kind: "json", body: { name: "A" } })
		const [url, body, config] = postMock.mock.calls[0]
		expect(url).toBe("/api/events/create")
		expect(body).toEqual({ name: "A" })
		expect(config?.timeout).toBeUndefined()
		expect(config?.onUploadProgress).toBeUndefined()
		expect(created?.id).toBe(ID)
	})

	it("posts multipart with a longer timeout and reports progress as a fraction", async () => {
		postMock.mockResolvedValue({ data: { data: fullEvent } })
		const form = new FormData()
		const fractions: number[] = []
		await eventsApi.createEvent(
			{ kind: "multipart", body: form },
			{ onProgress: (f) => fractions.push(f) },
		)
		const [, body, config] = postMock.mock.calls[0]
		expect(body).toBe(form)
		expect(config?.timeout).toBe(120_000)
		const hook = config?.onUploadProgress as unknown as (e: {
			loaded: number
			total?: number
		}) => void
		hook({ loaded: 50, total: 200 })
		hook({ loaded: 300, total: 200 })
		hook({ loaded: 10 })
		expect(fractions).toEqual([0.25, 1])
	})

	it("returns null when the created event cannot be read", async () => {
		postMock.mockResolvedValue({ data: { data: {} } })
		expect(await eventsApi.createEvent({ kind: "json", body: {} })).toBeNull()
	})

	it("PATCHes the event with the submission", async () => {
		patchMock.mockResolvedValue({ data: { data: fullEvent } })
		await eventsApi.updateEvent(ID, { kind: "json", body: { name: "B" } })
		const [url, body] = patchMock.mock.calls[0]
		expect(url).toBe(`/api/events/${ID}`)
		expect(body).toEqual({ name: "B" })
	})

	it("DELETEs without parsing a body", async () => {
		deleteMock.mockResolvedValue({ status: 204, data: "" })
		await expect(eventsApi.deleteEvent(ID)).resolves.toBeUndefined()
		expect(deleteMock.mock.calls[0][0]).toBe(`/api/events/${ID}`)
	})

	it("encodes the id into the path", async () => {
		deleteMock.mockResolvedValue({ status: 204, data: "" })
		await eventsApi.deleteEvent("a/b")
		expect(deleteMock.mock.calls[0][0]).toBe("/api/events/a%2Fb")
	})
})

describe("eventsApi.setRsvp", () => {
	it("posts event_id and status and returns the saved status", async () => {
		postMock.mockResolvedValue({ data: { data: { event: ID, status: "going" } } })
		const result = await eventsApi.setRsvp(ID, "going")
		expect(postMock.mock.calls[0]).toEqual(["/api/events/rsvp", { event_id: ID, status: "going" }])
		expect(result).toEqual({ eventId: ID, status: "going" })
	})

	it("falls back to the requested status when a 201 body is unreadable", async () => {
		postMock.mockResolvedValue({ data: { data: {} } })
		expect(await eventsApi.setRsvp(ID, "interested")).toEqual({ eventId: ID, status: "interested" })
	})
})

describe("eventsApi Pass 3 read methods", () => {
	it("getEventResources calls the BFF resources route with no query and normalises the body", async () => {
		getMock.mockResolvedValue({
			data: {
				data: {
					event: "Name",
					links: [{ link_name: "L", url: "https://example.com", date_added: "01/01/2026" }],
					documents: [],
				},
			},
		})
		const out = await eventsApi.getEventResources(ID)
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe(`/api/events/${ID}/resources`)
		expect(config?.params).toBeUndefined()
		expect(out).toEqual({ links: [{ name: "L", url: "https://example.com" }], documents: [] })
	})

	it("getEventResources throws on an unreadable body instead of returning an empty result", async () => {
		getMock.mockResolvedValue({ data: { data: {} } })
		await expect(eventsApi.getEventResources(ID)).rejects.toBeInstanceOf(EventPayloadError)
		getMock.mockResolvedValue({ data: { data: null } })
		await expect(eventsApi.getEventResources(ID)).rejects.toBeInstanceOf(EventPayloadError)
	})

	it("getEventCommentsPage sends only page and limit and reports the requested page", async () => {
		getMock.mockResolvedValue({
			data: { data: { next: "n", results: [{ id: "c", message: "m" }] } },
		})
		const out = await eventsApi.getEventCommentsPage({ eventId: ID, page: 3, limit: 10 })
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe(`/api/events/${ID}/comments`)
		expect(config?.params).toEqual({ page: 3, limit: 10 })
		expect(out).toMatchObject({ page: 3, hasNext: true, comments: [{ id: "c" }] })
	})

	it("getEventCommentsPage throws on an unreadable body but accepts an empty page", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [] } } })
		expect(await eventsApi.getEventCommentsPage({ eventId: ID, page: 1, limit: 10 })).toEqual({
			comments: [],
			page: 1,
			hasNext: false,
		})
		getMock.mockResolvedValue({ data: { data: { results: "x" } } })
		await expect(
			eventsApi.getEventCommentsPage({ eventId: ID, page: 1, limit: 10 }),
		).rejects.toBeInstanceOf(EventPayloadError)
	})

	it("getEventGuestsPage sends only page and limit and projects the guests", async () => {
		getMock.mockResolvedValue({
			data: {
				data: { next: null, results: [{ user_id: 4, user_full_name: "G", rsvp_status: "going" }] },
			},
		})
		const out = await eventsApi.getEventGuestsPage({ eventId: ID, page: 1, limit: 20 })
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe(`/api/events/${ID}/guests`)
		expect(config?.params).toEqual({ page: 1, limit: 20 })
		expect(out.guests).toEqual([{ userId: 4, name: "G", username: "", photo: null, role: "guest" }])
		expect(JSON.stringify(out)).not.toContain("going")
	})

	it("getEventGuestsPage throws on an unreadable body", async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		await expect(
			eventsApi.getEventGuestsPage({ eventId: ID, page: 1, limit: 20 }),
		).rejects.toBeInstanceOf(EventPayloadError)
	})

	it("passes an upstream 403 through as the axios error (access is not 'empty')", async () => {
		const forbidden = { response: { status: 403, data: { message: "no" } } }
		getMock.mockRejectedValue(forbidden)
		await expect(eventsApi.getEventResources(ID)).rejects.toBe(forbidden)
		await expect(eventsApi.getEventGuestsPage({ eventId: ID, page: 1, limit: 20 })).rejects.toBe(
			forbidden,
		)
	})

	it("encodes the event id into the path", async () => {
		getMock.mockResolvedValue({ data: { data: { links: [], documents: [] } } })
		await eventsApi.getEventResources("a/b")
		expect(getMock.mock.calls[0][0]).toBe("/api/events/a%2Fb/resources")
	})
})

describe("eventsApi.postEventComment (P3-06)", () => {
	it("posts only the trimmed message to the BFF comments route and returns nothing", async () => {
		postMock.mockResolvedValue({ data: { data: { message: "hi" } } })
		const result = await eventsApi.postEventComment(ID, "  hi  ")
		expect(postMock.mock.calls[0][0]).toBe(`/api/events/${ID}/comments`)
		expect(postMock.mock.calls[0][1]).toEqual({ message: "hi" })
		expect(result).toBeUndefined()
	})

	it("lets a rejection through for the caller to describe", async () => {
		const failure = Object.assign(new Error("x"), { response: { status: 404 } })
		postMock.mockRejectedValue(failure)
		await expect(eventsApi.postEventComment(ID, "hi")).rejects.toBe(failure)
	})
})

describe("eventsApi.removeEventGuest (P3-08A)", () => {
	it("posts only user_id to the BFF guests/remove route and returns nothing", async () => {
		postMock.mockResolvedValue({ data: { data: {} } })
		const result = await eventsApi.removeEventGuest(ID, 42)
		expect(postMock.mock.calls[0][0]).toBe(`/api/events/${ID}/guests/remove`)
		expect(postMock.mock.calls[0][1]).toEqual({ user_id: 42 })
		expect(result).toBeUndefined()
	})

	it("encodes the event id and lets a rejection through", async () => {
		const failure = Object.assign(new Error("x"), { response: { status: 403 } })
		postMock.mockRejectedValue(failure)
		await expect(eventsApi.removeEventGuest("a/b", 1)).rejects.toBe(failure)
		expect(postMock.mock.calls[0][0]).toBe("/api/events/a%2Fb/guests/remove")
	})
})
