import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextResponse } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }
type MediaCredentials = { server_url: string; token: string; room: string; identity: string }

function isSessionId(value: string): boolean {
	return /^[A-Za-z0-9_-]{1,128}$/.test(value)
}

function safeUpstreamDiagnostic(value: unknown): string {
	if (!value || typeof value !== "object" || Array.isArray(value)) return "non-JSON error response"
	const body = value as Record<string, unknown>
	const fields = ["message", "detail", "code", "error"]
	const safe: Record<string, string> = {}
	for (const field of fields) {
		const candidate = body[field]
		if (typeof candidate !== "string") continue
		// Never log likely credentials, JWTs, or long opaque values from an upstream error.
		const redacted = candidate
			.replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
			.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[REDACTED_JWT]")
			.replace(/(token|secret|password|authorization)\s*[:=]\s*[^,;\s]+/gi, "$1=[REDACTED]")
			.slice(0, 240)
		safe[field] = redacted
	}
	return Object.keys(safe).length ? JSON.stringify(safe) : "no safe diagnostic fields"
}

function describeResponseShape(value: unknown, depth = 0): unknown {
	if (value === null) return "null"
	if (Array.isArray(value)) {
		return {
			type: "array",
			length: value.length,
			...(value.length > 0 && depth < 2 ? { firstItem: describeResponseShape(value[0], depth + 1) } : {}),
		}
	}
	if (typeof value !== "object") return typeof value
	const body = value as Record<string, unknown>
	return {
		type: "object",
		fields: Object.fromEntries(
			Object.entries(body).map(([key, fieldValue]) => [
				key,
				fieldValue !== null && typeof fieldValue === "object" && depth < 2
					? describeResponseShape(fieldValue, depth + 1)
					: fieldValue === null
						? "null"
						: Array.isArray(fieldValue)
							? "array"
							: typeof fieldValue,
			]),
		),
	}
}

function credentialsFrom(value: unknown): MediaCredentials | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null
	const body = value as Record<string, unknown>
	if (typeof body.server_url !== "string" || !/^wss?:\/\//i.test(body.server_url) ||
		typeof body.token !== "string" || !body.token ||
		typeof body.room !== "string" || !body.room ||
		typeof body.identity !== "string" || !body.identity) return null
	return { server_url: body.server_url, token: body.token, room: body.room, identity: body.identity }
}

/** Development-only bridge for an authenticated listener proof; never create or join a session here. */
export async function POST(_request: Request, { params }: Ctx) {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ message: "Not found" }, { status: 404 })
	}
	const token = await getAccessToken()
	if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
	const { sessionId } = await params
	if (!isSessionId(sessionId)) return NextResponse.json({ message: "Invalid session ID" }, { status: 400 })

	let upstream: Response
	try {
		upstream = await fetch(`${DJANGO_API_URL}/live/sessions/${encodeURIComponent(sessionId)}/media/credentials`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
				"X-Platform": "web",
				"X-App-Version": "1.0.0",
			},
			cache: "no-store",
		})
	} catch {
		return NextResponse.json({ message: "Unable to retrieve media credentials" }, { status: 502 })
	}
	if (!upstream.ok) {
		if (process.env.NODE_ENV !== "production") {
			let diagnostic = "unreadable error response"
			try {
				const body: unknown = await upstream.clone().json()
				diagnostic = safeUpstreamDiagnostic(body)
			} catch {
				// Do not log raw upstream text; it may contain sensitive data.
			}
			console.warn("[livekit-listener-proof] Media credentials upstream failure", {
				sessionId,
				status: upstream.status,
				contentType: upstream.headers.get("content-type")?.slice(0, 100) ?? null,
				diagnostic,
			})
		}
		return NextResponse.json(
			{ message: upstream.status === 403 ? "Access denied" : "Media credentials request failed" },
			{ status: upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502 },
		)
	}
	let json: unknown
	try { json = await upstream.json() } catch {
		if (process.env.NODE_ENV !== "production") {
			console.warn("[livekit-listener-proof] Media credentials response was not valid JSON", {
				sessionId,
				contentType: upstream.headers.get("content-type")?.slice(0, 100) ?? null,
			})
		}
		return NextResponse.json({ message: "Invalid media credentials response" }, { status: 502 })
	}
	if (process.env.NODE_ENV !== "production") {
		// Log field names and value types only; never log credentials, URLs, or raw response values.
		console.info("[livekit-listener-proof] Media credentials response shape", {
			sessionId,
			status: upstream.status,
			shape: describeResponseShape(json),
		})
	}
	const credentials = credentialsFrom(json)
	if (!credentials) return NextResponse.json({ message: "Invalid media credentials response" }, { status: 502 })
	return NextResponse.json(credentials, { headers: { "Cache-Control": "no-store, max-age=0" } })
}
