import type { EventCard } from "@/types/events/api"
import { describe, expect, it } from "vitest"
import { filterNearbyEvents, normalizeQuery } from "./search"

const ev = (over: Partial<EventCard>): EventCard => ({
	id: "1",
	name: "Event",
	startDate: "",
	endDate: "",
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
	viewerRsvp: null,
	distanceKm: null,
	...over,
})

describe("filterNearbyEvents", () => {
	const events = [
		ev({ id: "1", name: "Jos Tech Meetup", hashtags: ["code"], address: "Terminus, Jos" }),
		ev({ id: "2", name: "Food Fair", hashtags: ["music"], address: "Rayfield" }),
	]
	it("returns everything for an empty or whitespace query", () => {
		expect(filterNearbyEvents(events, "")).toBe(events)
		expect(filterNearbyEvents(events, "   ")).toBe(events)
	})
	it("matches name, address and hashtags case-insensitively", () => {
		expect(filterNearbyEvents(events, "TECH").map((e) => e.id)).toEqual(["1"])
		expect(filterNearbyEvents(events, "rayfield").map((e) => e.id)).toEqual(["2"])
		expect(filterNearbyEvents(events, "#music").map((e) => e.id)).toEqual(["2"])
	})
	it("returns an empty list when nothing matches", () => {
		expect(filterNearbyEvents(events, "zzz")).toEqual([])
	})
	it("normalises the query", () => {
		expect(normalizeQuery("  ##Music ")).toBe("music")
	})
})
