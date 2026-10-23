import { describe, expect, it } from "vitest"
import { MAX_EVENT_REQUEST_BYTES } from "./constants"
import {
	buildEventJsonBody,
	buildRsvpBody,
	checkMultipartRequest,
	isEventId,
	isEventLive,
	sanitizeDetailsPayload,
} from "./server"

const ID = "11111111-1111-4111-8111-111111111111"

const createBody = (over: Record<string, unknown> = {}) => ({
	name: " Jos Tech Meetup ",
	start_date: "2026-11-01",
	start_time: "18:00:00",
	end_date: "2026-11-01",
	end_time: "20:00:00",
	latitude: 9.92,
	longitude: 8.89,
	privacy: "public",
	is_locked: false,
	...over,
})

describe("isEventId", () => {
	it("accepts UUIDs only", () => {
		expect(isEventId(ID)).toBe(true)
		expect(isEventId("not-a-uuid")).toBe(false)
		expect(isEventId("../details")).toBe(false)
		expect(isEventId(5)).toBe(false)
	})
})

describe("buildRsvpBody", () => {
	it("accepts the three statuses for a valid event", () => {
		for (const status of ["going", "interested", "not_going"]) {
			expect(buildRsvpBody({ event_id: ID, status })).toEqual({ ok: true, value: { event_id: ID, status } })
		}
	})
	it("rejects other statuses and malformed ids, and drops extra keys", () => {
		expect(buildRsvpBody({ event_id: ID, status: "maybe" }).ok).toBe(false)
		expect(buildRsvpBody({ event_id: "x", status: "going" }).ok).toBe(false)
		expect(buildRsvpBody(null).ok).toBe(false)
		const r = buildRsvpBody({ event_id: ID, status: "going", user: 1 })
		expect(r.ok && Object.keys(r.value)).toEqual(["event_id", "status"])
	})
})

describe("buildEventJsonBody — create", () => {
	it("trims the name and forwards only allow-listed keys, never is_live", () => {
		const r = buildEventJsonBody(createBody({ is_live: true, evil: 1, id: "x" }), "create")
		expect(r.ok).toBe(true)
		if (!r.ok) return
		expect(r.value.name).toBe("Jos Tech Meetup")
		expect(r.value).not.toHaveProperty("is_live")
		expect(r.value).not.toHaveProperty("evil")
		expect(r.value).not.toHaveProperty("id")
	})
	it("requires the full schedule, a coordinate pair and a name", () => {
		expect(buildEventJsonBody(createBody({ start_time: undefined }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ latitude: undefined, longitude: undefined }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ longitude: undefined }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ name: "  " }), "create").ok).toBe(false)
	})
	it("rejects times without seconds, bad dates and an inverted schedule", () => {
		expect(buildEventJsonBody(createBody({ start_time: "18:00" }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ start_date: "2026-02-30" }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ end_date: "2026-10-31" }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ end_time: "17:00:00" }), "create").ok).toBe(false)
	})
	it("accepts zero coordinates and rejects out-of-range or non-finite ones", () => {
		expect(buildEventJsonBody(createBody({ latitude: 0, longitude: 0 }), "create").ok).toBe(true)
		expect(buildEventJsonBody(createBody({ latitude: 91 }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ longitude: Number.NaN }), "create").ok).toBe(false)
	})
	it("locks only with a four-digit string passcode and forces private", () => {
		const r = buildEventJsonBody(createBody({ is_locked: true, passcode: "0042", privacy: "public" }), "create")
		expect(r.ok && r.value).toMatchObject({ is_locked: true, privacy: "private", passcode: "0042" })
		expect(buildEventJsonBody(createBody({ is_locked: true }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ is_locked: true, passcode: 1234 }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ is_locked: true, passcode: "12" }), "create").ok).toBe(false)
	})
	it("never accepts a passcode for an unlocked event", () => {
		expect(buildEventJsonBody(createBody({ is_locked: false, passcode: "1234" }), "create").ok).toBe(false)
	})
	it("normalises tags, validates links and only allows an empty documents array", () => {
		const r = buildEventJsonBody(
			createBody({ hashtags: ["#Tech", "tech"], links: [{ link_name: " Site ", url: "https://a.io" }], documents: [] }),
			"create",
		)
		expect(r.ok && r.value).toMatchObject({
			hashtags: ["tech"],
			links: [{ link_name: "Site", url: "https://a.io" }],
			documents: [],
		})
		expect(buildEventJsonBody(createBody({ links: [{ link_name: "x", url: "javascript:alert(1)" }] }), "create").ok).toBe(false)
		expect(buildEventJsonBody(createBody({ documents: [{ doc_name: "x" }] }), "create").ok).toBe(false)
	})
	it("rejects non-object bodies", () => {
		for (const bad of [null, "x", 5, []]) expect(buildEventJsonBody(bad, "create").ok).toBe(false)
	})
})

