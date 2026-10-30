import { resolveMediaUrl } from "@/lib/server-config"
import type {
	EventCard,
	EventComment,
	EventCommentAuthor,
	EventCommentsPage,
	EventDetails,
	EventDocument,
	EventFullDetails,
	EventGuest,
	EventGuestRole,
	EventGuestsPage,
	EventHost,
	EventLink,
	EventLiveSession,
	EventLiveSessionState,
	EventLiveStatus,
	EventPreviewDetails,
	EventPrivacy,
	EventResourceDocument,
	EventResources,
	EventRsvpStatus,
	EventsPage,
	LiveMediaProvider,
	LiveMediaStatus,
	LiveParticipantRole,
	LiveParticipant,
	LiveParticipantsPage,
	LiveSessionType,
	LiveSocketDescriptor,
	RsvpKnowledge,
	RsvpResult,
} from "@/types/events/api"
import { isValidCoordinates } from "./location"

/**
 * Backend → app boundary. This is the ONLY place raw event objects are read,
 * and it copies a fixed whitelist of fields. Restricted-event data the backend
 * also returns (host email/phone, guests, links, documents) is never copied into an
 * event card, so it can never reach a cache, a component or a log. The Pass 3 readers at
 * the end of this file (resources, comments, guests) apply their own whitelists (A-17,
 * A-18, A-20); the BFF has already minimised those bodies (P3-02a).
 */

const PRIVACY = new Set<string>(["public", "private", "friends"])
const RSVP = new Set<string>(["going", "interested", "not_going"])

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
	return typeof value === "string" ? value.trim() : ""
}

/** accepts `HH:MM` and `HH:MM:SS`; returns `HH:MM` or "" */
export function normalizeTime(value: unknown): string {
	if (typeof value !== "string") return ""
	const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value.trim())
	return match ? `${match[1].padStart(2, "0")}:${match[2]}` : ""
}

function normalizeHost(raw: unknown): EventHost | null {
	if (!isRecord(raw)) return null
	const id = text(raw.id)
	const username = text(raw.username)
	if (!id && !username) return null
	const name = [text(raw.first_name), text(raw.last_name)].filter(Boolean).join(" ")
	return {
		id,
		name: name || username,
		username,
		photo: resolveMediaUrl(text(raw.profile_photo)) ?? null,
	}
}

function normalizeDistance(value: unknown): number | null {
	if (value === null || value === undefined || value === "") return null
	const n = typeof value === "number" ? value : Number(value)
	return Number.isFinite(n) && n >= 0 ? n : null
}

export function normalizeEvent(raw: unknown): EventCard | null {
	if (!isRecord(raw)) return null

	const id = text(raw.id)
	const name = text(raw.name)
	if (!id || !name) return null

	const location = isRecord(raw.event_location) ? raw.event_location : null
	// returned coordinates are [longitude, latitude]
	const pair = location && Array.isArray(location.coordinates) ? location.coordinates : null
	const coordinates =
		pair && isValidCoordinates(pair[1], pair[0])
			? { latitude: pair[1] as number, longitude: pair[0] as number }
			: null

	const address = text(raw.address) || (location ? text(location.address) : "") || null
	const privacy = text(raw.privacy)
	const rsvp = text(raw.viewer_rsvp_status)

	return {
		id,
		name,
		startDate: text(raw.start_date),
		endDate: text(raw.end_date),
		startTime: normalizeTime(raw.start_time),
		endTime: normalizeTime(raw.end_time),
		isLive: raw.is_live === true,
		isLocked: raw.is_locked === true,
		privacy: PRIVACY.has(privacy) ? (privacy as EventPrivacy) : null,
		coverImage: resolveMediaUrl(text(raw.cover_image)) ?? null,
		hashtags: Array.isArray(raw.event_hashtags)
			? raw.event_hashtags.filter((t): t is string => typeof t === "string" && t.length > 0)
			: [],
		address,
		coordinates,
		hosts: Array.isArray(raw.hosts)
			? raw.hosts.map(normalizeHost).filter((h): h is EventHost => h !== null)
			: [],
		viewerRsvp: RSVP.has(rsvp) ? (rsvp as EventRsvpStatus) : null,
		distanceKm: normalizeDistance(raw.distance_km),
	}
}

