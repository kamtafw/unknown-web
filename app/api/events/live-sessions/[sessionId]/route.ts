import { getAccessToken } from "@/lib/cookies"
import { envelope, fetchSanitizedGet, unauthenticated } from "@/lib/events/bff"
import { isLiveSessionId, sanitizeLiveSessionRoomPayload } from "@/lib/events/live-server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }

function parseSessionId(value: string): number | null {
	if (!/^\d+$/.test(value)) return null
	const id = Number(value)
	return isLiveSessionId(id) ? id : null
}

/**
 * Reads the attached live-room summary. The BFF deliberately exposes only its id and
 * reaction aggregates; participant, invite and media credentials remain server-side.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { sessionId: rawId } = await params
	const sessionId = parseSessionId(rawId)
	if (sessionId === null) return envelope(404, "Live session not found", "not_found")

	return fetchSanitizedGet(
		`${DJANGO_API_URL}/live/sessions/${sessionId}`,
		token,
		sanitizeLiveSessionRoomPayload,
	)
}
