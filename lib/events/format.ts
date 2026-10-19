import type { EventCard } from "@/types/events/api"
import { format } from "date-fns"

/** parse `YYYY-MM-DD` as a local calendar date (no timezone shift) */
function parseDate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
	if (!match) return null
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
	return Number.isNaN(date.getTime()) ? null : date
}

function day(date: Date, now: Date): string {
	return format(date, date.getFullYear() === now.getFullYear() ? "EEE, d MMM" : "EEE, d MMM yyyy")
}

/**
 * Event dates/times carry no timezone, so they are shown exactly as stored —
 * never converted through the browser's timezone.
 */
export function formatEventSchedule(
	event: Pick<EventCard, "startDate" | "endDate" | "startTime" | "endTime">,
	now: Date = new Date(),
): string {
	const start = parseDate(event.startDate)
	if (!start) return ""
	const end = parseDate(event.endDate)

	const startLabel = day(start, now)
	const sameDay = !end || event.endDate === event.startDate

	if (sameDay) {
		if (event.startTime && event.endTime && event.endTime !== event.startTime) {
			return `${startLabel} · ${event.startTime} – ${event.endTime}`
		}
		return event.startTime ? `${startLabel} · ${event.startTime}` : startLabel
	}

	const from = event.startTime ? `${startLabel}, ${event.startTime}` : startLabel
	const to = event.endTime ? `${day(end, now)}, ${event.endTime}` : day(end, now)
	return `${from} – ${to}`
}

export function formatDistance(km: number | null): string {
	if (km === null || !Number.isFinite(km)) return ""
	if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m away`
	return `${km < 10 ? km.toFixed(1) : Math.round(km)} km away`
}