function normalizeEvents(items: unknown): EventCard[] {
	if (!Array.isArray(items)) return []
	return items.map(normalizeEvent).filter((e): e is EventCard => e !== null)
}

/** keep the first occurrence so server order (nearest first) is retained */
export function dedupeEvents(events: EventCard[]): EventCard[] {
	const seen = new Set<string>()
	const out: EventCard[] = []
	for (const event of events) {
		if (seen.has(event.id)) continue
		seen.add(event.id)
		out.push(event)
	}
	return out
}

function hasNext(data: Record<string, unknown>): boolean {
	return typeof data.next === "string" && data.next.length > 0
}

/**
 * Nearby has two documented shapes:
 *  - nothing matched: `data.events` is an array, no pagination fields
 *  - matches: paginated, `data.results = { detail, events }`
 * A page can be empty while `next` is non-null (expired events are removed
 * after pagination), so `hasNext` is taken from `next` alone — never from
 * `count`, `total_pages` or the number of events on the page.
 */
export function normalizeNearbyData(data: unknown, page: number): EventsPage {
	const d = isRecord(data) ? data : {}

	if (isRecord(d.results)) {
		return { events: normalizeEvents(d.results.events), page, hasNext: hasNext(d) }
	}
	return { events: normalizeEvents(d.events), page, hasNext: hasNext(d) }
}

/** list/search: standard pagination with `data.results` as an array */
export function normalizeListData(data: unknown, page: number): EventsPage {
	const d = isRecord(data) ? data : {}
	return { events: normalizeEvents(d.results), page, hasNext: hasNext(d) }
}

/** flatten + dedupe accumulated pages */
export function flattenPages(pages: EventsPage[] | undefined): EventCard[] {
	return dedupeEvents(pages?.flatMap((p) => p.events) ?? [])
}

/* -------------------------------------------------------------------------------------------
 * Pass 2: details, preview and RSVP
 * ----------------------------------------------------------------------------------------- */

const LIVE_STATUS = new Set<string>(["waiting", "live", "ended", "cancelled"])

/** only http(s) is ever kept: a `javascript:` or `data:` link must never reach an href */
export function normalizeHttpUrl(value: unknown): string | null {
	const raw = text(value)
	if (!raw) return null
	try {
		const url = new URL(raw)
		return url.protocol === "http:" || url.protocol === "https:" ? raw : null
	} catch {
		return null
	}
}

function integerOrNull(value: unknown): number | null {
	return typeof value === "number" && Number.isInteger(value) ? value : null
}

function normalizeLinks(items: unknown): EventLink[] {
	if (!Array.isArray(items)) return []
	const out: EventLink[] = []
	for (const item of items) {
		if (!isRecord(item)) continue
		const url = normalizeHttpUrl(item.url)
		if (!url) continue
		out.push({ name: text(item.link_name) || url, url })
	}
	return out
}

function normalizeDocuments(items: unknown): EventDocument[] {
	if (!Array.isArray(items)) return []
	const out: EventDocument[] = []
	for (const item of items) {
		if (!isRecord(item)) continue
		const url = resolveMediaUrl(text(item.doc_file))
		if (!url) continue
		out.push({ name: text(item.doc_name) || "Document", url })
	}
	return out
}

function stringList(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((t): t is string => typeof t === "string" && t.length > 0)
		: []
}

function normalizeFullDetails(raw: Record<string, unknown>, card: EventCard): EventFullDetails {
	const session = isRecord(raw.live_session) ? raw.live_session : null
	const status = session ? text(session.status) : ""
	// a full response always says whether the viewer responded: null means "no response"
	const rsvp: RsvpKnowledge = card.viewerRsvp
		? { state: "set", status: card.viewerRsvp }
		: { state: "none" }
	return {
		kind: "full",
		id: card.id,
		name: card.name,
		startDate: card.startDate,
		endDate: card.endDate,
		startTime: card.startTime,
		endTime: card.endTime,
		isLive: card.isLive,
		isLocked: card.isLocked,
		privacy: card.privacy,
		coverImage: card.coverImage,
		liveSessionId:
			integerOrNull(raw.live_session_id) ?? (session ? integerOrNull(session.id) : null),
		address: card.address,
		hashtags: card.hashtags,
		coordinates: card.coordinates,
		hosts: card.hosts,
		liveSessionStatus: LIVE_STATUS.has(status) ? (status as EventLiveStatus) : null,
		links: normalizeLinks(raw.links),
		documents: normalizeDocuments(raw.documents),
		rsvp,
	}
}

