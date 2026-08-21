/**
 * "Today" / "Yesterday" / "weekday" / date label for message-list date
 * separators. Generic date-formatting logic, not tied to any confirmed
 * backend contract — kept intentionally simple for M1.
 */

export function resolveDateSeparatorLabel(isoDate: string, now: Date = new Date()): string {
	const date = new Date(isoDate)
	const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

	const dayDiff = Math.round(
		(startOfDay(now).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24),
	)

	if (dayDiff === 0) return "Today"
	if (dayDiff === 1) return "Yesterday"
	if (dayDiff > 1 && dayDiff < 7) {
		return date.toLocaleDateString(undefined, { weekday: "long" })
	}
	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "long",
		year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
	})
}

/** Groups a flat, oldest-to-newest message list into day buckets for
 * rendering `<DateSeparator/>` between groups. */
export function groupMessagesByDay<T extends { created_at: string }>(
	items: T[],
): Array<{ label: string; items: T[] }> {
	const groups: Array<{ label: string; items: T[] }> = []

	for (const item of items) {
		const label = resolveDateSeparatorLabel(item.created_at)
		const lastGroup = groups[groups.length - 1]
		if (lastGroup && lastGroup.label === label) {
			lastGroup.items.push(item)
		} else {
			groups.push({ label, items: [item] })
		}
	}

	return groups
}
