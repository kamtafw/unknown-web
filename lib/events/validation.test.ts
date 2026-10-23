import type { EventFormInitial } from "@/types/events/api"
import { describe, expect, it } from "vitest"
import { fakeFile, validValues } from "./__fixtures__/form"
import {
	DOCUMENT_MAX_BYTES,
	MAX_DOCUMENTS,
	MAX_TOTAL_UPLOAD_BYTES,
} from "./constants"
import {
	isValidDateString,
	isValidPasscode,
	isValidTimeString,
	normalizeHashtags,
	toApiTime,
	validateCoverFile,
	validateDocumentFile,
	validateEventForm,
	validateSchedule,
} from "./validation"

const initial: EventFormInitial = {
	name: "Jos Tech Meetup",
	startDate: "2026-11-01",
	startTime: "18:00",
	endDate: "2026-11-01",
	endTime: "20:00",
	privacy: "public",
	isLocked: false,
	hashtags: [],
	links: [],
}

describe("passcode", () => {
	it("accepts exactly four ASCII digits, as a string, keeping leading zeros", () => {
		expect(isValidPasscode("0042")).toBe(true)
		expect(isValidPasscode("1234")).toBe(true)
	})
	it("rejects numbers, wrong lengths, non-ASCII digits and padding", () => {
		for (const bad of [42, 1234, "123", "12345", "12a4", " 123", "١٢٣٤", "", null, undefined]) {
			expect(isValidPasscode(bad)).toBe(false)
		}
	})
})

describe("dates and times", () => {
	it("validates real calendar dates", () => {
		expect(isValidDateString("2026-02-28")).toBe(true)
		expect(isValidDateString("2026-02-30")).toBe(false)
		expect(isValidDateString("26-02-28")).toBe(false)
	})
	it("validates HH:MM and converts to HH:MM:SS for the API", () => {
		expect(isValidTimeString("08:00")).toBe(true)
		expect(isValidTimeString("24:00")).toBe(false)
		expect(isValidTimeString("8:00")).toBe(false)
		expect(toApiTime("08:00")).toBe("08:00:00")
		expect(toApiTime("08:00:00")).toBe("08:00:00")
	})
})