function normalizePreview(
	raw: Record<string, unknown>,
	id: string,
	name: string,
): EventPreviewDetails {
	const privacy = text(raw.privacy)
	return {
		kind: "preview",
		id,
		name,
		startDate: text(raw.start_date),
		endDate: text(raw.end_date),
		startTime: normalizeTime(raw.start_time),
		endTime: normalizeTime(raw.end_time),
		isLive: raw.is_live === true,
		isLocked: raw.is_locked === true,
		privacy: PRIVACY.has(privacy) ? (privacy as EventPrivacy) : null,
		coverImage: resolveMediaUrl(text(raw.cover_image)) ?? null,
		liveSessionId: integerOrNull(raw.live_session_id),
		address: text(raw.address) || null,
		hashtags: stringList(raw.hashtags),
	}
}

/**
 * Details come in two shapes, both HTTP 200 (guide §3.2, §3.3, §4.8):
 *  - full: always carries a `hosts` array, so that is what marks it;
 *  - restricted preview: flat `address` / `hashtags`, no hosts, no resources, no session, no RSVP.
 * Anything that is not clearly full is treated as a preview, so a malformed payload can only
 * ever lose access, never gain it. Host email/phone and `guests` are never copied.
 */
export function normalizeEventDetails(raw: unknown): EventDetails | null {
	if (!isRecord(raw)) return null
	const id = text(raw.id)
	const name = text(raw.name)
	if (!id || !name) return null

	if (Array.isArray(raw.hosts)) {
		const card = normalizeEvent(raw)
		if (card) return normalizeFullDetails(raw, card)
	}
	return normalizePreview(raw, id, name)
}

/** `POST rsvp` → `data.event` (UUID) and `data.status` */
export function normalizeRsvpResult(data: unknown): RsvpResult | null {
	if (!isRecord(data)) return null
	const eventId = text(data.event)
	const status = text(data.status)
	if (!eventId || !RSVP.has(status)) return null
	return { eventId, status: status as EventRsvpStatus }
}

/* -------------------------------------------------------------------------------------------
 * Pass 3 (P3-02): resources, comments and guests (read side)
 *
 * Each reader returns null for a body it cannot read as the documented shape, so the API layer
 * can raise an error instead of showing "empty". An empty array is a real, empty list. Every
 * reader copies a fixed whitelist: nothing else from the backend object is kept (A-17, A-18,
 * A-20), in particular no email/phone, `rsvp_status`, `joined_at`, author ids or `date_added`.
 * ----------------------------------------------------------------------------------------- */

const DOCUMENT_DATE = /^\d{2}\/\d{2}\/\d{4}$/
const FILE_TYPE = /^[A-Z0-9]{1,10}$/
const MAX_SIZE_LABEL = 32

/** a stored media reference as a safe http(s) URL, or null */
function mediaUrl(value: unknown): string | null {
	return normalizeHttpUrl(resolveMediaUrl(text(value)))
}

function normalizeResourceDocuments(items: unknown[]): EventResourceDocument[] {
	const out: EventResourceDocument[] = []
	for (const item of items) {
		if (!isRecord(item)) continue
		const url = mediaUrl(item.doc_file)
		if (!url) continue
		const size = text(item.size)
		const fileType = text(item.file_type).toUpperCase()
		const uploadedOn = text(item.date_uploaded)
		out.push({
			name: text(item.doc_name) || "Document",
			url,
			size: size && size.length <= MAX_SIZE_LABEL ? size : null,
			fileType: FILE_TYPE.test(fileType) ? fileType : null,
			uploadedOn: DOCUMENT_DATE.test(uploadedOn) ? uploadedOn : null,
		})
	}
	return out
}

/**
 * `GET resources` `data`. Both arrays are always present per the guide; if either is missing the
 * body is unreadable (null), never "no resources". `data.event` is the event NAME and is ignored;
 * links whose address is not http(s) and documents with no usable file URL are dropped.
 */
