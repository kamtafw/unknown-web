import { describe, expect, it } from "vitest"
import {
	normalizeLiveSessionComment,
	normalizeLiveSessionCommentsPage,
	normalizeLiveSessionReaction,
	normalizeLiveSessionReactionResult,
} from "./live-normalize"

const user = {
	id: "user-uuid",
	pkid: 42,
	first_name: "Ada",
	last_name: "Obi",
	username: "ada",
	profile_photo: null,
	email: "private@example.com",
	phone_number: "+234",
	is_online: true,
}

const comment = {
	id: 7,
	user,
	content: "  Hello live room  ",
	created_at: "2026-10-31T09:00:00Z",
	secret: "drop",
}

const reaction = {
	event_id: "reaction-uuid",
	emoji: "🔥",
	user,
	emoji_count: 3,
	created_at: "2026-10-31T09:01:00Z",
	secret: "drop",
}

describe("normalizeLiveSessionComment", () => {
	it("maps the mobile comment model to a minimal web projection", () => {
		expect(normalizeLiveSessionComment(comment)).toEqual({
			id: 7,
			content: "  Hello live room  ",
			createdAt: "2026-10-31T09:00:00Z",
			user: {
				id: "user-uuid",
				pkid: 42,
				firstName: "Ada",
				lastName: "Obi",
				username: "ada",
				photo: null,
			},
		})
		expect(JSON.stringify(normalizeLiveSessionComment(comment))).not.toMatch(/private@example|phone_number|is_online|secret/)
	})

	it("rejects malformed ids, missing authors, blank content and invalid timestamps", () => {
		for (const raw of [
			{ ...comment, id: "7" },
			{ ...comment, user: null },
			{ ...comment, content: "  " },
			{ ...comment, created_at: "not-a-date" },
		]) expect(normalizeLiveSessionComment(raw)).toBeNull()
	})
})

describe("normalizeLiveSessionCommentsPage", () => {
	it("uses next as the only pagination signal and filters malformed rows", () => {
		expect(normalizeLiveSessionCommentsPage({ count: 100, total_pages: 10, next: "next", results: [comment, null] }, 2))
			.toEqual({ comments: [normalizeLiveSessionComment(comment)], page: 2, hasNext: true })
		expect(normalizeLiveSessionCommentsPage({ count: 100, total_pages: 10, next: null, results: [] }, 1))
			.toEqual({ comments: [], page: 1, hasNext: false })
		expect(normalizeLiveSessionCommentsPage({ results: "bad" }, 1)).toBeNull()
	})
})

describe("normalizeLiveSessionReaction", () => {
	it("keeps the server aggregate and allowed emoji", () => {
		expect(normalizeLiveSessionReaction(reaction)).toEqual({
			eventId: "reaction-uuid",
			emoji: "🔥",
			emojiCount: 3,
			createdAt: "2026-10-31T09:01:00Z",
			user: {
				id: "user-uuid", pkid: 42, firstName: "Ada", lastName: "Obi", username: "ada", photo: null,
			},
		})
	})
	it("rejects unknown emoji, negative counts and missing event identity", () => {
		expect(normalizeLiveSessionReaction({ ...reaction, emoji: "🎉" })).toBeNull()
		expect(normalizeLiveSessionReaction({ ...reaction, emoji_count: -1 })).toBeNull()
		expect(normalizeLiveSessionReaction({ ...reaction, event_id: "" })).toBeNull()
	})
})

describe("normalizeLiveSessionReactionResult", () => {
	it("requires the response session id to be a positive integer", () => {
		expect(normalizeLiveSessionReactionResult({ session_id: 12, reaction })).toMatchObject({ sessionId: 12 })
		expect(normalizeLiveSessionReactionResult({ session_id: "12", reaction })).toBeNull()
	})
})