describe("validateSchedule", () => {
	const ok = { startDate: "2026-11-01", startTime: "18:00", endDate: "2026-11-01", endTime: "20:00" }
	it("accepts a valid schedule, including equal start and end", () => {
		expect(validateSchedule(ok)).toEqual({})
		expect(validateSchedule({ ...ok, endTime: "18:00" })).toEqual({})
	})
	it("requires every field", () => {
		const errors = validateSchedule({ startDate: "", startTime: "", endDate: "", endTime: "" })
		expect(Object.keys(errors).sort()).toEqual(["endDate", "endTime", "startDate", "startTime"])
	})
	it("rejects an end date before the start date", () => {
		expect(validateSchedule({ ...ok, endDate: "2026-10-31" }).endDate).toBeTruthy()
	})
	it("rejects an earlier end time on the same day", () => {
		expect(validateSchedule({ ...ok, endTime: "17:00" }).endTime).toMatch(/can't be before/)
	})
	it("rejects an earlier end clock time even when the end date is later (backend rule)", () => {
		const errors = validateSchedule({ ...ok, endDate: "2026-11-02", endTime: "02:00" })
		expect(errors.endTime).toMatch(/Overnight/)
	})
	it("accepts a multi-day event whose end time is not earlier", () => {
		expect(validateSchedule({ ...ok, endDate: "2026-11-02", endTime: "20:00" })).toEqual({})
	})
})

describe("hashtags", () => {
	it("trims, strips #, lowercases, drops empties and duplicates, like the backend", () => {
		expect(normalizeHashtags([" #Tech ", "tech", "", "#", "JOS"])).toEqual(["tech", "jos"])
	})
})

describe("files", () => {
	it("accepts JPEG/PNG covers up to 2 MiB only", () => {
		expect(validateCoverFile(fakeFile("a.png", "image/png", 2_097_152))).toBeNull()
		expect(validateCoverFile(fakeFile("a.png", "image/png", 2_097_153))).toMatch(/2 MB/)
		expect(validateCoverFile(fakeFile("a.gif", "image/gif", 10))).toMatch(/JPEG or PNG/)
	})
	it("decides documents by MIME type and size, not by extension", () => {
		expect(validateDocumentFile(fakeFile("a.pdf", "application/pdf", DOCUMENT_MAX_BYTES))).toBeNull()
		expect(validateDocumentFile(fakeFile("a.pdf", "application/pdf", DOCUMENT_MAX_BYTES + 1))).toMatch(/10 MB/)
		expect(validateDocumentFile(fakeFile("a.pdf", "application/x-msdownload", 10))).toMatch(/supported/)
		expect(validateDocumentFile(fakeFile("a.exe", "application/pdf", 10))).toBeNull()
	})
})

describe("validateEventForm", () => {
	const create = { mode: "create" as const }
	it("accepts a complete valid form", () => {
		expect(validateEventForm(validValues(), create)).toEqual({})
	})
	it("requires a name and caps it at 255", () => {
		expect(validateEventForm(validValues({ name: "   " }), create).name).toBeTruthy()
		expect(validateEventForm(validValues({ name: "a".repeat(256) }), create).name).toBeTruthy()
		expect(validateEventForm(validValues({ name: "a".repeat(255) }), create)).toEqual({})
	})
	it("requires a location on create, but not on edit", () => {
		expect(validateEventForm(validValues({ coordinates: null }), create).coordinates).toBeTruthy()
		expect(validateEventForm(validValues({ coordinates: null }), { mode: "edit", initial })).toEqual({})
	})
	it("accepts zero coordinates", () => {
		expect(validateEventForm(validValues({ coordinates: { latitude: 0, longitude: 0 } }), create)).toEqual({})
	})
	it("requires a passcode when creating a locked event", () => {
		expect(validateEventForm(validValues({ isLocked: true }), create).passcode).toBeTruthy()
		expect(validateEventForm(validValues({ isLocked: true, passcode: "0042" }), create)).toEqual({})
		expect(validateEventForm(validValues({ isLocked: true, passcode: "42" }), create).passcode).toBeTruthy()
	})
	it("requires a new passcode when locking an unlocked event, but not when it is already locked", () => {
		const lock = validValues({ isLocked: true })
		expect(validateEventForm(lock, { mode: "edit", initial }).passcode).toBeTruthy()
		expect(validateEventForm(lock, { mode: "edit", initial: { ...initial, isLocked: true } })).toEqual({})
		const bad = validValues({ isLocked: true, passcode: "12" })
		expect(validateEventForm(bad, { mode: "edit", initial: { ...initial, isLocked: true } }).passcode).toBeTruthy()
	})
	it("ignores the passcode entirely when the event is not locked", () => {
		expect(validateEventForm(validValues({ passcode: "xx" }), create)).toEqual({})
	})
	it("ignores blank link rows but flags half-filled and non-http ones", () => {
		const links = [
			{ name: "", url: "" },
			{ name: "Site", url: "" },
			{ name: "", url: "https://a.io" },
			{ name: "Bad", url: "javascript:alert(1)" },
			{ name: "Good", url: "https://ok.io" },
		]
		const errors = validateEventForm(validValues({ links }), create)
		expect(errors["links.0.name"]).toBeUndefined()
		expect(errors["links.1.url"]).toBeTruthy()
		expect(errors["links.2.name"]).toBeTruthy()
		expect(errors["links.3.url"]).toBeTruthy()
		expect(errors["links.4.url"]).toBeUndefined()
	})
	it("caps documents by count and combined size", () => {
		const pdf = (n: number, size = 1000) => ({ name: `d${n}`, file: fakeFile(`d${n}.pdf`, "application/pdf", size) })
		const many = Array.from({ length: MAX_DOCUMENTS + 1 }, (_, i) => pdf(i))
		expect(validateEventForm(validValues({ documents: { mode: "replace", items: many } }), create).documents).toBeTruthy()

		const big = [pdf(1, DOCUMENT_MAX_BYTES), pdf(2, DOCUMENT_MAX_BYTES), pdf(3, DOCUMENT_MAX_BYTES), pdf(4, DOCUMENT_MAX_BYTES)]
		expect(big.reduce((n, d) => n + d.file.size, 0)).toBeGreaterThan(MAX_TOTAL_UPLOAD_BYTES)
		expect(validateEventForm(validValues({ documents: { mode: "replace", items: big } }), create).upload).toBeTruthy()
	})
	it("flags each bad document row", () => {
		const items = [{ name: "", file: fakeFile("a.pdf", "application/pdf", 10) }, { name: "x", file: fakeFile("a.exe", "application/x-msdownload", 10) }]
		const errors = validateEventForm(validValues({ documents: { mode: "replace", items } }), create)
		expect(errors["documents.0.name"]).toBeTruthy()
		expect(errors["documents.1.file"]).toBeTruthy()
	})
})
