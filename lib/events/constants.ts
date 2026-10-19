/** Nearby discovery radius. A product rule, enforced in the BFF route handler. */
export const NEARBY_RADIUS_KM = 25

/** backend maximum for `limit` */
export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

/** the only value of `filter` My Events may ever send */
export const MY_EVENTS_FILTER = "my_events"

/** max length of a search term forwarded to the backend */
export const MAX_SEARCH_LENGTH = 100

/**
 * While a nearby search is active we walk the remaining nearby pages so
 * "no matches" is only declared for the full nearby set. This caps that walk;
 * past it the UI says it searched loaded results only.
 */
export const MAX_SEARCH_SCAN_PAGES = 25

/** safety stop when auto-advancing past empty nearby pages */
export const MAX_EMPTY_PAGE_ADVANCE = 50

/** clamp a requested page size into the backend's documented 1..100 range */
export function resolvePageSize(raw: string | number | null | undefined): number {
	const n = typeof raw === "number" ? raw : Number(raw)
	if (!Number.isInteger(n) || n < 1) return DEFAULT_PAGE_SIZE
	return Math.min(n, MAX_PAGE_SIZE)
}

/** configurable via NEXT_PUBLIC_EVENTS_PAGE_SIZE; provisional default is 20 */
export const EVENTS_PAGE_SIZE = resolvePageSize(process.env.NEXT_PUBLIC_EVENTS_PAGE_SIZE)
