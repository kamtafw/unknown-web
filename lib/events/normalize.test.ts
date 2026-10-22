import { describe, expect, it } from "vitest"
import {
	dedupeEvents,
	flattenPages,
	normalizeEvent,
	normalizeEventDetails,
	normalizeHttpUrl,
	normalizeListData,
	normalizeNearbyData,
	normalizeRsvpResult,
	normalizeTime,
} from "./normalize"

const wire = (over: Record<string, unknown> = {}) => ({
	id: "11111111-1111-1111-1111-111111111111",
	name: "Jos Tech Meetup",
	start_date: "2026-11-01",
	end_date: "2026-11-01",
	start_time: "18:00",
	end_time: "20:00",
	is_locked: false,
	is_live: false,
	privacy: "public",
	cover_image: "events/covers/a.jpg",
	hosts: [
		{
			pkid: 5,
			id: "host-uuid",
			first_name: "Ada",
			last_name: "Obi",
			email: "ada@example.com",
			username: "ada",
			phone_number: "+2348000000000",
			profile_photo: null,
		},
	],
	event_hashtags: ["tech", "jos"],
	event_location: { address: "Jos, Plateau", coordinates: [8.89, 9.92] },
	guests: [{ user_id: 9, user_full_name: "Secret Guest" }],
	links: [{ link_name: "Private", url: "https://private.example" }],
	documents: [{ doc_name: "Private", doc_file: "x.pdf" }],
	viewer_rsvp_status: "going",
	...over,
})

describe("normalizeTime", () => {
	it("accepts HH:MM and HH:MM:SS", () => {
		expect(normalizeTime("18:00")).toBe("18:00")
		expect(normalizeTime("18:00:00")).toBe("18:00")
		expect(normalizeTime("9:05:30")).toBe("09:05")
	})
	it("returns an empty string for anything else", () => {
		expect(normalizeTime("")).toBe("")
		expect(normalizeTime(null)).toBe("")
		expect(normalizeTime("6pm")).toBe("")
	})
})

describe("normalizeEvent", () => {
	it("maps a full event and reads coordinates longitude-first", () => {
		const e = normalizeEvent(wire())!
		expect(e.name).toBe("Jos Tech Meetup")
		expect(e.coordinates).toEqual({ latitude: 9.92, longitude: 8.89 })
		expect(e.address).toBe("Jos, Plateau")
		expect(e.hashtags).toEqual(["tech", "jos"])
		expect(e.viewerRsvp).toBe("going")
		expect(e.privacy).toBe("public")
	})

	it("prefers the nearby top-level address and parses distance", () => {
		const e = normalizeEvent(wire({ address: "Terminus, Jos", distance_km: "1.25" }))!
		expect(e.address).toBe("Terminus, Jos")
		expect(e.distanceKm).toBe(1.25)
	})

	it("never retains restricted-event data (host contact details, guests, links, documents)", () => {
		const serialized = JSON.stringify(normalizeEvent(wire()))
		for (const leaked of [
			"ada@example.com",
			"+2348000000000",
			"Secret Guest",
			"private.example",
			"x.pdf",
			"phone_number",
			"email",
			"guests",
			"links",
			"documents",
		]) {
			expect(serialized).not.toContain(leaked)
		}
		expect(normalizeEvent(wire())!.hosts).toEqual([
			{ id: "host-uuid", name: "Ada Obi", username: "ada", photo: null },
		])
	})

	it("treats zero coordinates as valid and rejects malformed ones", () => {
		expect(
			normalizeEvent(wire({ event_location: { address: "", coordinates: [0, 0] } }))!.coordinates,
		).toEqual({ latitude: 0, longitude: 0 })
		expect(
			normalizeEvent(wire({ event_location: { coordinates: [8.89] } }))!.coordinates,
		).toBeNull()
		expect(
			normalizeEvent(wire({ event_location: { coordinates: [200, 9] } }))!.coordinates,
		).toBeNull()
	})

	it("handles a null location, unknown enums and missing optional fields", () => {
		const e = normalizeEvent(
			wire({ event_location: null, privacy: "weird", viewer_rsvp_status: "", hosts: undefined }),
		)!
		expect(e.address).toBeNull()
		expect(e.coordinates).toBeNull()
		expect(e.privacy).toBeNull()
		expect(e.viewerRsvp).toBeNull()
		expect(e.hosts).toEqual([])
	})

	it("normalises restricted-preview style seconds in times", () => {
		const e = normalizeEvent(wire({ start_time: "18:00:00", end_time: "20:30:00" }))!
		expect(e.startTime).toBe("18:00")
		expect(e.endTime).toBe("20:30")
	})

	it("returns null without an id or a name", () => {
		expect(normalizeEvent(wire({ id: "" }))).toBeNull()
		expect(normalizeEvent(wire({ name: "  " }))).toBeNull()
		expect(normalizeEvent(null)).toBeNull()
		expect(normalizeEvent("x")).toBeNull()
	})
})

