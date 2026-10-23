import { getAccessToken } from "@/lib/cookies"
import { envelope, unauthenticated } from "@/lib/events/bff"
import { buildRsvpBody } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest } from "next/server"

/**
 * Record or replace the caller's RSVP. Independent of joining: it creates no guest row, issues no
 * media access and does not add the event to My events (guide §4.9).
 */
export async function POST(req: NextRequest) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const body = await req.json().catch(() => null)
	const built = buildRsvpBody(body)
	if (!built.ok) return envelope(400, built.message, built.code)

	return proxyJson(`${DJANGO_API_URL}/events/rsvp`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(built.value),
		cache: "no-store",
	})
}
