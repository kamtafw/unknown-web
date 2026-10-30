import { getAccessToken } from "@/lib/cookies"
import { envelope, fetchSanitizedGet, unauthenticated } from "@/lib/events/bff"
import { parsePageParams, sanitizeLiveParticipantsPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }

const ROLES = new Set(["host", "co_host", "speaker", "listener"])

function parseSessionId(value: string): number | null {
	if (!/^[1-9]\d*$/.test(value)) return null
	const id = Number(value)
	return Number.isSafeInteger(id) ? id : null
}

/**
 * One page of the live-session roster. Only page, limit and the documented optional role filter
 * are forwarded. Session authorization is decided by Django; upstream 403/404 responses pass
 * through unchanged. Successful participant/user objects are allow-listed before reaching JS.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { sessionId: rawId } = await params
	const sessionId = parseSessionId(rawId)
	if (sessionId === null) return envelope(404, "Live session not found.", "not_found")

	const role = req.nextUrl.searchParams.get("role")
	if (role !== null && !ROLES.has(role)) {
		return envelope(400, "Invalid participant role", "invalid_participant_role")
	}

	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	const query = new URLSearchParams({ page: String(page), limit: String(limit) })
	if (role) query.set("role", role)

	return fetchSanitizedGet(
		DJANGO_API_URL + "/live/sessions/" + sessionId + "/participants?" + query.toString(),
		token,
		sanitizeLiveParticipantsPayload,
	)
}
