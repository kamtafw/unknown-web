import { getAccessToken } from "@/lib/cookies"
import { envelope, fetchSanitizedPost, readJsonBody, unauthenticated } from "@/lib/events/bff"
import {
	buildLiveSessionReactionBody,
	isLiveSessionId,
	sanitizeLiveSessionReactionPayload,
} from "@/lib/events/live-server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }

function parseSessionId(value: string): number | null {
	if (!/^\d+$/.test(value)) return null
	const id = Number(value)
	return isLiveSessionId(id) ? id : null
}

/** Creates one of the six mobile-observed live reaction types; backend errors, including 429, pass through. */
export async function POST(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { sessionId: rawId } = await params
	const sessionId = parseSessionId(rawId)
	if (sessionId === null) return envelope(404, "Live session not found", "not_found")

	const body = await readJsonBody(req)
	if (!body.ok) return body.response
	const built = buildLiveSessionReactionBody(body.value)
	if (!built.ok) return envelope(400, built.message, built.code)

	return fetchSanitizedPost(
		`${DJANGO_API_URL}/live/sessions/${sessionId}/reactions`,
		token,
		built.value,
		sanitizeLiveSessionReactionPayload,
	)
}
