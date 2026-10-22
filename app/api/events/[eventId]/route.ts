import { getAccessToken } from "@/lib/cookies"
import { envelope, eventNotFound, fetchOrError, forwardEventWrite, unauthenticated } from "@/lib/events/bff"
import { isEventId, isEventLive, sanitizeDetailsPayload } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, Accept: "application/json" })

/**
 * Event details. Either a full event or a restricted preview, both HTTP 200 upstream; the shape
 * is decided by the normaliser. Other people's contact data and the guest list are removed here,
 * so they never reach the browser.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const result = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/details`, {
		headers: authHeaders(token),
		cache: "no-store",
	})
	if (!result.ok) return result.response
	return NextResponse.json(sanitizeDetailsPayload(result.json), { status: result.status })
}

/** Host-only partial update (PATCH communicates partial intent; the backend accepts both verbs) */
export async function PATCH(req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return forwardEventWrite(req, {
		method: "PATCH",
		url: `${DJANGO_API_URL}/events/${eventId}/update`,
		accessToken: token,
		mode: "update",
	})
}

/**
 * Host-only delete. The backend does not end a running live session first and does not refuse a
 * live delete (guide §4.7, §9), so the BFF looks at the event's current state and refuses while
 * the event or its session is live. This is a best-effort guard for requests that come through
 * the web app: it is not a security boundary (a direct API call bypasses it, and the state can
 * change between the check and the delete), so the backend still needs the same rule (EV-025).
 * If the state cannot be established, nothing is deleted.
 */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	const current = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/details`, {
		headers: authHeaders(token),
		cache: "no-store",
	})
	if (!current.ok) return current.response // fail closed: could not verify
	if (current.status >= 400) return NextResponse.json(current.json, { status: current.status })

	const data = (current.json as { data?: unknown } | null)?.data
	if (!data || typeof data !== "object") {
		return envelope(502, "We couldn't check the event's state, so it wasn't deleted.", "state_unverified")
	}
	if (isEventLive(data)) {
		return envelope(
			409,
			"This event is live. End the live session before deleting it.",
			"event_live",
		)
	}

	const deleted = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/delete`, {
		method: "DELETE",
		headers: authHeaders(token),
		cache: "no-store",
	})
	if (!deleted.ok) return deleted.response
	// a success has no body, and NextResponse.json cannot produce a 204
	if (deleted.status === 204) return new NextResponse(null, { status: 204 })
	return NextResponse.json(deleted.json, { status: deleted.status })
}