export function normalizeResources(data: unknown): EventResources | null {
	if (!isRecord(data) || !Array.isArray(data.links) || !Array.isArray(data.documents)) return null
	return {
		links: normalizeLinks(data.links),
		documents: normalizeResourceDocuments(data.documents),
	}
}

function guestRole(value: unknown): EventGuestRole | null {
	const role = text(value)
	return role === "host" || role === "guest" ? role : null
}

function normalizeCommentAuthor(raw: unknown): EventCommentAuthor | null {
	if (!isRecord(raw)) return null
	const username = text(raw.username)
	const name = text(raw.full_name) || username
	if (!name) return null
	return { name, username, photo: mediaUrl(raw.photo), role: guestRole(raw.role) }
}

/** a comment needs a UUID-like id and a nonblank message; the message text is kept as sent */
export function normalizeComment(raw: unknown): EventComment | null {
	if (!isRecord(raw)) return null
	const id = text(raw.id)
	if (!id || typeof raw.message !== "string" || !raw.message.trim()) return null
	const created = text(raw.created_at)
	return {
		id,
		message: raw.message,
		createdAt: created && Number.isFinite(Date.parse(created)) ? created : null,
		author: normalizeCommentAuthor(raw.user),
	}
}

/** `GET comments` `data`: standard pagination, newest first. `results` must be an array */
export function normalizeCommentsPage(data: unknown, page: number): EventCommentsPage | null {
	if (!isRecord(data) || !Array.isArray(data.results)) return null
	return {
		comments: data.results.map(normalizeComment).filter((c): c is EventComment => c !== null),
		page,
		hasNext: hasNext(data),
	}
}

/**
 * A guest row needs a positive integer `user_id` (the user `pkid`, which removal sends) and some
 * display name. An unknown role is treated as the less privileged `guest`.
 */
export function normalizeGuest(raw: unknown): EventGuest | null {
	if (!isRecord(raw)) return null
	const userId = raw.user_id
	if (typeof userId !== "number" || !Number.isInteger(userId) || userId < 1) return null
	const username = text(raw.user_username)
	const name = text(raw.user_full_name) || username
	if (!name) return null
	return {
		userId,
		name,
		username,
		photo: mediaUrl(raw.user_photo),
		role: guestRole(raw.role) ?? "guest",
	}
}

/** `GET guests` `data`: standard pagination, newest `joined_at` first. `results` must be an array */
export function normalizeGuestsPage(data: unknown, page: number): EventGuestsPage | null {
	if (!isRecord(data) || !Array.isArray(data.results)) return null
	return {
		guests: data.results.map(normalizeGuest).filter((g): g is EventGuest => g !== null),
		page,
		hasNext: hasNext(data),
	}
}

/* -------------------------------------------------------------------------- */
/* Pass 4 (P4-01): live-session read                                          */
/* -------------------------------------------------------------------------- */

const SESSION_TYPE = new Set<string>(["public", "private"])
const MEDIA_PROVIDER = new Set<string>(["p2p", "livekit"])
const MEDIA_STATUS = new Set<string>([
	"legacy",
	"pending",
	"provisioning",
	"ready",
	"failed",
	"missing",
	"ended",
])
const LIVE_ROLE = new Set<string>(["host", "co_host", "speaker", "listener"])

function oneOf<T extends string>(set: Set<string>, value: unknown): T | null {
	const v = text(value)
	return set.has(v) ? (v as T) : null
}

function positiveInteger(value: unknown): number | null {
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null
}

/**
 * The documented descriptor exactly (guide §3.6): namespace `/live`, join event `live:join` and a
 * positive integer session id that matches the session it came with. Anything else is dropped, so
 * a drifted payload can never point the later socket code somewhere unexpected.
 */
function normalizeSocketDescriptor(raw: unknown, sessionId: number): LiveSocketDescriptor | null {
	if (!isRecord(raw)) return null
	if (raw.namespace !== "/live" || raw.join_event !== "live:join") return null
	const payload = isRecord(raw.join_payload) ? raw.join_payload : null
	if (!payload || positiveInteger(payload.sessionId) !== sessionId) return null
	return { namespace: "/live", joinEvent: "live:join", sessionId }
}

function dateString(value: unknown): string | null {
	return text(value) || null
}

