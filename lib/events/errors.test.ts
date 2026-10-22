import { describe, expect, it } from "vitest"
import { describeEventError } from "./errors"

const err = (status: number, data?: unknown) => ({ response: { status, data } })

describe("describeEventError", () => {
	it("reports a request that never got a response as a network error", () => {
		const e = describeEventError({ code: "ERR_NETWORK" })
		expect(e.kind).toBe("network")
		expect(e.status).toBeNull()
	})

	it("maps backend field errors to the form's keys", () => {
		const e = describeEventError(
			err(400, {
				message: "Request failed.",
				code: "request_error",
				errors: {
					start_date: { message: "Start date cannot be after end date.", code: "invalid" },
					cover_image: { message: "Only JPEG or PNG.", code: "invalid" },
					latitude: { message: "Required.", code: "required" },
					passcode: { message: "Passcode must be 4 digits.", code: "invalid" },
				},
			}),
		)
		expect(e.kind).toBe("validation")
		expect(e.fieldErrors).toEqual({
			startDate: "Start date cannot be after end date.",
			cover: "Only JPEG or PNG.",
			coordinates: "Required.",
			passcode: "Passcode must be 4 digits.",
		})
		// the placeholder message is never shown; the first field error stands in
		expect(e.message).toBe("Start date cannot be after end date.")
	})

	it("prefers a non-field error as the message", () => {
		const e = describeEventError(
			err(400, { message: "Request failed.", errors: { non_field_errors: { message: "Start time cannot be after end time." } } }),
		)
		expect(e.message).toBe("Start time cannot be after end time.")
		expect(e.fieldErrors).toEqual({})
	})

	it("keeps a 403 as a permission problem and never as an expired login", () => {
		const e = describeEventError(
			err(403, { message: "Only an event host can perform this action.", code: "authentication_error" }),
		)
		expect(e.kind).toBe("forbidden")
		expect(e.message).toBe("Only an event host can perform this action.")
	})

	it("treats 401 as an expired session", () => {
		expect(describeEventError(err(401, {})).kind).toBe("unauthorized")
	})

	it("treats 404 as an unavailable event", () => {
		expect(describeEventError(err(404, {})).kind).toBe("not_found")
	})

	it("recognises the BFF's live-event refusal", () => {
		const e = describeEventError(err(409, { code: "event_live", message: "This event is live. End the live session before deleting it." }))
		expect(e.kind).toBe("live")
		expect(e.message).toContain("live")
	})

	it("recognises an oversized upload from the BFF, the platform or a body-less 413", () => {
		expect(describeEventError(err(413, { code: "upload_too_large" })).kind).toBe("too_large")
		expect(describeEventError(err(413, "<html>Payload Too Large</html>")).kind).toBe("too_large")
		expect(describeEventError(err(400, { code: "upload_too_large" })).kind).toBe("too_large")
	})

	it("reports server failures without leaking details", () => {
		const e = describeEventError(err(500, { message: "Traceback ..." }))
		expect(e.kind).toBe("server")
		expect(e.message).not.toContain("Traceback")
	})

	it("survives a non-JSON error body", () => {
		const e = describeEventError(err(400, "<html>Bad request</html>"))
		expect(e.kind).toBe("validation")
		expect(e.message).toBe("Please check the form and try again.")
	})
})
