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
 * Details / preview / RSVP / live types belong to later passes.
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
