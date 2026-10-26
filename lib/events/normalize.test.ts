import { describe, expect, it } from "vitest"
import {
	dedupeEvents,
	flattenPages,
	normalizeComment,
	normalizeCommentsPage,
	normalizeEvent,
	normalizeEventDetails,
	normalizeGuest,
	normalizeGuestsPage,
	normalizeHttpUrl,
	normalizeListData,
	normalizeLiveSession,
	normalizeNearbyData,
	normalizeResources,
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
			{
				name: "Agenda",
				url: "https://appscombo.s3.eu-north-1.amazonaws.com/media/events/docs/a.pdf",
			},
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
		expect(
			normalizeEventDetails(
				preview({ hosts: "nope", links: [{ link_name: "x", url: "https://x.io" }] }),
			)?.kind,
		).toBe("preview")
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
		expect(normalizeRsvpResult({ event: "e1", status: "going" })).toEqual({
			eventId: "e1",
			status: "going",
		})
		expect(normalizeRsvpResult({ event: "e1", status: "maybe" })).toBeNull()
		expect(normalizeRsvpResult(null)).toBeNull()
	})
})

/* ------------------------------------------------------------------ Pass 3 (P3-02) */

describe("normalizeResources", () => {
	const resources = (over: Record<string, unknown> = {}) => ({
		event: "Jos Tech Meetup",
		links: [{ link_name: "Agenda", url: "https://example.com/a", date_added: "01/11/2026" }],
		documents: [
			{
				doc_name: "Slides",
				doc_file: "events/docs/slides.pdf",
				size: "1.2 MB",
				file_type: "pdf",
				date_uploaded: "02/11/2026",
			},
		],
		...over,
	})

	it("keeps only the whitelisted link and document fields", () => {
		expect(normalizeResources(resources())).toEqual({
			links: [{ name: "Agenda", url: "https://example.com/a" }],
			documents: [
				{
					name: "Slides",
					url: "https://appscombo.s3.eu-north-1.amazonaws.com/media/events/docs/slides.pdf",
					size: "1.2 MB",
					fileType: "PDF",
					uploadedOn: "02/11/2026",
				},
			],
		})
	})

	it("never exposes date_added, and never reads data.event as an id", () => {
		const out = JSON.stringify(normalizeResources(resources()))
		expect(out).not.toContain("date_added")
		expect(out).not.toContain("01/11/2026")
		expect(out).not.toContain("Jos Tech Meetup")
	})

	it("treats empty arrays as an empty, readable result", () => {
		expect(normalizeResources(resources({ links: [], documents: [] }))).toEqual({
			links: [],
			documents: [],
		})
	})

	it("returns null (not empty) when the body is not the documented shape", () => {
		for (const bad of [
			null,
			undefined,
			"x",
			5,
			[],
			{},
			{ links: [] },
			{ documents: [] },
			{ links: {}, documents: [] },
		]) {
			expect(normalizeResources(bad)).toBeNull()
		}
	})

	it("drops links that are not http(s) and documents with no usable URL", () => {
		const out = normalizeResources(
			resources({
				links: [
					{ link_name: "x", url: "javascript:alert(1)" },
					{ link_name: "y", url: "data:text/html,hi" },
					{ link_name: "z", url: "ftp://example.com/f" },
					{ link_name: "", url: "https://ok.example.com/" },
					"junk",
					null,
				],
				documents: [
					{ doc_name: "no file", doc_file: "" },
					{ doc_name: "bad scheme", doc_file: "httpx://evil" },
					{ doc_name: "ok", doc_file: "https://cdn.example.com/f.txt" },
					42,
				],
			}),
		)
		expect(out?.links).toEqual([
			{ name: "https://ok.example.com/", url: "https://ok.example.com/" },
		])
		expect(out?.documents.map((d) => d.name)).toEqual(["ok"])
	})

	it("omits unusable document metadata instead of showing it", () => {
		const out = normalizeResources(
			resources({
				documents: [
					{
						doc_name: "d",
						doc_file: "https://cdn.example.com/f",
						size: "x".repeat(200),
						file_type: "<script>",
						date_uploaded: "yesterday",
					},
					{ doc_name: "e", doc_file: "https://cdn.example.com/g", size: null, file_type: null },
				],
			}),
		)
		for (const doc of out?.documents ?? []) {
			expect(doc.size).toBeNull()
			expect(doc.fileType).toBeNull()
			expect(doc.uploadedOn).toBeNull()
		}
	})

	it("does not carry unknown backend fields", () => {
		const out = normalizeResources(
			resources({
				documents: [
					{ doc_name: "d", doc_file: "https://cdn.example.com/f", secret: "s", uploaded_by: "u" },
				],
			}),
		)
		expect(Object.keys(out?.documents[0] ?? {}).sort()).toEqual(
			["fileType", "name", "size", "uploadedOn", "url"].sort(),
		)
	})
})

