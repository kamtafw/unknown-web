import { describe, expect, it } from "vitest"
import {
	buildLiveSessionCommentBody,
	buildLiveSessionReactionBody,
	isLiveSessionId,
	sanitizeLiveSessionCommentCreatePayload,
	sanitizeLiveSessionCommentsPayload,
	sanitizeLiveSessionReactionPayload,
} from "./live-server"

const user = {
	id: "user-uuid", pkid: 4, first_name: "Ada", last_name: "Obi", username: "ada",
	profile_photo: "photo.jpg", email: "private@example.com", phone_number: "+234", is_online: true,
}
const comment = { id: 9, content: "Hello", created_at: "2026-10-31T09:00:00Z", user, private_field: "drop" }
const reaction = { event_id: "evt-1", emoji: "👍", emoji_count: 2, created_at: "2026-10-31T09:00:00Z", user, private_field: "drop" }

describe("live session request builders", () => {
	it("accepts only positive safe integer session ids", () => {
		for (const value of [1, 12, Number.MAX_SAFE_INTEGER]) expect(isLiveSessionId(value)).toBe(true)
		for (const value of [0, -1, 1.5, "12", Number.MAX_SAFE_INTEGER + 1, null]) expect(isLiveSessionId(value)).toBe(false)
	})
	it("trims comments, rejects blank values and does not invent a length cap", () => {
		expect(buildLiveSessionCommentBody({ content: "  hello  ", extra: true })).toEqual({ ok: true, value: { content: "hello" } })
		expect(buildLiveSessionCommentBody({ content: "  " })).toMatchObject({ ok: false, code: "invalid_comment" })
		expect(buildLiveSessionCommentBody({ content: "x".repeat(5000) }).ok).toBe(true)
	})
	it("accepts only the six mobile-observed reaction values", () => {
		for (const emoji of ["👍", "❤️", "😂", "😮", "👏", "🔥"]) {
			expect(buildLiveSessionReactionBody({ emoji })).toEqual({ ok: true, value: { emoji } })
		}
		expect(buildLiveSessionReactionBody({ emoji: "🎉" })).toMatchObject({ ok: false, code: "invalid_reaction" })
	})
})

describe("live session BFF sanitizers", () => {
	it("keeps pagination and only the documented comment/user projection", () => {
		const input = { success: true, status_code: 200, message: "ok", data: {
			count: 1, total_pages: 1, limit: 50, current: 1, next: null, previous: null, ignored: true,
			results: [comment],
		} }
		const out = sanitizeLiveSessionCommentsPayload(input) as { data: { results: unknown[] } }
		expect(out.data.results).toEqual([{
			id: 9, content: "Hello", created_at: "2026-10-31T09:00:00Z",
			user: { id: "user-uuid", pkid: 4, first_name: "Ada", last_name: "Obi", username: "ada", profile_photo: "photo.jpg" },
		}])
		expect(JSON.stringify(out)).not.toMatch(/private@example|phone_number|is_online|private_field|ignored/)
	})
	it("sanitizes created comment response and reaction response", () => {
		expect(sanitizeLiveSessionCommentCreatePayload({ success: true, data: { comment } })).toMatchObject({
			data: { comment: { id: 9, content: "Hello", user: { username: "ada" } } },
		})
		expect(sanitizeLiveSessionReactionPayload({ success: true, data: { session_id: 12, reaction } })).toMatchObject({
			data: { session_id: 12, reaction: { event_id: "evt-1", emoji: "👍", emoji_count: 2 } },
		})
	})
	it("rejects malformed success bodies instead of forwarding them", () => {
		expect(sanitizeLiveSessionCommentsPayload({ data: { results: "bad" } })).toBeNull()
		expect(sanitizeLiveSessionCommentCreatePayload({ data: { comment: null } })).toBeNull()
		expect(sanitizeLiveSessionReactionPayload({ data: { session_id: "12", reaction } })).toBeNull()
	})
})
