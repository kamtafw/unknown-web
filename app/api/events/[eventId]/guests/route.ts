import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchOrError, unauthenticated } from "@/lib/events/bff"
import { isEventId, parsePageParams } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()
	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()
	const { page, limit } = parsePageParams(req.nextUrl.searchParams)
	const query = new URLSearchParams({ page: String(page), limit: String(limit) })
	const result = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/guests?${query}`, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		cache: "no-store",
	})
	if (!result.ok) return result.response
	return NextResponse.json(result.json, { status: result.status })
}