/**
 * `GET {event_id}/live-session` `data` (guide §4.18, §5.1): `event_id`, the full `live_session` and
 * `socket`. The provider and media status sit under `media` in the full shape and flat as
 * `media_provider` / `media_status` in the attached summary (§3.5); either is read. A body without
 * an event id, an integer session id and a known status is not trusted: it returns null and the
 * caller reports an unreadable response, never an invented session.
 */
export function normalizeLiveSession(data: unknown): EventLiveSessionState | null {
	if (!isRecord(data) || !isRecord(data.live_session)) return null
	const eventId = text(data.event_id)
	const raw = data.live_session
	const id = positiveInteger(raw.id)
	const status = oneOf<EventLiveStatus>(LIVE_STATUS, raw.status)
	if (!eventId || id === null || status === null) return null

	const media = isRecord(raw.media) ? raw.media : {}
	const count = raw.participant_count
	const session: EventLiveSession = {
		id,
		title: text(raw.title),
		status,
		sessionType: oneOf<LiveSessionType>(SESSION_TYPE, raw.session_type),
		participantCount:
			typeof count === "number" && Number.isInteger(count) && count >= 0 ? count : null,
		startedAt: dateString(raw.started_at),
		endedAt: dateString(raw.ended_at),
		mediaProvider: oneOf<LiveMediaProvider>(MEDIA_PROVIDER, media.provider ?? raw.media_provider),
		mediaStatus: oneOf<LiveMediaStatus>(MEDIA_STATUS, media.status ?? raw.media_status),
		currentUserRole: oneOf<LiveParticipantRole>(LIVE_ROLE, raw.current_user_role),
		isJoined: raw.is_joined === true,
	}
	return { eventId, session, socket: normalizeSocketDescriptor(data.socket, id) }
}


/* -------------------------------------------------------------------------- */
/* Pass 4 (P4-07A): live participants                                          */
/* -------------------------------------------------------------------------- */

/**
 * A participant row is accepted only when its documented identity, role, booleans and timestamp
 * are readable. A malformed row invalidates the page rather than silently turning a broken
 * response into an apparently empty roster.
 */
export function normalizeLiveParticipant(raw: unknown): LiveParticipant | null {
	if (!isRecord(raw) || !isRecord(raw.user)) return null
	const id = Number.isSafeInteger(raw.id) && (raw.id as number) > 0 ? (raw.id as number) : null
	const userId = Number.isSafeInteger(raw.user.pkid) && (raw.user.pkid as number) > 0
		? (raw.user.pkid as number)
		: null
	const userUuid = text(raw.user.id)
	const username = text(raw.user.username)
	const name = [text(raw.user.first_name), text(raw.user.last_name)].filter(Boolean).join(" ") || username
	const role = oneOf<LiveParticipantRole>(LIVE_ROLE, raw.role)
	const joinedAt = text(raw.joined_at)
	if (
		id === null ||
		userId === null ||
		!userUuid ||
		!name ||
		role === null ||
		typeof raw.is_active !== "boolean" ||
		typeof raw.is_muted !== "boolean" ||
		typeof raw.media_connected !== "boolean" ||
		typeof raw.microphone_published !== "boolean" ||
		typeof raw.camera_published !== "boolean" ||
		!joinedAt ||
		!Number.isFinite(Date.parse(joinedAt))
	) return null

	return {
		id,
		user: {
			userId,
			userUuid,
			name,
			username,
			photo: mediaUrl(raw.user.profile_photo),
		},
		role,
		isActive: raw.is_active,
		isMuted: raw.is_muted,
		mediaConnected: raw.media_connected,
		microphonePublished: raw.microphone_published,
		cameraPublished: raw.camera_published,
		joinedAt,
	}
}

/** GET sessions/{id}/participants: oldest joined first; preserve server order and next-link paging. */
export function normalizeLiveParticipantsPage(
	data: unknown,
	page: number,
): LiveParticipantsPage | null {
	if (!isRecord(data) || !Array.isArray(data.results)) return null
	const participants: LiveParticipant[] = []
	for (const raw of data.results) {
		const participant = normalizeLiveParticipant(raw)
		if (!participant) return null
		participants.push(participant)
	}
	return { participants, page, hasNext: hasNext(data) }
}
