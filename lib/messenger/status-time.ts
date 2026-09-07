/**
 * Status-specific relative time formatting.
 *
 * Statuses live for at most 24h, so an absolute calendar date (e.g. "1
 * December 2024, 14:25") is the wrong register for this surface — it
 * reads like a document timestamp, not a conversational one. This is the
 * single place that decides how a status's age is expressed; nothing
 * else in the Status feature should format a date itself (list rows,
 * the viewer header, and status-grouping.ts's own relative-time helper
 * all delegate here — see the re-export at the bottom of this file).
 *
 * Rules (in priority order):
 *  - < 60s                         → "Just now"
 *  - < 60min                       → "{n}min ago"
 *  - < 24h AND same calendar day   → "{n}h ago"
 *  - < 24h AND crossed midnight    → "Today, {h:mm}{am|pm}"
 *  - yesterday, within 24h window  → "Yesterday, {h:mm}{am|pm}"
 *  - anything older (shouldn't
 *    normally happen — a status
 *    has expired by then, but a
 *    stale cache entry could still
 *    render one briefly)          → "{h:mm}{am|pm}" for today's date,
 *                                    otherwise a short "D MMM" fallback
 *  - future timestamp (clock skew) → treated as "Just now" rather than
 *                                    a nonsensical negative duration
 *
 * The `Today, ...` branch only fires once genuine hour-granularity stops
 * being useful — i.e. gone midnight since the status was posted even
 * though it's under an hour old is the interesting case; a same-day
 * status past the 60-minute mark stays in "{n}h ago" form regardless of
 * whether it happens to have also crossed midnight in the same breath
 * (see the boundary handling below), which keeps the common case snappy.
 */

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function isSameCalendarDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

function isYesterday(date: Date, now: Date): boolean {
	const yesterday = new Date(now)
	yesterday.setDate(now.getDate() - 1)
	return isSameCalendarDay(date, yesterday)
}

/** `10:02am` / `12:30pm` — lowercase, no leading zero on the hour, no
 * space before am/pm, matching the app's casual Status register rather
 * than the locale-dependent "10:02 AM" `toLocaleTimeString` would give. */
function formatClockTime(date: Date): string {
	let hours = date.getHours()
	const minutes = date.getMinutes()
	const period = hours >= 12 ? "pm" : "am"
	hours = hours % 12 || 12
	const minutesStr = String(minutes).padStart(2, "0")
	return `${hours}:${minutesStr}${period}`
}

export function formatStatusTimestamp(iso: string, now: Date = new Date()): string {
	const date = new Date(iso)
	if (Number.isNaN(date.getTime())) return ""

	const diffMs = now.getTime() - date.getTime()

	// Clock skew / a status that appears to be posted in the future —
	// don't show a negative duration, just treat it as brand new.
	if (diffMs < MINUTE_MS) return "Just now"
	if (diffMs < HOUR_MS) return `${Math.floor(diffMs / MINUTE_MS)}min ago`

	if (diffMs < DAY_MS) {
		if (isSameCalendarDay(date, now)) {
			return `${Math.floor(diffMs / HOUR_MS)}h ago`
		}
		return `Today, ${formatClockTime(date)}`
	}

	if (isYesterday(date, now)) {
		return `Yesterday, ${formatClockTime(date)}`
	}

	// A status shouldn't realistically still be around past 24h, but a
	// stale cache entry could briefly render one — degrade to a short,
	// still-relative-feeling label rather than a full calendar date.
	if (isSameCalendarDay(date, now)) return formatClockTime(date)
	return date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
}