describe("buildEventJsonBody — update", () => {
	it("allows a partial update and keeps omitted fields omitted", () => {
		expect(buildEventJsonBody({ name: "New" }, "update")).toEqual({ ok: true, value: { name: "New" } })
		expect(buildEventJsonBody({}, "update")).toEqual({ ok: true, value: {} })
	})
	it("requires the whole schedule or none of it, so a partial schedule cannot bypass the check", () => {
		expect(buildEventJsonBody({ end_time: "19:00:00" }, "update").ok).toBe(false)
		expect(
			buildEventJsonBody(
				{ start_date: "2026-11-01", start_time: "18:00:00", end_date: "2026-11-01", end_time: "19:00:00" },
				"update",
			).ok,
		).toBe(true)
	})
	it("requires latitude and longitude together", () => {
		expect(buildEventJsonBody({ latitude: 1 }, "update").ok).toBe(false)
		expect(buildEventJsonBody({ latitude: 1, longitude: 2 }, "update").ok).toBe(true)
	})
	it("allows clearing collections with [] and unlocking with explicit privacy", () => {
		expect(buildEventJsonBody({ hashtags: [], links: [], documents: [] }, "update")).toEqual({
			ok: true,
			value: { hashtags: [], links: [], documents: [] },
		})
		expect(buildEventJsonBody({ is_locked: false, privacy: "friends" }, "update")).toEqual({
			ok: true,
			value: { is_locked: false, privacy: "friends" },
		})
	})
})

describe("checkMultipartRequest", () => {
	const h = (init: Record<string, string>) => new Headers(init)
	const ct = "multipart/form-data; boundary=----x"
	it("accepts multipart within the cap, with or without a declared length", () => {
		expect(checkMultipartRequest(h({ "content-type": ct, "content-length": "1000" })).ok).toBe(true)
		expect(checkMultipartRequest(h({ "content-type": ct })).ok).toBe(true)
	})
	it("rejects other content types and a missing boundary", () => {
		expect(checkMultipartRequest(h({ "content-type": "application/json" })).ok).toBe(false)
		expect(checkMultipartRequest(h({ "content-type": "multipart/form-data" })).ok).toBe(false)
	})
	it("rejects a declared length over the cap with 413, and a bad length with 400", () => {
		const big = checkMultipartRequest(h({ "content-type": ct, "content-length": String(MAX_EVENT_REQUEST_BYTES + 1) }))
		expect(big).toMatchObject({ ok: false, status: 413, code: "upload_too_large" })
		expect(checkMultipartRequest(h({ "content-type": ct, "content-length": "abc" }))).toMatchObject({ ok: false, status: 400 })
	})
})

describe("sanitizeDetailsPayload / isEventLive", () => {
	const payload = {
		success: true,
		data: {
			id: ID,
			guests: [{ user_id: 9 }],
			hosts: [{ id: "h", first_name: "Ada", email: "ada@example.com", phone_number: "+234", username: "ada" }],
		},
	}
	it("removes guests and host contact data but keeps the rest", () => {
		const out = sanitizeDetailsPayload(payload) as typeof payload
		expect(out.data).not.toHaveProperty("guests")
		expect(out.data.hosts[0]).toEqual({ id: "h", first_name: "Ada", username: "ada" })
		expect(JSON.stringify(out)).not.toMatch(/ada@example|\+234/)
	})
	it("leaves a preview (no hosts) and non-objects alone", () => {
		const preview = { success: true, data: { id: ID, name: "x" } }
		expect(sanitizeDetailsPayload(preview)).toEqual(preview)
		expect(sanitizeDetailsPayload(null)).toBeNull()
	})
	it("treats is_live or a live session as live", () => {
		expect(isEventLive({ is_live: true })).toBe(true)
		expect(isEventLive({ is_live: false, live_session: { status: "live" } })).toBe(true)
		expect(isEventLive({ is_live: false, live_session: { status: "waiting" } })).toBe(false)
		expect(isEventLive({ is_live: false, live_session: null })).toBe(false)
		expect(isEventLive(null)).toBe(false)
	})
})
