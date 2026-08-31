import type { Status } from "@/types/messenger"

export const DEFAULT_DURATION_HOURS = 24
export const DURATION_PRESETS_HOURS = [6, 12, 24] as const
export const STATUS_VIDEO_MAX_SECONDS = 60

/** Safety net — the server filters expired statuses from list endpoints,
 * but a stale query cache could still surface one. */
export function isStatusActive(s: Status): boolean {
	return s.is_active !== false && new Date(s.expires_at).getTime() > Date.now()
}
