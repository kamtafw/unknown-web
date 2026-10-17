import { describe, expect, it } from "vitest"
import { formatDistance, formatEventSchedule } from "./format"

const now = new Date(2026, 9, 16)

describe("formatEventSchedule", () => {
	it("formats a same-day event with a time range", () => {
		expect(
			formatEventSchedule(
				{ startDate: "2026-11-01", endDate: "2026-11-01", startTime: "18:00", endTime: "20:00" },
				now,
			),
		).toBe("Sun, 1 Nov · 18:00 – 20:00")
	})
	it("formats a multi-day event", () => {
		expect(
			formatEventSchedule(
				{ startDate: "2026-11-01", endDate: "2026-11-03", startTime: "09:00", endTime: "17:00" },
				now,
			),
		).toBe("Sun, 1 Nov, 09:00 – Tue, 3 Nov, 17:00")
	})
	it("adds the year when it differs from the current year", () => {
		expect(
			formatEventSchedule(
				{ startDate: "2027-01-02", endDate: "2027-01-02", startTime: "10:00", endTime: "" },
				now,
			),
		).toBe("Sat, 2 Jan 2027 · 10:00")
	})
	it("does not shift the date through the browser timezone", () => {
		expect(
			formatEventSchedule(
				{ startDate: "2026-12-31", endDate: "2026-12-31", startTime: "", endTime: "" },
				now,
			),
		).toBe("Thu, 31 Dec")
	})
	it("returns an empty string for an invalid date", () => {
		expect(
			formatEventSchedule({ startDate: "bad", endDate: "", startTime: "", endTime: "" }, now),
		).toBe("")
	})
})

describe("formatDistance", () => {
	it("formats metres and kilometres", () => {
		expect(formatDistance(0.45)).toBe("450 m away")
		expect(formatDistance(0)).toBe("1 m away")
		expect(formatDistance(2.34)).toBe("2.3 km away")
		expect(formatDistance(24.6)).toBe("25 km away")
	})
	it("returns an empty string without a distance", () => {
		expect(formatDistance(null)).toBe("")
	})
})
