import { describe, expect, it } from "vitest"
import { normalizeLiveParticipant, normalizeLiveParticipantsPage } from "./normalize"
import { sanitizeLiveParticipantsPayload } from "./server"

const participant = (over: Record<string, unknown> = {}) => ({
	id: 31,
	user: {
		id: "user-uuid-31",
		pkid: 31,
		username: "ada",
		first_name: "Ada",
		last_name: "Obi",
		profile_photo: "avatars/ada.jpg",
		email: "private@example.com",
		phone_number: "+2348000000000",
	},
	role: "speaker",
	is_active: true,
	is_muted: false,
	media_connected: true,
	microphone_published: true,
	camera_published: false,
	joined_at: "2026-10-30T09:00:00Z",
	permissions: { can_publish_microphone: true },
	token: "must-not-cross-bff",
	...over,
})

const page = (results: unknown[] = [participant()], next: unknown = null) => ({
	success: true,
	status_code: 200,
	message: "Participants retrieved successfully.",
	data: {
		count: 1,
		total_pages: 1,
		limit: 20,
		current: 1,
		previous: null,
		next,
		results,
	},
})

describe("sanitizeLiveParticipantsPayload", () => {
	it("retains only documented participant and user snapshot fields", () => {
		const result = sanitizeLiveParticipantsPayload(page()) as { data: { results: Record<string, unknown>[] } }
		expect(result.data.results[0]).toEqual({
			id: 31,
			role: "speaker",
			is_active: true,
			is_muted: false,
			media_connected: true,
			microphone_published: true,
			camera_published: false,
			joined_at: "2026-10-30T09:00:00Z",
			user: {
				id: "user-uuid-31",
				pkid: 31,
				username: "ada",
				first_name: "Ada",
				last_name: "Obi",
				profile_photo: "avatars/ada.jpg",
			},
		})
		const serialized = JSON.stringify(result)
		for (const secret of ["private@example.com", "+2348000000000", "permissions", "token", "must-not-cross-bff"]) {
			expect(serialized).not.toContain(secret)
		}
	})

	it("preserves pagination metadata and an empty page with a next link", () => {
		const result = sanitizeLiveParticipantsPayload(page([], "https://api.example/live/sessions/8/participants?page=2")) as {
			data: { next: string; results: unknown[] }
		}
		expect(result.data.next).toContain("page=2")
		expect(result.data.results).toEqual([])
	})

	it("does not mutate input and fails closed for malformed page or participant rows", () => {
		const input = page()
		const copy = structuredClone(input)
		sanitizeLiveParticipantsPayload(input)
		expect(input).toEqual(copy)
		for (const invalid of [
			null,
			{},
			{ data: { results: {} } },
			{ data: { results: ["bad"] } },
			{ data: { results: [{ ...participant(), user: null }] } },
		]) expect(sanitizeLiveParticipantsPayload(invalid)).toBeNull()
	})
})

describe("normalizeLiveParticipant", () => {
	it("maps the documented participant and user snapshot into a minimal view model", () => {
		expect(normalizeLiveParticipant(participant())).toEqual({
			id: 31,
			user: {
				userId: 31,
				userUuid: "user-uuid-31",
				name: "Ada Obi",
				username: "ada",
				photo: "https://appscombo.s3.eu-north-1.amazonaws.com/media/avatars/ada.jpg",
			},
			role: "speaker",
			isActive: true,
			isMuted: false,
			mediaConnected: true,
			microphonePublished: true,
			cameraPublished: false,
			joinedAt: "2026-10-30T09:00:00Z",
		})
	})

	it.each([
		["invalid participant id", { id: 0 }],
		["missing user snapshot", { user: null }],
		["invalid user pkid", { user: { pkid: 0 } }],
		["unknown role", { role: "administrator" }],
		["missing active flag", { is_active: undefined }],
		["invalid timestamp", { joined_at: "not-a-date" }],
	])("rejects %s", (_label, over) => {
		expect(normalizeLiveParticipant(participant(over))).toBeNull()
	})
})

describe("normalizeLiveParticipantsPage", () => {
	it("preserves oldest-first backend order and uses only next for hasNext", () => {
		const second = participant({ id: 32, user: { ...participant().user, id: "u32", pkid: 32, username: "bola" } })
		const result = normalizeLiveParticipantsPage(
			{ count: 99, total_pages: 8, next: "next", results: [participant(), second] },
			2,
		)
		expect(result?.participants.map((p) => p.id)).toEqual([31, 32])
		expect(result?.page).toBe(2)
		expect(result?.hasNext).toBe(true)
		expect(normalizeLiveParticipantsPage({ count: 99, next: null, results: [participant()] }, 1)?.hasNext).toBe(false)
	})

	it("treats malformed rows as an unreadable page, not an empty roster", () => {
		expect(normalizeLiveParticipantsPage({ results: [{ id: "bad" }] }, 1)).toBeNull()
		expect(normalizeLiveParticipantsPage({ results: "bad" }, 1)).toBeNull()
		expect(normalizeLiveParticipantsPage({ results: [] }, 1)).toEqual({ participants: [], page: 1, hasNext: false })
	})
})