describe("normalizeNearbyData", () => {
	it("handles the empty shape (data.events, no pagination)", () => {
		expect(normalizeNearbyData({ events: [] }, 1)).toEqual({ events: [], page: 1, hasNext: false })
	})

	it("handles the paginated shape (data.results.events)", () => {
		const page = normalizeNearbyData(
			{
				count: 25,
				total_pages: 3,
				limit: 10,
				current: 2,
				previous: "p",
				next: "https://api/next",
				results: { detail: "25 locations", events: [wire(), wire({ id: "other", name: "B" })] },
			},
			2,
		)
		expect(page.events.map((e) => e.name)).toEqual(["Jos Tech Meetup", "B"])
		expect(page.page).toBe(2)
		expect(page.hasNext).toBe(true)
	})

	it("keeps hasNext true for an empty page with a non-null next (expired/orphan locations)", () => {
		const page = normalizeNearbyData(
			{ next: "https://api/next", results: { detail: "10", events: [] } },
			1,
		)
		expect(page.events).toEqual([])
		expect(page.hasNext).toBe(true)
	})

	it("ignores count / total_pages when deciding hasNext", () => {
		const page = normalizeNearbyData(
			{ count: 99, total_pages: 9, next: null, results: { events: [wire()] } },
			1,
		)
		expect(page.hasNext).toBe(false)
	})

	it("does not throw on unexpected payloads", () => {
		expect(normalizeNearbyData(null, 1)).toEqual({ events: [], page: 1, hasNext: false })
		expect(normalizeNearbyData("oops", 1).events).toEqual([])
		expect(normalizeNearbyData({ results: { events: "nope" } }, 1).events).toEqual([])
	})
})

describe("normalizeListData", () => {
	it("maps data.results and next", () => {
		const page = normalizeListData({ results: [wire()], next: "n" }, 3)
		expect(page.events).toHaveLength(1)
		expect(page.page).toBe(3)
		expect(page.hasNext).toBe(true)
	})
	it("handles an empty list", () => {
		expect(normalizeListData({ results: [], next: null }, 1).hasNext).toBe(false)
		expect(normalizeListData(undefined, 1).events).toEqual([])
	})
})

describe("dedupe / flatten", () => {
	it("keeps the first occurrence and the original order", () => {
		const a = normalizeEvent(wire({ id: "a", name: "A" }))!
		const b = normalizeEvent(wire({ id: "b", name: "B" }))!
		const a2 = normalizeEvent(wire({ id: "a", name: "A again" }))!
		expect(dedupeEvents([a, b, a2]).map((e) => e.name)).toEqual(["A", "B"])
		expect(
			flattenPages([
				{ events: [a, b], page: 1, hasNext: true },
				{ events: [a2], page: 2, hasNext: false },
			]).map((e) => e.id),
		).toEqual(["a", "b"])
		expect(flattenPages(undefined)).toEqual([])
	})
})

