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
	MAX_PAGE_SIZE,
	MAX_SEARCH_LENGTH,
	MY_EVENTS_FILTER,
	NEARBY_RADIUS_KM,
} from "./constants"
import {
	formatCoordinateParam,
	isValidCoordinates,
	parseCoordinateParam,
} from "./location"

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
