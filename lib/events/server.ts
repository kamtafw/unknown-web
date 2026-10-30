/**
 * Pure request builders for the `app/api/events/*` route handlers. No Next
 * imports, so they are unit-testable and cannot touch cookies.
 *
 * These are the guardrails for product rules the backend does NOT enforce:
 *  - nearby discovery always carries `radius_km=25`; a client value is ignored;
 *  - My Events always carries `filter=my_events` (omitting it returns ALL events),
 *    for both `list` and `search`;
 *  - there is deliberately no builder for an unfiltered list/search.
 */

import {
	DEFAULT_PAGE_SIZE,
	EVENTS_PAGE_SIZE,
	MAX_EVENT_REQUEST_BYTES,
	MAX_HASHTAGS,
	MAX_LINKS,
	MAX_PAGE_SIZE,
	MAX_SEARCH_LENGTH,
	MY_EVENTS_FILTER,
	NEARBY_RADIUS_KM,
} from "./constants"
import { formatCoordinateParam, isValidCoordinates, parseCoordinateParam } from "./location"
import { normalizeHttpUrl } from "./normalize"
import {
	isValidDateString,
	isValidPasscode,
	isValidTimeString,
	normalizeCommentMessage,
	normalizeHashtags,
	validateSchedule,
} from "./validation"

export type Built<T> = { ok: true; value: T } | { ok: false; message: string; code: string }

function positiveInt(raw: string | null): number | null {
	if (raw === null || raw.trim() === "") return null
	const n = Number(raw)
	return Number.isInteger(n) && n >= 1 ? n : null
}

/** invalid → page 1 / default size; limit above the backend maximum is clamped */
export function parsePageParams(params: URLSearchParams): { page: number; limit: number } {
	const page = positiveInt(params.get("page")) ?? 1
	const requested = positiveInt(params.get("limit"))
	const limit = requested === null ? EVENTS_PAGE_SIZE : Math.min(requested, MAX_PAGE_SIZE)
	return { page, limit: limit || DEFAULT_PAGE_SIZE }
}

/**
 * Builds the upstream nearby query. Only latitude, longitude, radius_km, page and
 * limit are ever forwarded; any other client parameter (filter, q, privacy …) is dropped.
 */
export function buildNearbyQuery(params: URLSearchParams): Built<URLSearchParams> {
	const latitude = parseCoordinateParam(params.get("latitude"))
	const longitude = parseCoordinateParam(params.get("longitude"))
	if (latitude === null || longitude === null || !isValidCoordinates(latitude, longitude)) {
		return { ok: false, message: "Invalid coordinates", code: "invalid_coordinates" }
	}

	const { page, limit } = parsePageParams(params)
	const query = new URLSearchParams()
	query.set("latitude", formatCoordinateParam(latitude))
	query.set("longitude", formatCoordinateParam(longitude))
	query.set("radius_km", String(NEARBY_RADIUS_KM))
	query.set("page", String(page))
	query.set("limit", String(limit))
	return { ok: true, value: query }
}

export function buildMyEventsRequest(params: URLSearchParams): {
	path: "list" | "search"
	query: URLSearchParams
} {
	const q = (params.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH)
	const { page, limit } = parsePageParams(params)

	const query = new URLSearchParams()
	if (q) query.set("q", q)
	// forced; a client-supplied `filter` is never read
	query.set("filter", MY_EVENTS_FILTER)
	query.set("page", String(page))
	query.set("limit", String(limit))
	return { path: q ? "search" : "list", query }
}

/** body for `events/my-location`: always resolve the supplied point, never the stored account location */
export function buildAddressBody(
	body: unknown,
): Built<{ use_live_location: false; latitude: string; longitude: string }> {
	const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
	const { latitude, longitude } = record
	if (!isValidCoordinates(latitude, longitude)) {
		return { ok: false, message: "Invalid coordinates", code: "invalid_coordinates" }
	}
	return {
		ok: true,
		value: {
			use_live_location: false,
			latitude: formatCoordinateParam(latitude as number),
			longitude: formatCoordinateParam(longitude as number),
		},
	}
}

/* -------------------------------------------------------------------------------------------
 * Pass 2: details, create, update, delete, RSVP
 *
 * Same stance as above: the BFF re-validates and allow-lists whatever the browser sends, even
 * though the form already did, because these are the guardrails for product rules the backend
 * does not enforce. A passcode only ever travels in a request body, never in a URL.
 * ----------------------------------------------------------------------------------------- */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * A malformed UUID does not match the backend route and produces a framework 404 outside the
 * documented envelope, so ids are checked here and answered with the normal envelope instead.
 */
