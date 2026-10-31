import { describe, expect, it } from "vitest"
import { liveSessionKeys } from "./live-query-keys"

describe("liveSessionKeys", () => {
	it("isolates live comment data by account, login generation, session and page size", () => {
		const key = liveSessionKeys.comments(1, 0, 12, 50)
		expect(key).not.toEqual(liveSessionKeys.comments(2, 0, 12, 50))
		expect(key).not.toEqual(liveSessionKeys.comments(1, 1, 12, 50))
		expect(key).not.toEqual(liveSessionKeys.comments(1, 0, 13, 50))
		expect(key).not.toEqual(liveSessionKeys.comments(1, 0, 12, 20))
	})
	it("keeps live-session data under a distinct root from event discussion comments", () => {
		expect(liveSessionKeys.commentsRoot()).toEqual(["events", "live-session-data", "comments"])
		expect(liveSessionKeys.commentsRoot()).not.toEqual(["events", "comments"])
	})
	it("isolates room aggregates by account, login generation and session", () => {
		const key = liveSessionKeys.room(1, 0, 12)
		expect(key).not.toEqual(liveSessionKeys.room(2, 0, 12))
		expect(key).not.toEqual(liveSessionKeys.room(1, 1, 12))
		expect(key).not.toEqual(liveSessionKeys.room(1, 0, 13))
	})
})
