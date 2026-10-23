import { getAccessToken } from "@/lib/cookies"
import { buildMyEventsRequest } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * My Events (hosted or guest-recorded events, any distance). `filter=my_events`
 * is always sent, for both list and search; omitting it would return ALL events.
 */
export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const { path, query } = buildMyEventsRequest(req.nextUrl.searchParams)

	return proxyJson(`${DJANGO_API_URL}/events/${path}?${query}`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
		cache: "no-store",
	})
}