export function isEventId(value: unknown): value is string {
	return typeof value === "string" && UUID.test(value)
}

const RSVP_STATUSES = new Set(["going", "interested", "not_going"])

export function buildRsvpBody(
	body: unknown,
): Built<{ event_id: string; status: "going" | "interested" | "not_going" }> {
	const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
	if (!isEventId(record.event_id)) {
		return { ok: false, message: "Invalid event", code: "invalid_event" }
	}
	if (typeof record.status !== "string" || !RSVP_STATUSES.has(record.status)) {
		return { ok: false, message: "Invalid RSVP status", code: "invalid_rsvp_status" }
	}
	return {
		ok: true,
		value: {
			event_id: record.event_id,
			status: record.status as "going" | "interested" | "not_going",
		},
	}
}

/**
 * `POST comments`: only `message` is read and forwarded, trimmed; anything else the client sent is
 * dropped. Blank, whitespace-only or non-string is rejected here, before any upstream request.
 * No length limit is applied (EV-030).
 */
export function buildCommentBody(body: unknown): Built<{ message: string }> {
	const record =
		body && typeof body === "object" && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: {}
	const message = normalizeCommentMessage(record.message)
	if (message === null)
		return { ok: false, message: "A comment cannot be blank", code: "invalid_comment" }
	return { ok: true, value: { message } }
}

/**
 * `POST guests/remove`: the only field forwarded is `user_id`, a positive integer (the user's
 * numeric `pkid`). A string, fraction, zero, negative or missing value is rejected before any
 * upstream request.
 */
export function buildGuestRemoveBody(body: unknown): Built<{ user_id: number }> {
	const record =
		body && typeof body === "object" && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: {}
	const id = record.user_id
	if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
		return { ok: false, message: "A valid guest is required", code: "invalid_guest" }
	}
	return { ok: true, value: { user_id: id } }
}

const bad = (
	message: string,
	code = "invalid_event",
): { ok: false; message: string; code: string } => ({
	ok: false,
	message,
	code,
})

function apiTimeToClock(value: unknown): string | null {
	if (typeof value !== "string") return null
	const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(value)
	if (!match) return null
	const clock = `${match[1]}:${match[2]}`
	return isValidTimeString(clock) && Number(match[3]) < 60 ? clock : null
}

/**
 * Allow-list for a JSON create/update body. Only these keys are ever forwarded; `is_live` and
 * anything else is dropped (live state belongs to the lifecycle endpoints). Rules:
 *  - times are `HH:MM:SS`; dates `YYYY-MM-DD`; create needs the whole schedule, update all or none;
 *  - coordinates are a pair; create needs them;
 *  - `passcode` must be a four-digit STRING and only with `is_locked: true`; locked forces `private`;
 *  - `documents` can only be `[]` here (clearing): files travel in multipart;
 *  - collections: omitted = keep, `[]` = clear, populated = replace (forwarded as sent).
 */
