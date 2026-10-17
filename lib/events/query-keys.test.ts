import { describe, expect, it } from "vitest"
import { eventKeys } from "./query-keys"

const coords = { latitude: 9.9285, longitude: 8.8921 }

describe("nearby keys", () => {
	it("isolate the same scope by account", () => {
		expect(eventKeys.nearby(1, 0, coords, 25, 20)).not.toEqual(
			eventKeys.nearby(2, 0, coords, 25, 20),
		)
	})
	it("isolate separate login sessions of the same account", () => {
		expect(eventKeys.nearby(1, 0, coords, 25, 20)).not.toEqual(
			eventKeys.nearby(1, 1, coords, 25, 20),
		)
	})
	it("isolate different locations, radii and page sizes", () => {
		const base = eventKeys.nearby(1, 0, coords, 25, 20)
		expect(base).not.toEqual(
			eventKeys.nearby(1, 0, { latitude: 10.5, longitude: 8.8921 }, 25, 20),
		)
		expect(base).not.toEqual(eventKeys.nearby(1, 0, coords, 5, 20))
		expect(base).not.toEqual(eventKeys.nearby(1, 0, coords, 25, 50))
	})
	it("share a key for fixes in the same ~110 m bucket", () => {
		expect(eventKeys.nearby(1, 0, { latitude: 9.9281, longitude: 8.8921 }, 25, 20)).toEqual(
			eventKeys.nearby(1, 0, { latitude: 9.9284, longitude: 8.8924 }, 25, 20),
		)
	})
	it("stay under the nearby root for broad invalidation", () => {
		const root = eventKeys.nearbyRoot()
		expect(eventKeys.nearby(1, 0, coords, 25, 20).slice(0, root.length)).toEqual(root)
	})
})

describe("my-events keys", () => {
	it("isolate account, session and search", () => {
		const base = eventKeys.myEvents(1, 0, "", 20)
		expect(base).not.toEqual(eventKeys.myEvents(2, 0, "", 20))
		expect(base).not.toEqual(eventKeys.myEvents(1, 1, "", 20))
		expect(base).not.toEqual(eventKeys.myEvents(1, 0, "jos", 20))
	})
	it("never share a root with nearby", () => {
		expect(eventKeys.myEventsRoot()).not.toEqual(eventKeys.nearbyRoot())
		expect(eventKeys.myEvents(1, 0, "", 20)[1]).toBe("my-events")
		expect(eventKeys.nearby(1, 0, coords, 25, 20)[1]).toBe("nearby")
	})
})
