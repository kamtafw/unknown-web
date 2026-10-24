import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, unauthenticated } from "@/lib/events/bff"
import { isEventId, parsePageParams } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * One page of this event's guests. Only `page` and `limit` are forwarded (invalid values fall
 * back, `limit` is clamped to the backend maximum); any other client parameter is dropped.
 * Access is decided upstream and its status and body are passed through unchanged.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	return proxyJson(`${DJANGO_API_URL}/events/${eventId}/guests?page=${page}&limit=${limit}`, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		cache: "no-store",
	})
}
