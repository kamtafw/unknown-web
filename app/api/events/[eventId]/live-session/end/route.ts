import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchSanitizedPostNoBody, unauthenticated } from "@/lib/events/bff"
import { isEventId } from "@/lib/events/server"
import { sanitizeLiveSessionEndPayload } from "@/lib/events/live-session-lifecycle"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/** End a waiting or live event session (guide §4.21). Host authorization and final state are upstream. */
export async function POST(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return fetchSanitizedPostNoBody(
		`${DJANGO_API_URL}/events/${eventId}/live-session/end`,
		token,
		sanitizeLiveSessionEndPayload,
	)
}
