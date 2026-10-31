import { getAccessToken } from "@/lib/cookies"
import { fetchSanitizedGet, unauthenticated } from "@/lib/events/bff"
import { parsePageParams } from "@/lib/events/server"
import { isLiveSessionId, sanitizeLiveSessionCommentsPayload } from "@/lib/events/live-server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }

function parseSessionId(value: string): number | null {
	if (!/^\\d+$/.test(value)) return null
	const id = Number(value)
	return isLiveSessionId(id) ? id : null
}

/** Live-session comments, distinct from event discussion comments. Only page and limit are forwarded. */
export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { sessionId: rawId } = await params
	const sessionId = parseSessionId(rawId)
	if (sessionId === null) return Response.json(
		{ success: false, status_code: 404, message: "Live session not found", code: "not_found", errors: null },
		{ status: 404 },
	)

	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	return fetchSanitizedGet(
		`${DJANGO_API_URL}/live/sessions/${sessionId}/comments/list?page=${page}&limit=${limit}`,
		token,
		sanitizeLiveSessionCommentsPayload,
	)
}
