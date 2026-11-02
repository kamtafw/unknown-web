import { expect, it } from "vitest"
import { formatMessageTime } from "./message-time"
it("honors the selected timezone including daylight saving", () => {
	expect(formatMessageTime("2026-10-31T10:00:00Z", "Africa/Lagos")).toMatch(
		/11:00/,
	)
	expect(formatMessageTime("2026-01-10T10:00:00Z", "America/New_York")).toMatch(
		/0?5:00/,
	)
	expect(formatMessageTime("2026-07-10T10:00:00Z", "America/New_York")).toMatch(
		/0?6:00/,
	)
})
it("does not shift an API timestamp that already includes an offset", () => {
	expect(
		formatMessageTime("2026-10-31T11:00:00+01:00", "Africa/Lagos"),
	).toMatch(/11:00/)
})
it("handles invalid dates and unknown timezone preferences", () => {
	expect(formatMessageTime("bad", "Africa/Lagos")).toBe("")
	expect(formatMessageTime("2026-10-31T10:00:00Z", "Invalid/Zone")).not.toBe("")
})
