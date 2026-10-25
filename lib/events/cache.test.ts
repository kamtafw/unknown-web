import type { EventCard, EventsPage } from "@/types/events/api"
import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import {
	findCachedRsvp,
	invalidateEventSubResources,
	refreshCommentsFromFirstPage,
	removeEventSubResources,
} from "./cache"
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

describe("event sub-resource cache helpers", () => {
	const A = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
	const B = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"

	function seed(client: QueryClient) {
		for (const [acct, gen, ev] of [
			[1, 0, A],
			[1, 0, B],
			[2, 0, A],
			[1, 1, A],
		] as const) {
			client.setQueryData(eventKeys.resources(acct, gen, ev), { links: [], documents: [] })
			client.setQueryData(eventKeys.comments(acct, gen, ev, 20), { pages: [], pageParams: [] })
			client.setQueryData(eventKeys.guests(acct, gen, ev, 20), { pages: [], pageParams: [] })
		}
		client.setQueryData(eventKeys.detail(1, 0, A), { kind: "full" })
		client.setQueryData(eventKeys.rsvp(1, 0, A), "going")
		client.setQueryData(eventKeys.myEvents(1, 0, "", 20), data())
	}
	const present = (client: QueryClient, key: readonly unknown[]) =>
		client.getQueryData(key) !== undefined

	it("removes all three sections of one event for the same account and session only", () => {
		const client = new QueryClient()
		seed(client)
		removeEventSubResources(client, 1, 0, A)
		expect(present(client, eventKeys.resources(1, 0, A))).toBe(false)
		expect(present(client, eventKeys.comments(1, 0, A, 20))).toBe(false)
		expect(present(client, eventKeys.guests(1, 0, A, 20))).toBe(false)
		// other event, other account, other login session and unrelated keys stay
		expect(present(client, eventKeys.resources(1, 0, B))).toBe(true)
		expect(present(client, eventKeys.resources(2, 0, A))).toBe(true)
		expect(present(client, eventKeys.comments(1, 1, A, 20))).toBe(true)
		expect(present(client, eventKeys.detail(1, 0, A))).toBe(true)
		expect(present(client, eventKeys.rsvp(1, 0, A))).toBe(true)
		expect(present(client, eventKeys.myEvents(1, 0, "", 20))).toBe(true)
	})

	it("does nothing without a known account", () => {
		const client = new QueryClient()
		seed(client)
		removeEventSubResources(client, null, 0, A)
		expect(present(client, eventKeys.resources(1, 0, A))).toBe(true)
	})

	it("invalidates only the named sections of that event, account and session", async () => {
		const client = new QueryClient()
		seed(client)
		await invalidateEventSubResources(client, 1, 0, A, ["comments", "guests"])
		const stale = (key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated === true
		expect(stale(eventKeys.comments(1, 0, A, 20))).toBe(true)
		expect(stale(eventKeys.guests(1, 0, A, 20))).toBe(true)
		expect(stale(eventKeys.resources(1, 0, A))).toBe(false)
		expect(stale(eventKeys.comments(1, 0, B, 20))).toBe(false)
		expect(stale(eventKeys.comments(2, 0, A, 20))).toBe(false)
		expect(stale(eventKeys.comments(1, 1, A, 20))).toBe(false)
		expect(stale(eventKeys.detail(1, 0, A))).toBe(false)
	})

	it("invalidates all three sections by default", async () => {
		const client = new QueryClient()
		seed(client)
		await invalidateEventSubResources(client, 1, 0, A)
		for (const key of [
			eventKeys.resources(1, 0, A),
			eventKeys.comments(1, 0, A, 20),
			eventKeys.guests(1, 0, A, 20),
		]) {
			expect(client.getQueryState(key)?.isInvalidated).toBe(true)
		}
	})
})

describe("refreshCommentsFromFirstPage (P3-06)", () => {
	const E = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
	const OTHER = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
	const thread = () => ({
		pages: [
			{ page: 1, hasNext: true, comments: [] },
			{ page: 2, hasNext: false, comments: [] },
		],
		pageParams: [1, 2],
	})

	it("keeps only page 1 of this event's thread and marks it stale", async () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.comments(7, 2, E, 20), thread())
		await refreshCommentsFromFirstPage(client, 7, 2, E)
		const data = client.getQueryData<ReturnType<typeof thread>>(eventKeys.comments(7, 2, E, 20))
		expect(data?.pages).toHaveLength(1)
		expect(data?.pageParams).toEqual([1])
		expect(client.getQueryState(eventKeys.comments(7, 2, E, 20))?.isInvalidated).toBe(true)
	})

	it("leaves other events, accounts, sessions and sections alone", async () => {
		const client = new QueryClient()
		const keys = [
			eventKeys.comments(7, 2, OTHER, 20),
			eventKeys.comments(8, 2, E, 20),
			eventKeys.comments(7, 1, E, 20),
		]
		for (const key of keys) client.setQueryData(key, thread())
		client.setQueryData(eventKeys.resources(7, 2, E), { links: [], documents: [] })
		client.setQueryData(eventKeys.guests(7, 2, E, 20), thread())
		await refreshCommentsFromFirstPage(client, 7, 2, E)
		for (const key of keys) {
			expect(client.getQueryData<ReturnType<typeof thread>>(key)?.pages).toHaveLength(2)
			expect(client.getQueryState(key)?.isInvalidated).toBe(false)
		}
		expect(client.getQueryState(eventKeys.resources(7, 2, E))?.isInvalidated).toBe(false)
		expect(client.getQueryState(eventKeys.guests(7, 2, E, 20))?.isInvalidated).toBe(false)
	})

	it("does nothing without an account", async () => {
		const client = new QueryClient()
		client.setQueryData(eventKeys.comments(7, 2, E, 20), thread())
		await refreshCommentsFromFirstPage(client, null, 2, E)
		expect(
			client.getQueryData<ReturnType<typeof thread>>(eventKeys.comments(7, 2, E, 20))?.pages,
		).toHaveLength(2)
	})
})
