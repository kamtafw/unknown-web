import { resolveMediaUrl } from "@/lib/server-config"
import type {
	EventCard,
	EventHost,
	EventPrivacy,
	EventRsvpStatus,
	EventsPage,
} from "@/types/events/api"
import { isValidCoordinates } from "./location"

/**
 * Backend → app boundary. This is the ONLY place raw event objects are read,
 * and it copies a fixed whitelist of fields. Restricted-event data the backend
 * also returns (host email/phone, guests, links, documents) is never copied, so
 * it can never reach a cache, a component or a log.
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
