import { describe, expect, it } from "vitest"
import {
	EventPayloadError,
	normalizeEventCommentsPage,
	normalizeEventGuestsPage,
	normalizeEventResources,
} from "./normalize"

const COMMENT_ID = "11111111-1111-4111-8111-111111111111"

describe("normalizeEventResources", () => {
	it("whitelists fields and drops unsafe links and documents without usable URLs", () => {
		const unsafeProtocol = "java" + "script:" + "alert(1)"
		const result = normalizeEventResources({
			event: "Event title, not an id",
			links: [
				{ link_name: "Docs", url: "https://example.com", date_added: "01/01/2026" },
				{ link_name: "Unsafe", url: unsafeProtocol },
			],
			documents: [
				{ doc_name: "Agenda", doc_file: "events/docs/agenda.pdf", size: "2 MB", file_type: "PDF", date_uploaded: "01/10/2026" },
				{ doc_name: "Missing URL", size: "1 MB" },
			],
		})
		expect(result.links).toEqual([{ name: "Docs", url: "https://example.com" }])
		expect(result.documents).toHaveLength(1)
		expect(result.documents[0]).toMatchObject({ name: "Agenda", size: "2 MB", fileType: "PDF", dateUploaded: "01/10/2026" })
		expect(JSON.stringify(result)).not.toContain("date_added")
		expect(JSON.stringify(result)).not.toContain("Event title")
	})
	it("accepts empty resource arrays", () => {
		expect(normalizeEventResources({ links: [], documents: [] })).toEqual({ links: [], documents: [] })
	})
	it("throws for an unreadable payload", () => {
		expect(() => normalizeEventResources(null)).toThrow(EventPayloadError)
		expect(() => normalizeEventResources({ links: [] })).toThrow(EventPayloadError)
	})
})

describe("normalizeEventCommentsPage", () => {
	it("keeps the D-11 projection and reads hasNext from next", () => {
		const page = normalizeEventCommentsPage({
			next: "/next",
			results: [{
				id: COMMENT_ID, message: "message text", created_at: "2026-10-24T10:00:00Z",
				user: { pkid: 5, id: "secret-id", photo: "users/a.jpg", full_name: "Ada Obi", username: "ada",
					role: "host", joined_at: "secret", email: "secret@example.com", phone_number: "+234000000000" },
			}],
		}, 2)
		expect(page).toMatchObject({
			page: 2, hasNext: true,
			comments: [{ id: COMMENT_ID, message: "message text", createdAt: "2026-10-24T10:00:00Z",
				author: { name: "Ada Obi", username: "ada", role: "host" } }],
		})
		expect(JSON.stringify(page)).not.toContain("secret")
		expect(JSON.stringify(page)).not.toContain("email")
		expect(JSON.stringify(page)).not.toContain("phone_number")
	})
	it("allows empty results and rejects malformed payloads", () => {
		expect(normalizeEventCommentsPage({ next: null, results: [] }, 1).comments).toEqual([])
		expect(() => normalizeEventCommentsPage({ results: "bad" }, 1)).toThrow(EventPayloadError)
		expect(() => normalizeEventCommentsPage({ results: [] }, 1)).toThrow(EventPayloadError)
	})
})

describe("normalizeEventGuestsPage", () => {
	it("keeps the D-8 projection and drops RSVP and joined time", () => {
		const page = normalizeEventGuestsPage({
			next: null,
			results: [{ user_id: 42, user_photo: "users/guest.jpg", user_full_name: "Sam Guest",
				user_username: "sam", role: "guest", rsvp_status: "going", joined_at: "secret" }],
		}, 1)
		expect(page.guests).toEqual([{ userId: 42, name: "Sam Guest", username: "sam", photo: expect.anything(), role: "guest" }])
		expect(JSON.stringify(page)).not.toContain("rsvp_status")
		expect(JSON.stringify(page)).not.toContain("joined_at")
		expect(JSON.stringify(page)).not.toContain("secret")
	})
	it("allows an empty page and rejects malformed payloads", () => {
		expect(normalizeEventGuestsPage({ next: null, results: [] }, 1).guests).toEqual([])
		expect(() => normalizeEventGuestsPage(null, 1)).toThrow(EventPayloadError)
	})
})
