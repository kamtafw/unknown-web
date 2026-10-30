import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../axios"
import { EventPayloadError, eventsApi } from "./api"

vi.mock("../axios", () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const getMock = vi.mocked(apiClient.get)
const ID = 42
const row = {
	id: 9,
	user: { id: "u9", pkid: 9, username: "ada", first_name: "Ada", last_name: "Obi", profile_photo: null },
	role: "listener",
	is_active: true,
	is_muted: false,
	media_connected: false,
	microphone_published: false,
	camera_published: false,
	joined_at: "2026-10-30T09:00:00Z",
}

beforeEach(() => vi.clearAllMocks())

describe("eventsApi.getLiveParticipantsPage", () => {
	it("calls the live-session participants BFF with only documented query fields", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [row], next: null } } })
		const result = await eventsApi.getLiveParticipantsPage({ sessionId: ID, page: 2, limit: 30, role: "listener" })
		const [url, config] = getMock.mock.calls[0]
		expect(url).toBe("/api/events/live-sessions/42/participants")
		expect(config?.params).toEqual({ page: 2, limit: 30, role: "listener" })
		expect(result.participants).toHaveLength(1)
		expect(result.hasNext).toBe(false)
	})

	it("passes an abort signal through", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [], next: null } } })
		const controller = new AbortController()
		await eventsApi.getLiveParticipantsPage({ sessionId: ID, page: 1, limit: 20 }, controller.signal)
		expect(getMock.mock.calls[0][1]?.signal).toBe(controller.signal)
	})

	it("throws on an unreadable successful response instead of returning an empty roster", async () => {
		getMock.mockResolvedValue({ data: { data: { results: [{ id: "bad" }] } } })
		await expect(eventsApi.getLiveParticipantsPage({ sessionId: ID, page: 1, limit: 20 })).rejects.toBeInstanceOf(EventPayloadError)
	})
})
