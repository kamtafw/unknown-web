import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../axios"
import { EventPayloadError } from "./api"
import { liveSessionApi } from "./live-api"

vi.mock("../axios", () => ({
	apiClient: { get: vi.fn(), post: vi.fn() },
}))

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)
const ID = 12
const user = { id: "u", pkid: 2, first_name: "A", last_name: "B", username: "ab", profile_photo: null }
const comment = { id: 3, user, content: "hello", created_at: "2026-10-31T09:00:00Z" }
const reaction = { event_id: "r1", emoji: "❤️", user, emoji_count: 4, created_at: "2026-10-31T09:00:00Z" }

beforeEach(() => vi.clearAllMocks())

describe("liveSessionApi", () => {
	it("reads the comments list through its BFF route with only page and limit", async () => {
		getMock.mockResolvedValue({ data: { data: { next: "next", results: [comment] } } })
		const signal = new AbortController().signal
		const page = await liveSessionApi.getCommentsPage({ sessionId: ID, page: 2, limit: 50 }, signal)
		expect(getMock.mock.calls[0][0]).toBe("/api/events/live-sessions/12/comments/list")
		expect(getMock.mock.calls[0][1]).toMatchObject({ params: { page: 2, limit: 50 }, signal })
		expect(page).toMatchObject({ page: 2, hasNext: true, comments: [{ id: 3, content: "hello" }] })
	})
	it("posts a trimmed comment and returns the normalized response comment", async () => {
		postMock.mockResolvedValue({ data: { data: { comment } } })
		const out = await liveSessionApi.postComment(ID, { content: " hello " })
		expect(postMock.mock.calls[0][0]).toBe("/api/events/live-sessions/12/comments")
		expect(postMock.mock.calls[0][1]).toEqual({ content: "hello" })
		expect(out.id).toBe(3)
	})
	it("posts a reaction and requires the response session id to match", async () => {
		postMock.mockResolvedValue({ data: { data: { session_id: ID, reaction } } })
		const out = await liveSessionApi.postReaction(ID, { emoji: "❤️" })
		expect(postMock.mock.calls[0][0]).toBe("/api/events/live-sessions/12/reactions")
		expect(postMock.mock.calls[0][1]).toEqual({ emoji: "❤️" })
		expect(out.reaction.emojiCount).toBe(4)
		postMock.mockResolvedValue({ data: { data: { session_id: 13, reaction } } })
		await expect(liveSessionApi.postReaction(ID, { emoji: "❤️" })).rejects.toBeInstanceOf(EventPayloadError)
	})
	it("throws on malformed comment list and create payloads", async () => {
		getMock.mockResolvedValue({ data: { data: { results: "bad" } } })
		await expect(liveSessionApi.getCommentsPage({ sessionId: ID, page: 1, limit: 50 })).rejects.toBeInstanceOf(EventPayloadError)
		postMock.mockResolvedValue({ data: { data: { comment: null } } })
		await expect(liveSessionApi.postComment(ID, { content: "hello" })).rejects.toBeInstanceOf(EventPayloadError)
	})
})
