import { describe, expect, it } from "vitest"
import {
	buildAddressBody,
	buildCommentBody,
	buildMyEventsRequest,
	buildNearbyQuery,
	parsePageParams,
	sanitizeCommentCreatePayload,
	sanitizeCommentsPayload,
	sanitizeGuestsPayload,
	sanitizeResourcesPayload,
} from "./server"
import { normalizeCommentsPage, normalizeGuestsPage, normalizeResources } from "./normalize"

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
			const r = buildMyEventsRequest(
				new URLSearchParams({ filter, q: "a", page: "1" }),
			)
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

/* ------------------------------------------------ Pass 3 (P3-02a): BFF minimisation */

describe("sanitizeGuestsPayload", () => {
	const upstream = () => ({
		success: true,
		status_code: 200,
		message: "Record retrieved successfully",
		data: {
			count: 2,
			total_pages: 1,
			limit: 20,
			current: 1,
			previous: null,
			next: "https://api.example.com/events/x/guests?page=2",
			extra_meta: "dropped",
			results: [
				{
					user_id: 7,
					user_photo: "p.jpg",
					user_full_name: "Bola Ade",
					user_username: "bola",
					role: "guest",
					rsvp_status: "going",
					joined_at: "2026-10-30T09:00:00Z",
					email: "b@example.com",
					phone_number: "+234",
				},
				"junk",
				null,
			],
		},
	})

	it("keeps the approved guest fields and the envelope and pagination fields", () => {
		expect(sanitizeGuestsPayload(upstream())).toEqual({
			success: true,
			status_code: 200,
			message: "Record retrieved successfully",
			data: {
				count: 2,
				total_pages: 1,
				limit: 20,
				current: 1,
				previous: null,
				next: "https://api.example.com/events/x/guests?page=2",
				results: [
					{ user_id: 7, user_photo: "p.jpg", user_full_name: "Bola Ade", user_username: "bola", role: "guest" },
				],
			},
		})
	})

	it("removes RSVP, join date and any contact or unknown field", () => {
		const out = JSON.stringify(sanitizeGuestsPayload(upstream()))
		for (const gone of ["rsvp_status", "going", "joined_at", "2026-10-30", "email", "phone", "extra_meta"]) {
			expect(out).not.toContain(gone)
		}
	})

	it("does not mutate its input", () => {
		const input = upstream()
		const copy = structuredClone(input)
		sanitizeGuestsPayload(input)
		expect(input).toEqual(copy)
	})

	it("keeps an empty page with a next link, and an empty list", () => {
		const page = sanitizeGuestsPayload({ success: true, data: { next: "n", results: [] } }) as {
			data: { next: string; results: unknown[] }
		}
		expect(page.data.next).toBe("n")
		expect(page.data.results).toEqual([])
	})

	it("returns null for a body that is not the documented shape", () => {
		for (const bad of [null, undefined, "x", 5, [], {}, { data: null }, { data: [] }, { data: {} }, { data: { results: {} } }, { data: { results: "x" } }]) {
			expect(sanitizeGuestsPayload(bad)).toBeNull()
		}
	})
})

describe("sanitizeCommentsPayload", () => {
	const upstream = () => ({
		success: true,
		status_code: 200,
		message: null,
		data: {
			count: 1,
			total_pages: 1,
			limit: 10,
			current: 1,
			previous: null,
			next: null,
			results: [
				{
					id: "c1",
					message: "<b>hi</b>",
					created_at: "2026-11-01T10:00:00Z",
					extra: "dropped",
					user: {
						pkid: 9,
						id: "user-uuid",
						photo: "a.jpg",
						full_name: "Ada Obi",
						username: "ada",
						role: "host",
						joined_at: "2026-10-01T10:00:00Z",
						email: "a@example.com",
					},
				},
				{ id: "c2", message: "no author", created_at: "2026-11-01T11:00:00Z", user: null },
			],
		},
	})

	it("keeps the comment and the minimal author, and nothing else", () => {
		const out = sanitizeCommentsPayload(upstream()) as { data: { results: unknown[]; next: unknown } }
		expect(out.data.results).toEqual([
			{
				id: "c1",
				message: "<b>hi</b>",
				created_at: "2026-11-01T10:00:00Z",
				user: { photo: "a.jpg", full_name: "Ada Obi", username: "ada", role: "host" },
			},
			{ id: "c2", message: "no author", created_at: "2026-11-01T11:00:00Z" },
		])
		expect(out.data.next).toBeNull()
	})

	it("removes author identifiers, join date, contact and unknown fields", () => {
		const out = JSON.stringify(sanitizeCommentsPayload(upstream()))
		for (const gone of ["pkid", "user-uuid", "joined_at", "2026-10-01", "email", "extra"]) {
			expect(out).not.toContain(gone)
		}
	})

	it("does not mutate its input", () => {
		const input = upstream()
		const copy = structuredClone(input)
		sanitizeCommentsPayload(input)
		expect(input).toEqual(copy)
	})

	it("returns null for a body that is not the documented shape", () => {
		for (const bad of [null, "x", [], {}, { data: {} }, { data: { results: null } }, { results: [] }]) {
			expect(sanitizeCommentsPayload(bad)).toBeNull()
		}
	})
})

