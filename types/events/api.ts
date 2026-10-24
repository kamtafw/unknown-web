/**
 * Events view models for Pass 1 / Phase 1 (discovery + My Events).
 *
 * These are the shapes that enter the query cache and the UI. They are produced
 * only by lib/events/normalize.ts, which copies a fixed whitelist of backend
 * fields — host email/phone, guests, links and documents (returned by the backend
 * even for restricted events) are never represented here. See docs/events/EVENTS.md (EV-001).
 *
 * Wire shapes are deliberately not typed: normalize.ts reads them as `unknown`
 * so a contract drift degrades to "event skipped" instead of a runtime crash.
 *
 * Pass 2 adds event details (full vs restricted preview), RSVP and the create/edit
 * form model. Join/leave and live types belong to later passes; Pass 3 adds resource, comment and guest read models.
 */

export type EventPrivacy = "public" | "private" | "friends"
export type EventRsvpStatus = "going" | "interested" | "not_going"

export interface Coordinates {
	latitude: number
	longitude: number
}

/** browser location state for discovery */
export type LocationStatus =
	| "locating"
	| "ready"
	| "denied"
	| "unavailable"
	| "timeout"
	| "unsupported"

export interface EventHost {
	id: string
	name: string
	username: string
	photo: string | null
}

export interface EventCard {
	id: string
	name: string
	/** `YYYY-MM-DD`; the backend stores no timezone */
	startDate: string
	endDate: string
	/** `HH:MM`, or "" when absent/unparseable */
	startTime: string
	endTime: string
	isLive: boolean
	isLocked: boolean
	/** null when the backend value is missing or unrecognised */
	privacy: EventPrivacy | null
	coverImage: string | null
	hashtags: string[]
	address: string | null
	coordinates: Coordinates | null
	hosts: EventHost[]
	viewerRsvp: EventRsvpStatus | null
	/** nearby results only */
	distanceKm: number | null
}

export interface EventsPage {
	events: EventCard[]
	/** page number this response represents */
	page: number
	/** from the backend `next` link only — never from counts or `events.length` */
	hasNext: boolean
}

/* -------------------------------------------------------------------------- */
/* Pass 2: details, preview, RSVP, create / edit                              */
/* -------------------------------------------------------------------------- */

export type EventLiveStatus = "waiting" | "live" | "ended" | "cancelled"

/**
 * What the web knows about the viewer's own RSVP.
 *  - "unknown": the response did not say (restricted previews omit `viewer_rsvp_status`)
 *  - "none":    a full response said there is no RSVP
 *  - "set":     a recorded status
 * "unknown" must never be presented as "not responded".
 */
export type RsvpKnowledge =
	| { state: "unknown" }
	| { state: "none" }
	| { state: "set"; status: EventRsvpStatus }

export interface EventLink {
	name: string
	url: string
}

/** an already-uploaded document; `url` is the stored file, never an upload */
export interface EventDocument {
	name: string
	url: string
}

interface EventDetailsBase {
	id: string
	name: string
	/** `YYYY-MM-DD`; no timezone */
	startDate: string
	endDate: string
	/** `HH:MM` (preview times that carry seconds are trimmed), "" when unparseable */
	startTime: string
	endTime: string
	isLive: boolean
	isLocked: boolean
	privacy: EventPrivacy | null
	coverImage: string | null
	liveSessionId: number | null
	address: string | null
	hashtags: string[]
}

/**
 * Full access (host, online guest, or a public unlocked event). Host contact data
 * and guests are never retained. Links/documents are kept only so a host can edit
 * them; viewing them is Pass 3.
 */
export interface EventFullDetails extends EventDetailsBase {
	kind: "full"
	coordinates: Coordinates | null
	hosts: EventHost[]
	/** from the attached live-session summary, when present */
	liveSessionStatus: EventLiveStatus | null
	links: EventLink[]
	documents: EventDocument[]
	rsvp: RsvpKnowledge
}

/**
 * Restricted preview (HTTP 200 for a locked / non-public event the viewer cannot open).
 * It deliberately has no hosts, links, documents, coordinates or RSVP: a missing field
 * is "not disclosed", never "empty" and never a grant of access.
 */
export interface EventPreviewDetails extends EventDetailsBase {
	kind: "preview"
}

export type EventDetails = EventFullDetails | EventPreviewDetails

/** `rsvp` response (`data.event`, `data.status`) */
export interface RsvpResult {
	eventId: string
	status: EventRsvpStatus
}

/** a document chosen for upload */
export interface EventDocumentUpload {
	name: string
	file: File
}

/**
 * Backend collection semantics (guide §4.6): omitted = keep, `[]` = clear, populated =
 * replace ALL. Existing document URLs cannot be re-sent, so "keep" is the only way to
 * retain existing documents.
 */
export type DocumentsChange =
	| { mode: "keep" }
	| { mode: "clear" }
	| { mode: "replace"; items: EventDocumentUpload[] }

export interface EventFormValues {
	name: string
	startDate: string
	startTime: string
	endDate: string
	endTime: string
	privacy: EventPrivacy
	isLocked: boolean
	/** write-only; four ASCII digits, always a string (leading zeros) */
	passcode: string
	hashtags: string[]
	links: EventLink[]
	/** a location chosen in this form session; null = none chosen (edit keeps the stored one) */
	coordinates: Coordinates | null
	cover: File | null
	documents: DocumentsChange
}

/** what an edit started from; used to send only what changed */
export interface EventFormInitial {
	name: string
	startDate: string
	startTime: string
	endDate: string
	endTime: string
	privacy: EventPrivacy
	isLocked: boolean
	hashtags: string[]
	links: EventLink[]
}

export type EventSubmission =
	| { kind: "json"; body: Record<string, unknown> }
	| { kind: "multipart"; body: FormData }


/* Pass 3 read-side projections for event resources, comments and guests. */
export interface EventResourceLink { name: string; url: string }
export interface EventResourceDocument {
	name: string
	url: string
	size: string | null
	fileType: string | null
	dateUploaded: string | null
}
export interface EventResources { links: EventResourceLink[]; documents: EventResourceDocument[] }
export interface EventCommentAuthor {
	name: string
	username: string
	photo: string | null
	role: "host" | "guest"
}
export interface EventComment {
	id: string
	message: string
	createdAt: string
	author: EventCommentAuthor
}
export interface EventCommentsPage { comments: EventComment[]; page: number; hasNext: boolean }
export interface EventGuest {
	userId: number
	name: string
	username: string
	photo: string | null
	role: "host" | "guest"
}
export interface EventGuestsPage { guests: EventGuest[]; page: number; hasNext: boolean }
