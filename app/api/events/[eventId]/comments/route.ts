import { getAccessToken } from "@/lib/cookies"
import {
	envelope,
	eventNotFound,
	fetchSanitizedGet,
	fetchSanitizedPost,
	readJsonBody,
	unauthenticated,
} from "@/lib/events/bff"
import {
	buildCommentBody,
	isEventId,
	parsePageParams,
	sanitizeCommentCreatePayload,
	sanitizeCommentsPayload,
} from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * One page of this event's comments. Only `page` and `limit` are forwarded (invalid values fall
 * back, `limit` is clamped to the backend maximum); any other client parameter is dropped.
 * Access is decided upstream; errors pass through unchanged. A successful body is reduced to the
 * approved fields before it reaches the browser (A-20); pagination fields are kept.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	return fetchSanitizedGet(
		`${DJANGO_API_URL}/events/${eventId}/comments?page=${page}&limit=${limit}`,
		token,
		sanitizeCommentsPayload,
	)
}

/**
 * Post a comment (`POST comments/create`). Only `message` is forwarded, trimmed; a blank message
 * is rejected here with no upstream request, and the generic JSON size guard applies. There is no
 * comment length limit (EV-030). Who may post is the backend's decision (an online guest record is
 * required; host status alone is not enough, guide §4.15): its 400/403/404 pass through unchanged.
 * A 2xx body that is not the documented one is answered with 502, never as success. The comment
 * text is not logged.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const body = await readJsonBody(req)
	if (!body.ok) return body.response

	const built = buildCommentBody(body.value)
	if (!built.ok) return envelope(400, built.message, built.code)

	return fetchSanitizedPost(
		`${DJANGO_API_URL}/events/${eventId}/comments/create`,
		token,
		built.value,
		sanitizeCommentCreatePayload,
	)
}
