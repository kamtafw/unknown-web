import { describe, expect, it } from "vitest"
import { buildAddressBody, buildMyEventsRequest, buildNearbyQuery, parsePageParams } from "./server"

const qs = (s: string) => new URLSearchParams(s)

describe("buildNearbyQuery", () => {
	it("always pins radius_km to 25, ignoring a client-supplied radius", () => {
		for (const extra of ["", "&radius_km=1000", "&radius_km=0", "&radius_km=-5", "&radius_km="]) {
			const r = buildNearbyQuery(qs(`latitude=9.9&longitude=8.9${extra}`))
			expect(r.ok).toBe(true)
			if (r.ok) expect(r.value.getAll("radius_km")).toEqual(["25"])
		}
	})

	it("accepts zero coordinates", () => {
		const r = buildNearbyQuery(qs("latitude=0&longitude=0"))
		expect(r.ok).toBe(true)
		if (r.ok) {
			expect(r.value.get("latitude")).toBe("0.000000")
			expect(r.value.get("longitude")).toBe("0.000000")
		}
	})

	it.each([
		["missing both", ""],
		["missing longitude", "latitude=9.9"],
		["empty latitude", "latitude=&longitude=8.9"],
		["non-numeric", "latitude=abc&longitude=8.9"],
		["latitude out of range", "latitude=91&longitude=8.9"],
		["longitude out of range", "latitude=9.9&longitude=181"],
		["infinite", "latitude=Infinity&longitude=8.9"],
		["hex", "latitude=0x10&longitude=8.9"],
	])("rejects %s with invalid_coordinates", (_name, query) => {
		const r = buildNearbyQuery(qs(query))
		expect(r).toMatchObject({ ok: false, code: "invalid_coordinates" })
	})

	it("forwards page and limit, defaulting to page 1 and the configured page size", () => {
		const r = buildNearbyQuery(qs("latitude=9.9&longitude=8.9&page=3&limit=50"))
		expect(r.ok && r.value.get("page")).toBe("3")
		expect(r.ok && r.value.get("limit")).toBe("50")
		const d = buildNearbyQuery(qs("latitude=9.9&longitude=8.9"))
		expect(d.ok && d.value.get("page")).toBe("1")
		expect(d.ok && d.value.get("limit")).toBe("20")
	})

	it("never forwards unknown client parameters (filter, q, privacy …)", () => {
		const r = buildNearbyQuery(qs("latitude=9.9&longitude=8.9&filter=all&q=x&privacy=public"))
		expect(r.ok).toBe(true)
		if (r.ok) {
			expect([...r.value.keys()].sort()).toEqual(
				["latitude", "limit", "longitude", "page", "radius_km"].sort(),
			)
		}
	})
})

describe("parsePageParams", () => {
	it("clamps limit to 100 and falls back on invalid input", () => {
		expect(parsePageParams(qs("limit=500")).limit).toBe(100)
		expect(parsePageParams(qs("limit=0")).limit).toBe(20)
		expect(parsePageParams(qs("limit=abc")).limit).toBe(20)
		expect(parsePageParams(qs("page=0")).page).toBe(1)
		expect(parsePageParams(qs("page=-2")).page).toBe(1)
		expect(parsePageParams(qs("page=2.5")).page).toBe(1)
		expect(parsePageParams(qs("page=7")).page).toBe(7)
	})
})

describe("buildMyEventsRequest", () => {
	it("uses list with filter=my_events when there is no search term", () => {
		const r = buildMyEventsRequest(qs(""))
		expect(r.path).toBe("list")
		expect(r.query.get("filter")).toBe("my_events")
		expect(r.query.has("q")).toBe(false)
	})

	it("uses search with q AND filter=my_events when a search term is present", () => {
		const r = buildMyEventsRequest(qs("q=%20jos%20meetup%20"))
		expect(r.path).toBe("search")
		expect(r.query.get("q")).toBe("jos meetup")
		expect(r.query.get("filter")).toBe("my_events")
	})

	it("treats a whitespace-only term as no search", () => {
		expect(buildMyEventsRequest(qs("q=%20%20")).path).toBe("list")
	})

	it("cannot be overridden by a client-supplied filter", () => {
		for (const filter of ["", "all", "my_events,all", "MY_EVENTS"]) {
			const r = buildMyEventsRequest(new URLSearchParams({ filter, q: "a", page: "1" }))
			expect(r.query.getAll("filter")).toEqual(["my_events"])
			const l = buildMyEventsRequest(new URLSearchParams({ filter }))
			expect(l.query.getAll("filter")).toEqual(["my_events"])
		}
	})

	it("caps the search term length", () => {
		const r = buildMyEventsRequest(new URLSearchParams({ q: "x".repeat(500) }))
		expect(r.query.get("q")).toHaveLength(100)
	})
})

describe("buildAddressBody", () => {
	it("always resolves the supplied point, never the stored account location", () => {
		const r = buildAddressBody({ latitude: 9.9, longitude: 8.9, use_live_location: true })
		expect(r).toEqual({
			ok: true,
			value: { use_live_location: false, latitude: "9.900000", longitude: "8.900000" },
		})
	})
	it("accepts zero and rejects invalid bodies", () => {
		expect(buildAddressBody({ latitude: 0, longitude: 0 }).ok).toBe(true)
		expect(buildAddressBody({ latitude: "9.9", longitude: 8.9 }).ok).toBe(false)
		expect(buildAddressBody({ latitude: 95, longitude: 8.9 }).ok).toBe(false)
		expect(buildAddressBody(null).ok).toBe(false)
		expect(buildAddressBody("x").ok).toBe(false)
	})
})