describe("normalizeComment", () => {
	const comment = (over: Record<string, unknown> = {}) => ({
		id: "c1",
		message: "See you there",
		created_at: "2026-11-01T10:00:00Z",
		user: {
			pkid: 9,
			id: "u-uuid",
			photo: "profiles/a.jpg",
			full_name: "Ada Obi",
			username: "ada",
			role: "host",
			joined_at: "2026-10-01T10:00:00Z",
		},
		...over,
	})

	it("keeps id, message, createdAt and the minimal author only (A-20)", () => {
		const out = normalizeComment(comment())
		expect(out).toEqual({
			id: "c1",
			message: "See you there",
			createdAt: "2026-11-01T10:00:00Z",
			author: {
				name: "Ada Obi",
				username: "ada",
				photo: "https://appscombo.s3.eu-north-1.amazonaws.com/media/profiles/a.jpg",
				role: "host",
			},
		})
		const json = JSON.stringify(out)
		for (const dropped of ["pkid", "u-uuid", "joined_at"]) expect(json).not.toContain(dropped)
	})

	it("keeps the message text as sent, including markup, without interpreting it", () => {
		expect(
			normalizeComment(comment({ message: "<img src=x onerror=alert(1)>\n  hi" }))?.message,
		).toBe("<img src=x onerror=alert(1)>\n  hi")
	})

	it("skips comments with no id or a blank / non-string message", () => {
		expect(normalizeComment(comment({ id: "" }))).toBeNull()
		expect(normalizeComment(comment({ id: 5 }))).toBeNull()
		expect(normalizeComment(comment({ message: "   " }))).toBeNull()
		expect(normalizeComment(comment({ message: null }))).toBeNull()
		expect(normalizeComment("x")).toBeNull()
	})

	it("degrades a missing author and an unparseable time instead of failing", () => {
		expect(normalizeComment(comment({ user: null }))?.author).toBeNull()
		expect(normalizeComment(comment({ user: { full_name: "", username: "" } }))?.author).toBeNull()
		expect(normalizeComment(comment({ created_at: "not a date" }))?.createdAt).toBeNull()
		expect(normalizeComment(comment({ created_at: undefined }))?.createdAt).toBeNull()
	})

	it("falls back to the username for the name and ignores an unknown role", () => {
		const author = normalizeComment(
			comment({ user: { full_name: "", username: "ada", role: "co_host" } }),
		)?.author
		expect(author).toMatchObject({ name: "ada", role: null })
	})
})

describe("normalizeCommentsPage", () => {
	it("reads results and takes hasNext from next only", () => {
		const page = normalizeCommentsPage(
			{ count: 99, total_pages: 9, next: "http://x/?page=3", results: [{ id: "a", message: "m" }] },
			2,
		)
		expect(page).toEqual({
			comments: [{ id: "a", message: "m", createdAt: null, author: null }],
			page: 2,
			hasNext: true,
		})
	})

	it("an empty page with a next link is not the end", () => {
		expect(normalizeCommentsPage({ next: "http://x/?page=2", results: [] }, 1)).toMatchObject({
			comments: [],
			hasNext: true,
		})
	})

	it("counts never decide hasNext, and a null next ends the list", () => {
		expect(
			normalizeCommentsPage({ count: 500, total_pages: 50, next: null, results: [] }, 1)?.hasNext,
		).toBe(false)
		expect(normalizeCommentsPage({ next: "", results: [] }, 1)?.hasNext).toBe(false)
	})

	it("drops unreadable rows but keeps the rest", () => {
		const page = normalizeCommentsPage(
			{ results: [null, { id: "" }, { id: "ok", message: "m" }] },
			1,
		)
		expect(page?.comments.map((c) => c.id)).toEqual(["ok"])
	})

	it("returns null for an unreadable body", () => {
		for (const bad of [null, undefined, "x", [], {}, { results: {} }, { results: "x" }]) {
			expect(normalizeCommentsPage(bad, 1)).toBeNull()
		}
	})
})

