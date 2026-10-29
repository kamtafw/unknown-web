import { getAccessToken } from "@/lib/cookies"
import { envelope, eventNotFound, fetchOrError, readJsonBody, unauthenticated } from "@/lib/events/bff"
import { isEventId } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/** Join an event before requesting live media credentials. The backend remains authoritative. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const token = await getAccessToken()
  if (!token) return unauthenticated()

  const { eventId } = await params
  if (!isEventId(eventId)) return eventNotFound()

  let body: { passcode?: string } = {}
  if (req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    const parsed = await readJsonBody(req)
    if (!parsed.ok) return parsed.response
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return envelope(400, "Invalid join request", "invalid_join_request")
    }
    const input = parsed.value as Record<string, unknown>
    if (input.passcode !== undefined && (typeof input.passcode !== "string" || !/^\d{4}$/.test(input.passcode))) {
      return envelope(400, "The passcode must be exactly 4 digits", "invalid_passcode")
    }
    body = input.passcode === undefined ? {} : { passcode: input.passcode as string }
  } else if (req.headers.has("content-type")) {
    return envelope(415, "Unsupported content type", "unsupported_media_type")
  }

  const result = await fetchOrError(`${DJANGO_API_URL}/events/${eventId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!result.ok) return result.response

  // Log only response keys and value types in development; never log passcodes or response values.
  if (process.env.NODE_ENV !== "production") {
    const describe = (input: unknown, depth = 0): unknown => {
      if (input === null) return "null"
      if (Array.isArray(input)) return "array"
      if (typeof input !== "object") return typeof input
      if (depth >= 2) return "object"
      return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, child]) => [
        key,
        child !== null && typeof child === "object" ? describe(child, depth + 1) : child === null ? "null" : typeof child,
      ]))
    }
    console.info("[events-join] Upstream response shape", {
      eventId,
      status: result.status,
      shape: describe(result.json),
    })
  }

  // Admission failures are expected domain responses (for example, an incorrect passcode),
  // not malformed success responses. Preserve the backend status and error envelope.
  if (result.status >= 400) {
    return NextResponse.json(result.json, { status: result.status })
  }

  const responseBody = result.json
  if (
    result.status < 200 ||
    result.status >= 300 ||
    !responseBody ||
    typeof responseBody !== "object" ||
    Array.isArray(responseBody) ||
    (responseBody as Record<string, unknown>).success !== true ||
    !(responseBody as Record<string, unknown>).data ||
    typeof (responseBody as Record<string, unknown>).data !== "object" ||
    Array.isArray((responseBody as Record<string, unknown>).data)
  ) {
    return envelope(502, "Upstream returned an unexpected join response", "invalid_upstream_response")
  }
  return NextResponse.json(responseBody, { status: result.status })
}
