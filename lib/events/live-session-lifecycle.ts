/**
 * Response projection for the live-session end mutation.
 *
 * End has no full session object in its documented response. Keep only the lifecycle confirmation
 * fields needed by the caller; never forward provider credentials, room metadata or other extras.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function sanitizeLiveSessionEndPayload(json: unknown): unknown | null {
	if (!isRecord(json) || json.success !== true || !isRecord(json.data)) return null

	const data = json.data
	const eventId = data.event_id
	const sessionId = data.live_session_id
	const sync = data.synchronization_status
	if (
		typeof eventId !== "string" ||
		!eventId.trim() ||
		data.is_live !== false ||
		typeof sessionId !== "number" ||
		!Number.isInteger(sessionId) ||
		sessionId < 1 ||
		(sync !== "pending" && sync !== "synchronized")
	) {
		return null
	}

	return {
		...(typeof json.status_code === "number" ? { status_code: json.status_code } : {}),
		...(typeof json.message === "string" || json.message === null ? { message: json.message } : {}),
		success: true,
		data: {
			event_id: eventId,
			is_live: false,
			live_session_id: sessionId,
			synchronization_status: sync,
		},
	}
}