export function buildEventJsonBody(
	input: unknown,
	mode: "create" | "update",
): Built<Record<string, unknown>> {
	if (!input || typeof input !== "object" || Array.isArray(input))
		return bad("Invalid request body")
	const b = input as Record<string, unknown>
	const out: Record<string, unknown> = {}

	if (b.name !== undefined || mode === "create") {
		const name = typeof b.name === "string" ? b.name.trim() : ""
		if (!name || name.length > 255) return bad("Invalid event name", "invalid_name")
		out.name = name
	}

	const scheduleKeys = ["start_date", "start_time", "end_date", "end_time"] as const
	const present = scheduleKeys.filter((k) => b[k] !== undefined)
	if (present.length > 0 || mode === "create") {
		if (present.length !== 4) return bad("Send the full schedule", "invalid_schedule")
		const startTime = apiTimeToClock(b.start_time)
		const endTime = apiTimeToClock(b.end_time)
		if (
			typeof b.start_date !== "string" ||
			typeof b.end_date !== "string" ||
			!isValidDateString(b.start_date) ||
			!isValidDateString(b.end_date) ||
			!startTime ||
			!endTime
		) {
			return bad("Invalid schedule", "invalid_schedule")
		}
		const problems = validateSchedule({
			startDate: b.start_date,
			startTime,
			endDate: b.end_date,
			endTime,
		})
		if (Object.keys(problems).length > 0) return bad("Invalid schedule", "invalid_schedule")
		out.start_date = b.start_date
		out.start_time = b.start_time
		out.end_date = b.end_date
		out.end_time = b.end_time
	}

	const hasLat = b.latitude !== undefined
	const hasLng = b.longitude !== undefined
	if (hasLat !== hasLng) return bad("Send latitude and longitude together", "invalid_coordinates")
	if (hasLat) {
		const lat =
			typeof b.latitude === "number" ? b.latitude : parseCoordinateParam(String(b.latitude))
		const lng =
			typeof b.longitude === "number" ? b.longitude : parseCoordinateParam(String(b.longitude))
		if (!isValidCoordinates(lat, lng)) return bad("Invalid coordinates", "invalid_coordinates")
		out.latitude = lat
		out.longitude = lng
	} else if (mode === "create") {
		return bad("Invalid coordinates", "invalid_coordinates")
	}

	if (b.is_locked !== undefined && typeof b.is_locked !== "boolean") {
		return bad("Invalid lock setting", "invalid_lock")
	}
	if (b.privacy !== undefined && !["public", "private", "friends"].includes(String(b.privacy))) {
		return bad("Invalid privacy", "invalid_privacy")
	}
	if (b.privacy !== undefined) out.privacy = b.privacy
	if (b.is_locked !== undefined) out.is_locked = b.is_locked
	if (b.is_locked === true) out.privacy = "private"

	if (b.passcode !== undefined) {
		if (b.is_locked !== true || !isValidPasscode(b.passcode)) {
			return bad(
				"The passcode must be exactly 4 digits and is only used for locked events",
				"invalid_passcode",
			)
		}
		out.passcode = b.passcode
	}
	if (b.is_locked === true && mode === "create" && out.passcode === undefined) {
		return bad("A passcode is required for a locked event", "invalid_passcode")
	}

	if (b.hashtags !== undefined) {
		if (!Array.isArray(b.hashtags) || b.hashtags.some((t) => typeof t !== "string")) {
			return bad("Invalid tags", "invalid_hashtags")
		}
		const tags = normalizeHashtags(b.hashtags as string[])
		if (tags.length > MAX_HASHTAGS) return bad("Too many tags", "invalid_hashtags")
		out.hashtags = tags
	}

	if (b.links !== undefined) {
		if (!Array.isArray(b.links) || b.links.length > MAX_LINKS)
			return bad("Invalid links", "invalid_links")
		const links: { link_name: string; url: string }[] = []
		for (const item of b.links) {
			const r = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
			const name = typeof r.link_name === "string" ? r.link_name.trim() : ""
			const url = typeof r.url === "string" ? r.url.trim() : ""
			if (!name || name.length > 255 || !normalizeHttpUrl(url))
				return bad("Invalid links", "invalid_links")
			links.push({ link_name: name, url })
		}
		out.links = links
	}

	if (b.documents !== undefined) {
		if (!Array.isArray(b.documents) || b.documents.length !== 0) {
			return bad("Documents can only be uploaded as files", "invalid_documents")
		}
		out.documents = []
	}

	return { ok: true, value: out }
}

export type MultipartCheck =
	| { ok: true; contentType: string; contentLength: string | null }
	| { ok: false; status: 400 | 413; message: string; code: string }

/**
 * A streamed (not parsed) multipart request is accepted only with a multipart content type and,
 * when a length is declared, within the cap. A request with no declared length is still held to
 * the cap by `limitBodyStream` as it streams. Field-level rules cannot be applied to a stream, so
 * the form's builder and the backend are the guardrails for multipart bodies (EV-023).
 */
export function checkMultipartRequest(headers: Headers): MultipartCheck {
	const contentType = headers.get("content-type") ?? ""
	if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) {
		return { ok: false, status: 400, message: "Invalid upload", code: "invalid_upload" }
	}
	const declared = headers.get("content-length")
	if (declared !== null) {
		const n = Number(declared)
		if (!Number.isInteger(n) || n < 0) {
			return { ok: false, status: 400, message: "Invalid upload", code: "invalid_upload" }
		}
		if (n > MAX_EVENT_REQUEST_BYTES) {
			return {
				ok: false,
				status: 413,
				message: "The upload is too large",
				code: "upload_too_large",
			}
		}
	}
	return { ok: true, contentType, contentLength: declared }
}