describe("normalizeGuest", () => {
	const guest = (over: Record<string, unknown> = {}) => ({
		user_id: 12,
		user_photo: "profiles/g.jpg",
		user_full_name: "Bola Ade",
		user_username: "bola",
		role: "guest",
		rsvp_status: "going",
		joined_at: "2026-10-30T09:00:00Z",
		email: "bola@example.com",
		phone_number: "+2348000000000",
		...over,
	})

	it("keeps only userId, name, username, photo and role (A-17)", () => {
		const out = normalizeGuest(guest())
		expect(out).toEqual({
			userId: 12,
			name: "Bola Ade",
			username: "bola",
			photo: "https://appscombo.s3.eu-north-1.amazonaws.com/media/profiles/g.jpg",
			role: "guest",
		})
		const json = JSON.stringify(out)
		for (const dropped of [
			"going",
			"rsvp",
			"joined_at",
			"2026-10-30",
			"bola@example.com",
			"+2348",
		]) {
			expect(json).not.toContain(dropped)
		}
	})

	it("recognises the host role and treats an unknown role as the less privileged guest", () => {
		expect(normalizeGuest(guest({ role: "host" }))?.role).toBe("host")
		expect(normalizeGuest(guest({ role: "co_host" }))?.role).toBe("guest")
		expect(normalizeGuest(guest({ role: undefined }))?.role).toBe("guest")
	})

	it("requires a positive integer user_id (what removal sends)", () => {
		for (const bad of [0, -1, 1.5, "12", null, undefined, Number.NaN]) {
			expect(normalizeGuest(guest({ user_id: bad }))).toBeNull()
		}
	})

	it("falls back to the username, and skips a row with no name at all", () => {
		expect(normalizeGuest(guest({ user_full_name: "" }))?.name).toBe("bola")
		expect(normalizeGuest(guest({ user_full_name: "", user_username: "" }))).toBeNull()
		expect(normalizeGuest("x")).toBeNull()
	})
})

describe("normalizeGuestsPage", () => {
	it("reads results and takes hasNext from next only", () => {
		const page = normalizeGuestsPage(
			{
				total_pages: 1,
				next: null,
				results: [{ user_id: 1, user_full_name: "A" }, { user_id: 0 }],
			},
			1,
		)
		expect(page).toEqual({
			guests: [{ userId: 1, name: "A", username: "", photo: null, role: "guest" }],
			page: 1,
			hasNext: false,
		})
	})

	it("an empty page with a next link is not the end", () => {
		expect(normalizeGuestsPage({ next: "http://x/?page=2", results: [] }, 1)?.hasNext).toBe(true)
	})

	it("returns null for an unreadable body and an empty array for an empty list", () => {
		expect(normalizeGuestsPage({}, 1)).toBeNull()
		expect(normalizeGuestsPage({ results: null }, 1)).toBeNull()
		expect(normalizeGuestsPage(null, 1)).toBeNull()
		expect(normalizeGuestsPage({ results: [] }, 1)).toEqual({ guests: [], page: 1, hasNext: false })
	})
})

