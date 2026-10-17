import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../axios"
import { eventsApi } from "./api"

vi.mock("../axios", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }))

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)

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
		expect(await eventsApi.getNearbyPage({ latitude: 1, longitude: 1, page: 1, limit: 20 })).toEqual({
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
		await eventsApi.getNearbyPage({ latitude: 1, longitude: 1, page: 1, limit: 20 }, controller.signal)
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
