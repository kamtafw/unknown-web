import type { EventCard, EventsPage } from "@/types/events/api"
import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { findCachedRsvp } from "./cache"
import { eventKeys, keyBelongsTo } from "./query-keys"

const card = (id: string, viewerRsvp: EventCard["viewerRsvp"]): EventCard => ({
	id,
	name: id,
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "",
	endTime: "",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: [],
	address: null,
	coordinates: null,
	hosts: [],
	viewerRsvp,
	distanceKm: null,
})
const data = (...cards: EventCard[]) => ({
	pages: [{ events: cards, page: 1, hasNext: false } satisfies EventsPage],
	pageParams: [1],
})
const coords = { latitude: 9.9, longitude: 8.9 }

describe("findCachedRsvp", () => {
	it("finds a recorded status for the same event, account and session", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(1, 0, coords, 25, 20), data(card("a", "going")))
		expect(findCachedRsvp(client, 1, 0, "a")).toBe("going")
	})

	it("also reads My events", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.myEvents(1, 0, "", 20), data(card("a", "interested")))
		expect(findCachedRsvp(client, 1, 0, "a")).toBe("interested")
	})

	it("ignores another account", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(2, 0, coords, 25, 20), data(card("a", "going")))
		expect(findCachedRsvp(client, 1, 0, "a")).toBeNull()
	})

	it("ignores another login session of the same account", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(1, 3, coords, 25, 20), data(card("a", "going")))
		expect(findCachedRsvp(client, 1, 0, "a")).toBeNull()
	})

	it("ignores a different event", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(1, 0, coords, 25, 20), data(card("b", "going")))
		expect(findCachedRsvp(client, 1, 0, "a")).toBeNull()
	})

	it("never turns a card without a status into an answer", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(1, 0, coords, 25, 20), data(card("a", null)))
		expect(findCachedRsvp(client, 1, 0, "a")).toBeNull()
	})

	it("returns null without a signed-in account", () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.nearby(1, 0, coords, 25, 20), data(card("a", "going")))
		expect(findCachedRsvp(client, null, 0, "a")).toBeNull()
	})
})

describe("detail and rsvp keys", () => {
	it("isolate account, session and event", () => {
		const base = eventKeys.detail(1, 0, "e")
		expect(base).not.toEqual(eventKeys.detail(2, 0, "e"))
		expect(base).not.toEqual(eventKeys.detail(1, 1, "e"))
		expect(base).not.toEqual(eventKeys.detail(1, 0, "f"))
		expect(eventKeys.rsvp(1, 0, "e")).not.toEqual(eventKeys.rsvp(1, 1, "e"))
	})
	it("live under their own roots", () => {
		expect(eventKeys.detail(1, 0, "e").slice(0, 2)).toEqual(eventKeys.detailRoot())
		expect(eventKeys.rsvp(1, 0, "e").slice(0, 2)).toEqual(eventKeys.rsvpRoot())
		expect(eventKeys.detailRoot()).not.toEqual(eventKeys.nearbyRoot())
	})
})

describe("keyBelongsTo", () => {
	it("matches the account and session slots only", () => {
		expect(keyBelongsTo(eventKeys.detail(1, 0, "e"), 1, 0)).toBe(true)
		expect(keyBelongsTo(eventKeys.detail(1, 0, "e"), 2, 0)).toBe(false)
		expect(keyBelongsTo(eventKeys.detail(1, 0, "e"), 1, 1)).toBe(false)
		expect(keyBelongsTo(eventKeys.detail(null, 0, "e"), null, 0)).toBe(false)
	})
})


describe("removeEventSubresourceQueries", () => {
	it("removes resource, comment and guest caches for the event across sessions only", async () => {
		const { removeEventSubresourceQueries } = await import("./cache")
		const client = new QueryClient()
		client.setQueryData(eventKeys.resources(1, 0, "event-a"), { links: [] })
		client.setQueryData(eventKeys.comments(1, 0, "event-a"), { pages: [] })
		client.setQueryData(eventKeys.guests(2, 7, "event-a"), { pages: [] })
		client.setQueryData(eventKeys.guests(1, 0, "event-b"), { pages: [] })
		client.setQueryData(eventKeys.detail(1, 0, "event-a"), { id: "event-a" })
		removeEventSubresourceQueries(client, "event-a")
		expect(client.getQueryData(eventKeys.resources(1, 0, "event-a"))).toBeUndefined()
		expect(client.getQueryData(eventKeys.comments(1, 0, "event-a"))).toBeUndefined()
		expect(client.getQueryData(eventKeys.guests(2, 7, "event-a"))).toBeUndefined()
		expect(client.getQueryData(eventKeys.guests(1, 0, "event-b"))).toEqual({ pages: [] })
		expect(client.getQueryData(eventKeys.detail(1, 0, "event-a"))).toEqual({ id: "event-a" })
	})
})
