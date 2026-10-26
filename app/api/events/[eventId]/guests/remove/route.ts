import { getAccessToken } from "@/lib/cookies"
import { envelope, eventNotFound, fetchSanitizedPost, readJsonBody, unauthenticated } from "@/lib/events/bff"
import { buildGuestRemoveBody, isEventId, sanitizeGuestRemovePayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * Remove a guest record from an event (`POST guests/remove`, host only, guide §4.14). Only
 * `user_id` (a positive integer) is forwarded; anything else is rejected before an upstream
 * request. Who may do this is the backend's decision: its 403 ("Only event hosts can remove
 * guests.") and its 404s ("Guest not found in this event." or an absent event) pass through
 * unchanged, so the caller can tell them apart. A 2xx that is not the documented envelope is a
 * 502, never success. The removal deletes the guest's comments in this event; it does not revoke
 * live participation or media.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const body = await readJsonBody(req)
	if (!body.ok) return body.response

	const built = buildGuestRemoveBody(body.value)
	if (!built.ok) return envelope(400, built.message, built.code)

	return fetchSanitizedPost(
		`${DJANGO_API_URL}/events/${eventId}/guests/remove`,
		token,
		built.value,
		sanitizeGuestRemovePayload,
	)
}
