import { getAccessToken } from "@/lib/cookies"
import {
	eventNotFound,
	fetchSanitizedGet,
	fetchSanitizedPostNoBody,
	unauthenticated,
} from "@/lib/events/bff"
import { WEB_APP_VERSION } from "@/lib/events/constants"
import { isEventId, sanitizeLiveSessionPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * Read or create the event's attached live session (guide §§4.18-4.19).
 * GET never creates or joins. POST creates a private waiting session, or returns the existing
 * session; the backend remains authoritative for host access and existing-session semantics.
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

export async function POST(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return fetchSanitizedPostNoBody(
		`${DJANGO_API_URL}/events/${eventId}/live-session`,
		token,
		sanitizeLiveSessionPayload,
		{ "X-Platform": "web", "X-App-Version": WEB_APP_VERSION },
	)
}