describe("normalizeLiveSession (P4-01)", () => {
	const E = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
	const data = (over: Record<string, unknown> = {}, session: Record<string, unknown> = {}) => ({
		event_id: E,
		live_session: {
			id: 55,
			title: " Jazz night ",
			status: "live",
			session_type: "private",
			participant_count: 3,
			started_at: "2026-11-01T18:00:00Z",
			ended_at: null,
			is_joined: true,
			current_user_role: "listener",
			media: { provider: "livekit", status: "ready" },
			...session,
		},
		socket: { namespace: "/live", join_event: "live:join", join_payload: { sessionId: 55 } },
		...over,
	})

	it("reads the full documented shape", () => {
		expect(normalizeLiveSession(data())).toEqual({
			eventId: E,
			session: {
				id: 55,
				title: "Jazz night",
				status: "live",
				sessionType: "private",
				participantCount: 3,
				startedAt: "2026-11-01T18:00:00Z",
				endedAt: null,
				mediaProvider: "livekit",
				mediaStatus: "ready",
				currentUserRole: "listener",
				isJoined: true,
			},
			socket: { namespace: "/live", joinEvent: "live:join", sessionId: 55 },
		})
	})

	it("accepts every documented status, and rejects an unknown or missing one", () => {
		for (const status of ["waiting", "live", "ended", "cancelled"]) {
			expect(normalizeLiveSession(data({}, { status }))?.session.status).toBe(status)
		}
		expect(normalizeLiveSession(data({}, { status: "paused" }))).toBeNull()
		expect(normalizeLiveSession(data({}, { status: undefined }))).toBeNull()
	})

	it("is null (never an invented session) without an event id, a positive integer session id or a session", () => {
		expect(normalizeLiveSession(data({ event_id: "" }))).toBeNull()
		expect(normalizeLiveSession(data({}, { id: "55" }))).toBeNull()
		expect(normalizeLiveSession(data({}, { id: 0 }))).toBeNull()
		expect(normalizeLiveSession(data({}, { id: 5.5 }))).toBeNull()
		for (const bad of [null, undefined, [], "x", {}, { event_id: E }, data({ live_session: null })]) {
			expect(normalizeLiveSession(bad)).toBeNull()
		}
	})

	it("reads the provider and media status from the flat summary shape too", () => {
		const flat = data({}, { media: undefined, media_provider: "p2p", media_status: "legacy" })
		expect(normalizeLiveSession(flat)?.session).toMatchObject({
			mediaProvider: "p2p",
			mediaStatus: "legacy",
		})
	})

	it("turns unknown enum values and bad counts into null instead of guessing", () => {
		const out = normalizeLiveSession(
			data(
				{},
				{
					session_type: "secret",
					media: { provider: "zoom", status: "great" },
					current_user_role: "admin",
					participant_count: -1,
					is_joined: "yes",
				},
			),
		)
		expect(out?.session).toMatchObject({
			sessionType: null,
			mediaProvider: null,
			mediaStatus: null,
			currentUserRole: null,
			participantCount: null,
			isJoined: false,
		})
	})

	it("keeps a null or absent socket as null (a legacy event)", () => {
		expect(normalizeLiveSession(data({ socket: null }))?.socket).toBeNull()
		const { socket: _socket, ...noSocket } = data()
		void _socket
		expect(normalizeLiveSession(noSocket)?.socket).toBeNull()
	})

	it("trusts the socket descriptor only when it is exactly the documented one for this session", () => {
		const base = { namespace: "/live", join_event: "live:join", join_payload: { sessionId: 55 } }
		for (const bad of [
			{ ...base, namespace: "/chat" },
			{ ...base, join_event: "join" },
			{ ...base, join_payload: { sessionId: 56 } },
			{ ...base, join_payload: { sessionId: "55" } },
			{ ...base, join_payload: null },
			"/live",
			[],
		]) {
			expect(normalizeLiveSession(data({ socket: bad }))?.socket).toBeNull()
		}
	})

	it("never copies the host, participants, invite code, media room or tokens", () => {
		const out = normalizeLiveSession(
			data(
				{ socket: { namespace: "/live", join_event: "live:join", join_payload: { sessionId: 55 }, token: "T", server_url: "wss://x" } },
				{
					host: { username: "hosty" },
					participants: [{ user: { username: "other" } }],
					invite_code: "CODE",
					media: { provider: "p2p", status: "legacy", room: "ROOM", permissions: { room_admin: true } },
				},
			),
		)
		const text = JSON.stringify(out)
		for (const gone of ["hosty", "other", "CODE", "ROOM", "room_admin", "wss://x", '"T"']) {
			expect(text).not.toContain(gone)
		}
	})
})
