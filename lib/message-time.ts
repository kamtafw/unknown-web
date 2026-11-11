/** Format an API instant using the user’s selected IANA timezone. */
export function formatMessageTime(iso: string, timeZone?: string): string {
	const date = new Date(iso)
	if (!Number.isFinite(date.getTime())) return ""
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
	}
	try {
		return date.toLocaleTimeString([], {
			...options,
			...(timeZone ? { timeZone } : {}),
		})
	} catch {
		return date.toLocaleTimeString([], options)
	}
}
