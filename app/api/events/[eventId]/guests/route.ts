import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchSanitizedGet, unauthenticated } from "@/lib/events/bff"
import { isEventId, parsePageParams, sanitizeGuestsPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * One page of this event's guests. Only `page` and `limit` are forwarded (invalid values fall
 * back, `limit` is clamped to the backend maximum); any other client parameter is dropped.
 * Access is decided upstream; errors pass through unchanged. A successful body is reduced to the
 * approved fields before it reaches the browser (A-17); pagination fields are kept.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	return fetchSanitizedGet(
		`${DJANGO_API_URL}/events/${eventId}/guests?page=${page}&limit=${limit}`,
		token,
		sanitizeGuestsPayload,
	)
}
