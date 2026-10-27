import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchSanitizedGet, unauthenticated } from "@/lib/events/bff"
import { isEventId, sanitizeLiveSessionPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * The attached live session of this event, read only (P4-01, guide §4.18). No query parameters are
 * forwarded. Access is decided upstream (event host or online event guest, even for a public
 * event) and errors pass through unchanged: a 403 is an access state, not an expired login, and
 * the two 404s (absent event, no live session) keep their own messages. A successful body is
 * reduced to the status-level fields before it reaches the browser; an unreadable 2xx is a 502.
 *
 * Only GET is exported on purpose. Creating, starting and ending a session, joining and leaving
 * are separate later tasks; this route never creates a session or joins the caller.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return fetchSanitizedGet(
		`${DJANGO_API_URL}/events/${eventId}/live-session`,
		token,
		sanitizeLiveSessionPayload,
	)
}
