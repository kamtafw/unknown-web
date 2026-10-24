import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, fetchOrError, unauthenticated } from "@/lib/events/bff"
import { isEventId } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()
	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()
	const result = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/resources`, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		cache: "no-store",
	})
	if (!result.ok) return result.response
	return NextResponse.json(result.json, { status: result.status })
}
