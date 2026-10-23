import type { EventFormInitial } from "@/types/events/api"
import { describe, expect, it } from "vitest"
import { buildCreateSubmission, buildUpdateSubmission } from "./request"
import { fakeFile, validValues } from "./__fixtures__/form"

const entries = (body: FormData) =>
	[...body.entries()].map(([k, v]) => [k, typeof v === "string" ? v : `file:${(v as File).name}`])

const initial: EventFormInitial = {
	name: "Jos Tech Meetup",
	startDate: "2026-11-01",
	startTime: "18:00",
	endDate: "2026-11-01",
	endTime: "20:00",
	privacy: "public",
	isLocked: false,
	hashtags: ["tech"],
	links: [{ name: "Site", url: "https://a.io" }],
}
const same = () =>
	validValues({ hashtags: ["tech"], links: [{ name: "Site", url: "https://a.io" }], coordinates: null })

const ok = <T,>(r: { ok: boolean; value?: T; errors?: unknown }) => {
	if (!r.ok) throw new Error(`expected ok, got ${JSON.stringify(r.errors)}`)
	return r.value as T
}

describe("buildCreateSubmission", () => {
	it("sends JSON with seconds in times, numeric coordinates and no is_live", () => {
		const sub = ok(buildCreateSubmission(validValues({ hashtags: ["#Tech", "tech"] })))
		expect(sub.kind).toBe("json")
		if (sub.kind !== "json") return
		expect(sub.body).toEqual({
			name: "Jos Tech Meetup",
			start_date: "2026-11-01",
			start_time: "18:00:00",
			end_date: "2026-11-01",
			end_time: "20:00:00",
			latitude: 9.92,
			longitude: 8.89,
			privacy: "public",
			is_locked: false,
			hashtags: ["tech"],
		})
		expect(sub.body).not.toHaveProperty("is_live")
	})

	it("keeps zero coordinates", () => {
		const sub = ok(buildCreateSubmission(validValues({ coordinates: { latitude: 0, longitude: 0 } })))
		if (sub.kind === "json") expect([sub.body.latitude, sub.body.longitude]).toEqual([0, 0])
	})

	it("forces privacy private when locked and sends the passcode as a string with its leading zero", () => {
		const sub = ok(buildCreateSubmission(validValues({ isLocked: true, passcode: "0042", privacy: "public" })))
		if (sub.kind !== "json") throw new Error("json expected")
		expect(sub.body.privacy).toBe("private")
		expect(sub.body.is_locked).toBe(true)
		expect(sub.body.passcode).toBe("0042")
		expect(typeof sub.body.passcode).toBe("string")
	})

	it("never sends a passcode for an unlocked event, even if one was typed", () => {
		const sub = ok(buildCreateSubmission(validValues({ passcode: "1234" })))
		if (sub.kind === "json") expect(sub.body).not.toHaveProperty("passcode")
	})

	it("drops blank link rows and sends link_name/url", () => {
		const sub = ok(buildCreateSubmission(validValues({ links: [{ name: "", url: "" }, { name: " Site ", url: " https://a.io " }] })))
		if (sub.kind === "json") expect(sub.body.links).toEqual([{ link_name: "Site", url: "https://a.io" }])
	})

	it("switches to multipart with contiguous indexed fields when files are attached", () => {
		const sub = ok(
			buildCreateSubmission(
				validValues({
					isLocked: true,
					passcode: "0042",
					hashtags: ["a", "b"],
					links: [{ name: "Site", url: "https://a.io" }],
					cover: fakeFile("c.png", "image/png", 100),
					documents: {
						mode: "replace",
						items: [
							{ name: "Agenda", file: fakeFile("a.pdf", "application/pdf", 100) },
							{ name: "Slides", file: fakeFile("s.pdf", "application/pdf", 100) },
						],
					},
				}),
			),
		)
		expect(sub.kind).toBe("multipart")
		if (sub.kind !== "multipart") return
		const e = entries(sub.body)
		const keys = e.map(([k]) => k)
		expect(keys).toEqual(
			expect.arrayContaining([
				"name", "start_time", "latitude", "longitude", "is_locked", "passcode",
				"hashtags[0]", "hashtags[1]", "links[0].link_name", "links[0].url",
				"documents[0].doc_name", "documents[0].doc_file", "documents[1].doc_name", "documents[1].doc_file", "cover_image",
			]),
		)
		expect(keys).not.toContain("documents")
		expect(Object.fromEntries(e)).toMatchObject({ is_locked: "true", passcode: "0042", start_time: "18:00:00", latitude: "9.920000" })
	})

	it("returns the field errors instead of a request when invalid", () => {
		const r = buildCreateSubmission(validValues({ name: "", coordinates: null }))
		expect(r.ok).toBe(false)
		if (!r.ok) expect(Object.keys(r.errors)).toEqual(expect.arrayContaining(["name", "coordinates"]))
	})
})

