/**
 * Turns a failed Events request into something a form or pane can show. Pure: it reads the
 * shape axios gives (`error.response.{status,data}`) and the backend's documented error
 * envelope (`message`, `code`, `errors: { field: { message, code } }`, guide §2.2), plus the
 * envelopes the BFF raises itself.
 *
 * Distinctions the guide asks for are kept: a 403 is a permission problem, not an expired login
 * (401s are handled by the shared axios interceptor), 404 means the event is gone or hidden,
 * and a platform 413 may not carry a JSON envelope at all.
 */

import type { FormErrors } from "./validation"

export type EventErrorKind =
	| "validation"
	| "unauthorized"
	| "forbidden"
	| "not_found"
	| "live"
	| "too_large"
	| "network"
	| "server"
	| "unknown"

export interface EventRequestError {
	kind: EventErrorKind
	status: number | null
	code: string | null
	/** safe to show as-is */
	message: string
	/** keyed like the form (`name`, `startDate`, `coordinates`, …) */
	fieldErrors: FormErrors
}

/** backend field → form key */
const FIELD_MAP: Record<string, string> = {
	name: "name",
	start_date: "startDate",
	end_date: "endDate",
	start_time: "startTime",
	end_time: "endTime",
	privacy: "privacy",
	is_locked: "privacy",
	passcode: "passcode",
	hashtags: "hashtags",
	links: "links",
	documents: "documents",
	cover_image: "cover",
	latitude: "coordinates",
	longitude: "coordinates",
	event_id: "event",
	status: "status",
}

interface AxiosLike {
	response?: { status?: number; data?: unknown }
	code?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function fieldErrorsFrom(errors: unknown): { fields: FormErrors; nonField: string | null } {
	const fields: FormErrors = {}
	let nonField: string | null = null
	if (!isRecord(errors)) return { fields, nonField }
	for (const [key, value] of Object.entries(errors)) {
		const message =
			isRecord(value) && typeof value.message === "string"
				? value.message
				: typeof value === "string"
					? value
					: null
		if (!message) continue
		if (key === "non_field_errors") {
			nonField = message
			continue
		}
		const mapped = FIELD_MAP[key] ?? key
		if (!(mapped in fields)) fields[mapped] = message
	}
	return { fields, nonField }
}

export function describeEventError(error: unknown, fallback = "Something went wrong. Please try again."): EventRequestError {
	const err = (isRecord(error) ? error : {}) as AxiosLike
	const status = typeof err.response?.status === "number" ? err.response.status : null

	if (status === null) {
		return {
			kind: "network",
			status: null,
			code: null,
			message: "Network error. Check your connection and try again.",
			fieldErrors: {},
		}
	}

	const data = isRecord(err.response?.data) ? err.response.data : {}
	const code = typeof data.code === "string" ? data.code : null
	const { fields, nonField } = fieldErrorsFrom(data.errors)
	// "Request failed." is the backend's placeholder when only field errors exist
	const envelopeMessage =
		typeof data.message === "string" && data.message && data.message !== "Request failed."
			? data.message
			: null

	const make = (kind: EventErrorKind, message: string): EventRequestError => ({
		kind,
		status,
		code,
		message,
		fieldErrors: fields,
	})

	if (status === 413 || code === "upload_too_large" || code === "request_too_large") {
		return make("too_large", "These files are too large to upload. Remove or shrink some and try again.")
	}
	if (status === 401) return make("unauthorized", "Your session has expired. Sign in again.")
	if (status === 403) {
		return make("forbidden", envelopeMessage ?? "You don't have permission to do that.")
	}
	if (status === 404) return make("not_found", "This event isn't available. It may have been deleted.")
	if (status === 409 && code === "event_live") {
		return make("live", envelopeMessage ?? "This event is live. End the live session before deleting it.")
	}
	if (status === 400 || status === 415 || status === 409 || status === 422) {
		const first = Object.values(fields)[0]
		return make("validation", nonField ?? envelopeMessage ?? first ?? "Please check the form and try again.")
	}
	if (status >= 500) {
		return make("server", "AppsCombo is having trouble right now. Please try again shortly.")
	}
	return make("unknown", envelopeMessage ?? fallback)
}
