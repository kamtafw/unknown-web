import type { EventCard } from "@/types/events/api"

/** lowercase, trim, drop a leading "#" so "#music" matches the tag "music" */
export function normalizeQuery(query: string): string {
	return query.trim().replace(/^#+/, "").toLowerCase()
}

/**
 * Local filter over already-fetched nearby events. The nearby endpoint has no
 * search parameter, and discovery must never use the global search endpoint,
 * so matching happens here on the displayed fields: name, address, hashtags.
 */
export function filterNearbyEvents(events: EventCard[], query: string): EventCard[] {
	const q = normalizeQuery(query)
	if (!q) return events
	return events.filter(
		(e) =>
			e.name.toLowerCase().includes(q) ||
			(e.address ?? "").toLowerCase().includes(q) ||
			e.hashtags.some((t) => t.toLowerCase().includes(q)),
	)
}