describe("buildUpdateSubmission", () => {
	it("returns null when nothing changed", () => {
		expect(ok(buildUpdateSubmission(initial, same()))).toBeNull()
	})

	it("sends only the changed field", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), name: "New name" }))
		expect(sub).toEqual({ kind: "json", body: { name: "New name" } })
	})

	it("sends the whole schedule, with seconds, when any part of it changed", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), endTime: "21:00" }))
		expect(sub).toEqual({
			kind: "json",
			body: { start_date: "2026-11-01", start_time: "18:00:00", end_date: "2026-11-01", end_time: "21:00:00" },
		})
	})

	it("omits collections that did not change (omitted = keep)", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), name: "x" }))
		if (sub?.kind === "json") expect(Object.keys(sub.body)).toEqual(["name"])
	})

	it("sends an empty array to clear links/hashtags and the full list to replace them", () => {
		const cleared = ok(buildUpdateSubmission(initial, { ...same(), hashtags: [], links: [] }))
		expect(cleared).toEqual({ kind: "json", body: { hashtags: [], links: [] } })
		const replaced = ok(buildUpdateSubmission(initial, { ...same(), hashtags: ["tech", "new"] }))
		expect(replaced).toEqual({ kind: "json", body: { hashtags: ["tech", "new"] } })
	})

	it("clears documents with [] and never re-sends existing document URLs", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), documents: { mode: "clear" } }))
		expect(sub).toEqual({ kind: "json", body: { documents: [] } })
	})

	it("treats replacing documents with nothing as a clear", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), documents: { mode: "replace", items: [] } }))
		expect(sub).toEqual({ kind: "json", body: { documents: [] } })
	})

	it("uses a JSON '[]' string to clear a list inside a multipart update", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), links: [], cover: fakeFile("c.jpg", "image/jpeg", 10) }))
		if (sub?.kind !== "multipart") throw new Error("multipart expected")
		expect(entries(sub.body)).toEqual([["links", "[]"], ["cover_image", "file:c.jpg"]])
	})

	it("sends is_locked and privacy together, and a passcode only when entered", () => {
		const lock = ok(buildUpdateSubmission(initial, { ...same(), isLocked: true, passcode: "0042" }))
		expect(lock).toEqual({ kind: "json", body: { is_locked: true, privacy: "private", passcode: "0042" } })

		// already locked, new passcode omitted: keep the existing code
		const locked = { ...initial, isLocked: true, privacy: "private" as const }
		expect(ok(buildUpdateSubmission(locked, { ...same(), isLocked: true, privacy: "private" }))).toBeNull()

		// unlocking sends privacy explicitly and never a passcode
		const unlock = ok(buildUpdateSubmission(locked, { ...same(), isLocked: false, privacy: "friends", passcode: "9999" }))
		expect(unlock).toEqual({ kind: "json", body: { is_locked: false, privacy: "friends" } })
	})

	it("sends the coordinate pair only after an explicit location change", () => {
		const sub = ok(buildUpdateSubmission(initial, { ...same(), coordinates: { latitude: 1.5, longitude: 2.5 } }))
		expect(sub).toEqual({ kind: "json", body: { latitude: 1.5, longitude: 2.5 } })
		expect(ok(buildUpdateSubmission(initial, same()))).toBeNull()
	})

	it("rejects an invalid edit before building anything", () => {
		const r = buildUpdateSubmission(initial, { ...same(), endDate: "2026-10-01" })
		expect(r.ok).toBe(false)
	})
})