describe("normalizeEventDetails — full", () => {
	const full = (over: Record<string, unknown> = {}) =>
		wire({
			live_session_id: 12,
			live_session: { id: 12, status: "waiting" },
			links: [
				{ link_name: "Site", url: "https://ok.io" },
				{ link_name: "Bad", url: "javascript:alert(1)" },
				{ link_name: "Data", url: "data:text/html,x" },
			],
			documents: [{ doc_name: "Agenda", doc_file: "events/docs/a.pdf" }, { doc_name: "No file" }],
			...over,
		})

	it("is marked by the hosts array and keeps only whitelisted data", () => {
		const d = normalizeEventDetails(full())
		expect(d?.kind).toBe("full")
		if (d?.kind !== "full") return
		expect(d.hosts).toEqual([{ id: "host-uuid", name: "Ada Obi", username: "ada", photo: null }])
		expect(d.liveSessionId).toBe(12)
		expect(d.liveSessionStatus).toBe("waiting")
		expect(d.coordinates).toEqual({ latitude: 9.92, longitude: 8.89 })
		expect(d.address).toBe("Jos, Plateau")
		expect(JSON.stringify(d)).not.toMatch(/ada@example|\+2348000000000|Secret Guest/)
		expect(d).not.toHaveProperty("guests")
	})

	it("keeps only http(s) links and resolves document URLs", () => {
		const d = normalizeEventDetails(full())
		if (d?.kind !== "full") throw new Error("full expected")
		expect(d.links).toEqual([{ name: "Site", url: "https://ok.io" }])
		expect(d.documents).toEqual([
			{ name: "Agenda", url: "https://appscombo.s3.eu-north-1.amazonaws.com/media/events/docs/a.pdf" },
		])
	})

	it("reports a known RSVP, and a known absence of one", () => {
		const set = normalizeEventDetails(full())
		const none = normalizeEventDetails(full({ viewer_rsvp_status: null }))
		if (set?.kind !== "full" || none?.kind !== "full") throw new Error("full expected")
		expect(set.rsvp).toEqual({ state: "set", status: "going" })
		expect(none.rsvp).toEqual({ state: "none" })
	})

	it("treats a missing or unknown session status as unknown, not as ended", () => {
		const d = normalizeEventDetails(full({ live_session: { id: 12, status: "weird" } }))
		if (d?.kind !== "full") throw new Error("full expected")
		expect(d.liveSessionStatus).toBeNull()
	})
})

describe("normalizeEventDetails — restricted preview", () => {
	const preview = (over: Record<string, unknown> = {}) => ({
		id: "22222222-2222-2222-2222-222222222222",
		name: "Private launch",
		start_date: "2026-11-01",
		end_date: "2026-11-01",
		start_time: "18:00:00",
		end_time: "20:00:00",
		is_locked: true,
		is_live: false,
		privacy: "private",
		cover_image: null,
		live_session_id: 3,
		address: "Jos",
		hashtags: ["launch"],
		...over,
	})

	it("is a preview when there is no hosts array, trims seconds and reads the flat fields", () => {
		const d = normalizeEventDetails(preview())
		expect(d).toEqual({
			kind: "preview",
			id: "22222222-2222-2222-2222-222222222222",
			name: "Private launch",
			startDate: "2026-11-01",
			endDate: "2026-11-01",
			startTime: "18:00",
			endTime: "20:00",
			isLive: false,
			isLocked: true,
			privacy: "private",
			coverImage: null,
			liveSessionId: 3,
			address: "Jos",
			hashtags: ["launch"],
		})
	})

	it("has no hosts, resources, session status or RSVP to misread as empty", () => {
		const d = normalizeEventDetails(preview())
		for (const key of ["hosts", "links", "documents", "rsvp", "liveSessionStatus", "coordinates"]) {
			expect(d).not.toHaveProperty(key)
		}
	})

	it("falls back to a preview for an unrecognised shape, so it can only lose access", () => {
		expect(normalizeEventDetails(preview({ hosts: "nope", links: [{ link_name: "x", url: "https://x.io" }] }))?.kind).toBe("preview")
	})

	it("rejects payloads without an id or name", () => {
		expect(normalizeEventDetails(null)).toBeNull()
		expect(normalizeEventDetails({ id: "", name: "x" })).toBeNull()
		expect(normalizeEventDetails({ id: "x", name: "" })).toBeNull()
	})
})

describe("normalizeHttpUrl / normalizeRsvpResult", () => {
	it("keeps only http and https", () => {
		expect(normalizeHttpUrl("https://a.io/x")).toBe("https://a.io/x")
		expect(normalizeHttpUrl("http://a.io")).toBe("http://a.io")
		for (const bad of ["javascript:alert(1)", "ftp://a.io", "a.io", "", null, 5]) {
			expect(normalizeHttpUrl(bad)).toBeNull()
		}
	})
	it("reads the rsvp response and rejects unknown statuses", () => {
		expect(normalizeRsvpResult({ event: "e1", status: "going" })).toEqual({ eventId: "e1", status: "going" })
		expect(normalizeRsvpResult({ event: "e1", status: "maybe" })).toBeNull()
		expect(normalizeRsvpResult(null)).toBeNull()
	})
})