/**
 * Keys the browser never needs from a details response: other people's contact data and the
 * guest list (Pass 3 reads guests from their own endpoint). Removing them here means they never
 * reach the browser at all, not just the app state (EV-001, applied to the details route).
 */
export function sanitizeDetailsPayload(json: unknown): unknown {
	if (!json || typeof json !== "object") return json
	const root = json as Record<string, unknown>
	const data = root.data
	if (!data || typeof data !== "object" || Array.isArray(data)) return json
	const { guests: _guests, ...rest } = data as Record<string, unknown>
	void _guests
	const hosts = Array.isArray(rest.hosts)
		? rest.hosts.map((h) => {
				if (!h || typeof h !== "object") return h
				const { email: _e, phone_number: _p, ...host } = h as Record<string, unknown>
				void _e
				void _p
				return host
			})
		: rest.hosts
	return { ...root, data: hosts === undefined ? rest : { ...rest, hosts } }
}

/** is the event, or its attached session, live? Used to refuse a delete (guide §4.7, §9) */
export function isEventLive(data: unknown): boolean {
	if (!data || typeof data !== "object") return false
	const d = data as Record<string, unknown>
	if (d.is_live === true) return true
	const session = d.live_session
	return (
		!!session &&
		typeof session === "object" &&
		(session as Record<string, unknown>).status === "live"
	)
}

/* -------------------------------------------------------------------------------------------
 * Pass 3 (P3-02a): minimise the read-side responses at the BFF
 *
 * Guests, comments and resources come back with more than the app uses: other people's RSVP and
 * join dates, comment-author identifiers, the event name, a per-link date that is really the
 * event's creation date. Like `sanitizeDetailsPayload`, these functions remove them HERE, so they
 * never reach the browser at all (A-17, A-18, A-20). They keep the backend's own key names, so the
 * normalisers in `normalize.ts` read the result unchanged.
 *
 * Each returns a NEW object (the input is never mutated) or `null` when the body is not the
 * documented shape (guide §4.12, §4.16, §4.17). The route turns `null` into a controlled 502
 * instead of forwarding something it cannot vouch for. Only successful bodies go through these;
 * upstream errors are passed along untouched.
 * ----------------------------------------------------------------------------------------- */

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** a new object holding only the listed keys that are present on `source` */
function pick(source: unknown, keys: readonly string[]): Record<string, unknown> {
	const out: Record<string, unknown> = {}
	if (!isPlainRecord(source)) return out
	for (const key of keys) if (key in source) out[key] = source[key]
	return out
}

const ENVELOPE_KEYS = ["success", "status_code", "message"] as const
const PAGINATION_KEYS = ["count", "total_pages", "limit", "current", "previous", "next"] as const

const GUEST_KEYS = ["user_id", "user_photo", "user_full_name", "user_username", "role"] as const
const COMMENT_KEYS = ["id", "message", "created_at"] as const
const COMMENT_AUTHOR_KEYS = ["photo", "full_name", "username", "role"] as const
const LINK_KEYS = ["link_name", "url"] as const
const DOCUMENT_KEYS = ["doc_name", "doc_file", "size", "file_type", "date_uploaded"] as const

function sanitizePaged(
	json: unknown,
	row: (item: Record<string, unknown>) => Record<string, unknown>,
): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data) || !Array.isArray(json.data.results))
		return null
	return {
		...pick(json, ENVELOPE_KEYS),
		data: {
			...pick(json.data, PAGINATION_KEYS),
			results: json.data.results.filter(isPlainRecord).map(row),
		},
	}
}

/** `GET guests`: keeps the guest's `user_id` (what removal needs), name, username, photo and role */
export function sanitizeGuestsPayload(json: unknown): unknown | null {
	return sanitizePaged(json, (item) => pick(item, GUEST_KEYS))
}

/** `GET comments`: keeps id, message, time and the author's photo, name, username and role */
export function sanitizeCommentsPayload(json: unknown): unknown | null {
	return sanitizePaged(json, (item) => {
		const row = pick(item, COMMENT_KEYS)
		if (isPlainRecord(item.user)) row.user = pick(item.user, COMMENT_AUTHOR_KEYS)
		return row
	})
}

