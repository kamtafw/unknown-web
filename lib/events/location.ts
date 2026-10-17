import type { Coordinates, LocationStatus } from "@/types/events/api"

export function isValidLatitude(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90
}

export function isValidLongitude(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180
}

/** zero is a valid coordinate, so this never uses truthiness */
export function isValidCoordinates(latitude: unknown, longitude: unknown): boolean {
	return isValidLatitude(latitude) && isValidLongitude(longitude)
}

const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

/**
 * parse a query-string coordinate. `Number("")` is 0 and `Number("0x10")` is 16,
 * so an empty or non-decimal string must be rejected explicitly, not coerced.
 */
export function parseCoordinateParam(raw: string | null | undefined): number | null {
	if (raw == null) return null
	const text = raw.trim()
	if (!NUMERIC.test(text)) return null
	const n = Number(text)
	return Number.isFinite(n) ? n : null
}

/** 6 decimals ≈ 0.1 m; also avoids exponent notation (e.g. "1e-7") upstream */
export function formatCoordinateParam(value: number): string {
	return value.toFixed(6)
}

/** cache-key rounding only (3 decimals ≈ 110 m); requests use the exact values */
export function roundForKey(value: number, decimals = 3): number {
	const factor = 10 ** decimals
	return Math.round(value * factor) / factor
}

export function classifyPositionError(code: number): "denied" | "unavailable" | "timeout" {
	if (code === 1) return "denied"
	if (code === 3) return "timeout"
	return "unavailable"
}

export type PermissionAction = "none" | "revoke" | "retry"

/**
 * what to do when the browser reports a geolocation permission state:
 *  - denied while we hold or are fetching a location → revoke (clear results)
 *  - granted while we are stuck in an error state → retry
 * "prompt" never triggers an automatic request, to avoid surprise prompts.
 */
export function permissionAction(
	permissionState: PermissionState,
	status: LocationStatus,
): PermissionAction {
	if (permissionState === "denied") return status === "denied" ? "none" : "revoke"
	if (
		permissionState === "granted" &&
		(status === "denied" || status === "unavailable" || status === "timeout")
	) {
		return "retry"
	}
	return "none"
}

export function toCoordinates(latitude: number, longitude: number): Coordinates | null {
	return isValidCoordinates(latitude, longitude) ? { latitude, longitude } : null
}
