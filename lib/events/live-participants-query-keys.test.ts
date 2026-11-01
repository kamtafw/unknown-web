import { describe, expect, it } from "vitest"
import { eventKeys, keyBelongsTo } from "./query-keys"

describe("live participant query keys", () => {
	const key = () => eventKeys.liveParticipants(5, 2, 42, 20, "speaker")

	it("isolate account, login generation, session, page size and role", () => {
		expect(key()).not.toEqual(eventKeys.liveParticipants(6, 2, 42, 20, "speaker"))
		expect(key()).not.toEqual(eventKeys.liveParticipants(5, 3, 42, 20, "speaker"))
		expect(key()).not.toEqual(eventKeys.liveParticipants(5, 2, 43, 20, "speaker"))
		expect(key()).not.toEqual(eventKeys.liveParticipants(5, 2, 42, 50, "speaker"))
		expect(key()).not.toEqual(eventKeys.liveParticipants(5, 2, 42, 20, "listener"))
	})

	it("keeps page out of the key and uses the standard account/session slots", () => {
		const value = key()
		expect(JSON.stringify(value)).not.toContain("page")
		expect(value[1]).toBe("live-participants")
		expect(value[2]).toBe(5)
		expect(value[3]).toBe(2)
		expect(keyBelongsTo(value, 5, 2)).toBe(true)
		expect(keyBelongsTo(value, 6, 2)).toBe(false)
		expect(keyBelongsTo(value, 5, 3)).toBe(false)
	})

	it("has a dedicated root and does not collide with other Events query roots", () => {
		const roots = [
			eventKeys.nearbyRoot(),
			eventKeys.myEventsRoot(),
			eventKeys.detailRoot(),
			eventKeys.liveSessionRoot(),
			eventKeys.resourcesRoot(),
			eventKeys.commentsRoot(),
			eventKeys.guestsRoot(),
		]
		expect(roots.map((r) => r[1])).not.toContain(eventKeys.liveParticipantsRoot()[1])
		expect(valueRoot(key())).toEqual(eventKeys.liveParticipantsRoot())
	})
})

function valueRoot(key: readonly unknown[]) {
	return key.slice(0, eventKeys.liveParticipantsRoot().length)
}