/** `GET resources`: link name and address; document fields. Drops `data.event` and `date_added` */
export function sanitizeResourcesPayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data)) return null
	const { links, documents } = json.data
	if (!Array.isArray(links) || !Array.isArray(documents)) return null
	return {
		...pick(json, ENVELOPE_KEYS),
		data: {
			links: links.filter(isPlainRecord).map((l) => pick(l, LINK_KEYS)),
			documents: documents.filter(isPlainRecord).map((d) => pick(d, DOCUMENT_KEYS)),
		},
	}
}

/**
 * `POST comments` success: the documented 201 carries only `data.message` (no id, author or
 * time). Anything else is unreadable (null) and the route answers 502 instead of a false success.
 */
export function sanitizeCommentCreatePayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data) || typeof json.data.message !== "string")
		return null
	return { ...pick(json, ENVELOPE_KEYS), data: { message: json.data.message } }
}

/**
 * `POST guests/remove` success: a 200 with the standard envelope and an empty `data` (guide
 * §4.14). Anything that is not a successful envelope is unreadable (null) and the route answers
 * 502 instead of a false success.
 */
export function sanitizeGuestRemovePayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || json.success !== true) return null
	return { ...pick(json, ENVELOPE_KEYS), data: {} }
}

/* -------------------------------------------------------------------------------------------
 * Pass 4 (P4-01): the event-specific live-session read
 * ----------------------------------------------------------------------------------------- */

const LIVE_SESSION_KEYS = [
	"id",
	"title",
	"status",
	"session_type",
	"participant_count",
	"started_at",
	"ended_at",
	"current_user_role",
	"is_joined",
	"media_provider",
	"media_status",
] as const
const LIVE_MEDIA_KEYS = ["provider", "status"] as const

/**
 * `GET live-session` success (guide §4.18, §5.1). The full session also carries the live host, every
 * participant, the invite code, the media room name, webhook times, permissions, reactions and
 * scheduling data; none of that is needed for the status read, and other people's data must not
 * reach the browser, so it is removed HERE. Kept: the event id, the session's status-level fields,
 * the media provider and status, and the documented socket descriptor (`namespace`, `join_event`,
 * `join_payload.sessionId`). Returns a NEW object, or `null` when `data` has no `live_session`
 * object: the route answers 502 instead of forwarding a body it cannot vouch for.
 */
export function sanitizeLiveSessionPayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data)) return null
	const { data } = json
	if (!isPlainRecord(data.live_session)) return null

	const session = pick(data.live_session, LIVE_SESSION_KEYS)
	if (isPlainRecord(data.live_session.media)) {
		session.media = pick(data.live_session.media, LIVE_MEDIA_KEYS)
	}

	let socket: Record<string, unknown> | null = null
	if (isPlainRecord(data.socket)) {
		socket = pick(data.socket, ["namespace", "join_event"])
		if (isPlainRecord(data.socket.join_payload)) {
			socket.join_payload = pick(data.socket.join_payload, ["sessionId"])
		}
	}

	return {
		...pick(json, ENVELOPE_KEYS),
		data: { ...pick(data, ["event_id"]), live_session: session, socket },
	}
}


/* -------------------------------------------------------------------------- */
/* Pass 4 (P4-07A): minimise live participant responses                       */
/* -------------------------------------------------------------------------- */

const LIVE_PARTICIPANT_KEYS = [
	"id",
	"role",
	"is_active",
	"is_muted",
	"media_connected",
	"microphone_published",
	"camera_published",
	"joined_at",
] as const
const LIVE_PARTICIPANT_USER_KEYS = [
	"id",
	"pkid",
	"username",
	"first_name",
	"last_name",
	"profile_photo",
] as const

/**
 * GET /live/sessions/{id}/participants (guide §5.1, §5.3). Retain only the documented roster
 * fields and minimal user snapshot. In particular, email, phone, permissions, media credentials,
 * invite/scheduling data and arbitrary future fields never cross the BFF boundary.
 */
export function sanitizeLiveParticipantsPayload(json: unknown): unknown | null {
	if (
		!isPlainRecord(json) ||
		!isPlainRecord(json.data) ||
		!Array.isArray(json.data.results) ||
		!json.data.results.every((item) => isPlainRecord(item) && isPlainRecord(item.user))
	) return null
	return sanitizePaged(json, (item) => {
		const row = pick(item, LIVE_PARTICIPANT_KEYS)
		row.user = pick(item.user, LIVE_PARTICIPANT_USER_KEYS)
		return row
	})
}
