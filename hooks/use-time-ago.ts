import dayjs from "dayjs"
import { useEffect, useState } from "react"

export function formatTimeAgo(date: string | number | Date) {
	const now = dayjs()
	const d = dayjs(date)

	const seconds = now.diff(d, "second")
	if (seconds < 5) return "now"
	if (seconds < 60) return `${seconds}s ago`

	const minutes = now.diff(d, "minute")
	if (minutes < 60) return `${minutes}m ago`

	const hours = now.diff(d, "hour")
	if (hours < 24) return `${hours}h ago`

	const days = now.diff(d, "day")
	if (days < 7) return `${days}d ago`

	const weeks = now.diff(d, "week")
	if (weeks < 4) return `${weeks}w ago`

	const months = now.diff(d, "month")
	if (months < 12) return `${months}mo ago`

	const years = now.diff(d, "year")
	return `${years}y ago`
}

export function useTimeAgo(date: Date | string | number) {
	const [time, setTime] = useState(formatTimeAgo(date))

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(formatTimeAgo(date))
		}, 60_000)

		return () => clearInterval(interval)
	}, [date])

	return time
}
