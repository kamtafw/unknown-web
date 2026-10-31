import { getAccessToken } from "@/lib/cookies"
import { envelope, eventNotFound, fetchOrError, unauthenticated } from "@/lib/events/bff"
import { isEventId } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextResponse } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * Persist the current viewer's departure from an event (guide §4.9).
 * This is distinct from socket-room departure and from ending the host's broadcast.
 * The guest record remains on the backend; the backend owns all admission and role rules.
 */
export async function POST(_req: Request, { params }: Ctx) {
  const token = await getAccessToken()
  if (!token) return unauthenticated()

  const { eventId } = await params
  if (!isEventId(eventId)) return eventNotFound()

  const result = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/leave`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })
  if (!result.ok) return result.response
  if (result.status >= 400) return NextResponse.json(result.json, { status: result.status })

  const body = result.json
  if (
    result.status !== 200 ||
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    (body as Record<string, unknown>).success !== true ||
    !(body as Record<string, unknown>).data ||
    typeof (body as Record<string, unknown>).data !== "object" ||
    Array.isArray((body as Record<string, unknown>).data) ||
    Object.keys((body as Record<string, unknown>).data as Record<string, unknown>).length !== 0
  ) {
    return envelope(502, "Upstream returned an unexpected leave response", "invalid_upstream_response")
  }

  const response = body as Record<string, unknown>
  return NextResponse.json({
    success: true,
    ...(typeof response.status_code === "number" ? { status_code: response.status_code } : {}),
    ...(typeof response.message === "string" ? { message: response.message } : {}),
    data: {},
  }, { status: 200 })
}
