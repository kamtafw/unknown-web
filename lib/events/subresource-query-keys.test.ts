import { describe, expect, it } from "vitest"
import { eventKeys, keyBelongsTo } from "./query-keys"

describe("sub-resource query keys", () => {
	it.each(["resources", "comments", "guests"] as const)("scopes %s by account and session", (kind) => {
		const make = eventKeys[kind]
		expect(make(1, 0, "event-a")).not.toEqual(make(2, 0, "event-a"))
		expect(make(1, 0, "event-a")).not.toEqual(make(1, 1, "event-a"))
		expect(make(1, 0, "event-a")).not.toEqual(make(1, 0, "event-b"))
		expect(make(1, 0, "event-a").slice(0, 2)).toEqual(["events", kind])
		expect(keyBelongsTo(make(1, 0, "event-a"), 1, 0)).toBe(true)
		expect(keyBelongsTo(make(2, 0, "event-a"), 1, 0)).toBe(false)
	})
})
