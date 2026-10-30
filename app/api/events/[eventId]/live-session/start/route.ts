import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchSanitizedPostNoBody, unauthenticated } from "@/lib/events/bff"
import { WEB_APP_VERSION } from "@/lib/events/constants"
import { isEventId, sanitizeLiveSessionPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * Start the attached event live session (guide §4.20). This endpoint is intentionally present for
 * the lifecycle API, but the web UI does not invoke it until browser publishing is supported:
 * setting the event live without a usable web host media path would mislead attendees.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return fetchSanitizedPostNoBody(
		`${DJANGO_API_URL}/events/${eventId}/live-session/start`,
		token,
		sanitizeLiveSessionPayload,
		{ "X-Platform": "web", "X-App-Version": WEB_APP_VERSION },
	)
}