describe("sanitizeResourcesPayload", () => {
	const upstream = () => ({
		success: true,
		status_code: 200,
		message: null,
		data: {
			event: "Jos Tech Meetup",
			links: [{ link_name: "Agenda", url: "https://example.com/a", date_added: "01/11/2026", extra: 1 }],
			documents: [
				{
					doc_name: "Slides",
					doc_file: "events/docs/s.pdf",
					size: "1.2 MB",
					file_type: "PDF",
					date_uploaded: "02/11/2026",
					uploaded_by: "someone",
				},
			],
		},
	})

	it("keeps link name and address and the document fields", () => {
		expect(sanitizeResourcesPayload(upstream())).toEqual({
			success: true,
			status_code: 200,
			message: null,
			data: {
				links: [{ link_name: "Agenda", url: "https://example.com/a" }],
				documents: [
					{
						doc_name: "Slides",
						doc_file: "events/docs/s.pdf",
						size: "1.2 MB",
						file_type: "PDF",
						date_uploaded: "02/11/2026",
					},
				],
			},
		})
	})

	it("removes the event name, date_added and unknown fields", () => {
		const out = JSON.stringify(sanitizeResourcesPayload(upstream()))
		for (const gone of ["Jos Tech Meetup", "date_added", "01/11/2026", "extra", "uploaded_by", "someone"]) {
			expect(out).not.toContain(gone)
		}
	})

	it("keeps empty arrays, and does not mutate its input", () => {
		const empty = sanitizeResourcesPayload({ success: true, data: { event: "x", links: [], documents: [] } })
		expect(empty).toEqual({ success: true, data: { links: [], documents: [] } })
		const input = upstream()
		const copy = structuredClone(input)
		sanitizeResourcesPayload(input)
		expect(input).toEqual(copy)
	})

	it("returns null (never an empty-looking success) when links or documents are missing or wrong", () => {
		for (const bad of [null, "x", [], {}, { data: {} }, { data: { links: [] } }, { data: { documents: [] } }, { data: { links: {}, documents: [] } }, { data: { links: [], documents: "x" } }]) {
			expect(sanitizeResourcesPayload(bad)).toBeNull()
		}
	})
})

describe("sanitisers stay compatible with the application normalisers", () => {
	// the normalisers read the same wire keys, so minimising first must not change what they produce
	const data = (body: unknown) => (body as { data: unknown }).data

	it("guests", () => {
		const raw = {
			success: true,
			data: { next: "n", results: [{ user_id: 3, user_full_name: "A B", user_username: "ab", user_photo: "p.jpg", role: "host", rsvp_status: "going", joined_at: "2026-01-01T00:00:00Z" }] },
		}
		expect(normalizeGuestsPage(data(sanitizeGuestsPayload(raw)), 1)).toEqual(normalizeGuestsPage(raw.data, 1))
	})

	it("comments", () => {
		const raw = {
			success: true,
			data: { next: null, results: [{ id: "c", message: "m", created_at: "2026-11-01T10:00:00Z", user: { pkid: 1, id: "u", photo: "p.jpg", full_name: "A B", username: "ab", role: "guest", joined_at: "2026-01-01T00:00:00Z" } }] },
		}
		expect(normalizeCommentsPage(data(sanitizeCommentsPayload(raw)), 1)).toEqual(normalizeCommentsPage(raw.data, 1))
	})

	it("resources", () => {
		const raw = {
			success: true,
			data: {
				event: "E",
				links: [{ link_name: "L", url: "https://example.com", date_added: "01/01/2026" }],
				documents: [{ doc_name: "D", doc_file: "d/x.pdf", size: "1 MB", file_type: "pdf", date_uploaded: "02/01/2026" }],
			},
		}
		expect(normalizeResources(data(sanitizeResourcesPayload(raw)))).toEqual(normalizeResources(raw.data))
	})
})

describe("buildCommentBody / sanitizeCommentCreatePayload (P3-06)", () => {
	it("keeps only the trimmed message", () => {
		expect(buildCommentBody({ message: " hi ", user: 1, event: "x" })).toEqual({ ok: true, value: { message: "hi" } })
	})
	it("rejects blank, whitespace-only and non-object input", () => {
		for (const input of [{ message: "" }, { message: "  " }, {}, null, [], "text", { message: 1 }]) {
			expect(buildCommentBody(input)).toMatchObject({ ok: false, code: "invalid_comment" })
		}
	})
	it("applies no length limit", () => {
		const long = "z".repeat(50_000)
		expect(buildCommentBody({ message: long })).toEqual({ ok: true, value: { message: long } })
	})
	it("sanitises a 201 to the envelope and data.message only", () => {
		expect(
			sanitizeCommentCreatePayload({ success: true, status_code: 201, message: null, extra: 1, data: { message: "a", id: "c" } }),
		).toEqual({ success: true, status_code: 201, message: null, data: { message: "a" } })
	})
	it("treats anything else as unreadable", () => {
		for (const input of [null, {}, { data: null }, { data: {} }, { data: { message: 3 } }, []]) {
			expect(sanitizeCommentCreatePayload(input)).toBeNull()
		}
	})
})
