import { describe, expect, it } from "vitest"
import { eventKeys, eventSubResourceRoots, keyBelongsTo, keyEventId } from "./query-keys"

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

describe("Pass 3 sub-resource keys", () => {
	const E = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
	const make = {
		resources: () => eventKeys.resources(1, 0, E),
		comments: () => eventKeys.comments(1, 0, E, 20),
		guests: () => eventKeys.guests(1, 0, E, 20),
	}

	it("put the account in slot 2 and the session in slot 3, like every other scoped key", () => {
		for (const build of Object.values(make)) {
			const key = build()
			expect(key[2]).toBe(1)
			expect(key[3]).toBe(0)
			expect(keyBelongsTo(key, 1, 0)).toBe(true)
			expect(keyEventId(key)).toBe(E)
		}
	})

	it("are never matched by another account or another login session", () => {
		for (const build of Object.values(make)) {
			expect(keyBelongsTo(build(), 2, 0)).toBe(false)
			expect(keyBelongsTo(build(), 1, 1)).toBe(false)
			expect(keyBelongsTo(build(), null, 0)).toBe(false)
		}
	})

	it("isolate account, session, event and page size", () => {
		expect(eventKeys.resources(1, 0, E)).not.toEqual(eventKeys.resources(2, 0, E))
		expect(eventKeys.resources(1, 0, E)).not.toEqual(eventKeys.resources(1, 1, E))
		expect(eventKeys.resources(1, 0, E)).not.toEqual(eventKeys.resources(1, 0, "other"))
		expect(eventKeys.comments(1, 0, E, 20)).not.toEqual(eventKeys.comments(1, 0, E, 50))
		expect(eventKeys.guests(1, 0, E, 20)).not.toEqual(eventKeys.guests(1, 0, E, 50))
	})

	it("keep the page out of the key and sit under distinct roots", () => {
		expect(JSON.stringify(eventKeys.comments(1, 0, E, 20))).not.toContain("page")
		expect(new Set(eventSubResourceRoots.map((r) => r[1])).size).toBe(3)
		for (const [root, build] of [
			[eventKeys.resourcesRoot(), make.resources],
			[eventKeys.commentsRoot(), make.comments],
			[eventKeys.guestsRoot(), make.guests],
		] as const) {
			expect(build().slice(0, root.length)).toEqual(root)
		}
	})

	it("do not collide with the existing roots", () => {
		const existing = [
			eventKeys.nearbyRoot(),
			eventKeys.myEventsRoot(),
			eventKeys.addressRoot(),
			eventKeys.detailRoot(),
			eventKeys.rsvpRoot(),
		].map((r) => r[1])
		for (const root of eventSubResourceRoots) expect(existing).not.toContain(root[1])
	})
})
