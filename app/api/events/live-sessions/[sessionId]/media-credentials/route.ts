import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextResponse } from "next/server"

type Ctx = { params: Promise<{ sessionId: string }> }
type MediaCredentials = { server_url: string; token: string; room: string; identity: string }

function isSessionId(value: string): boolean {
	return /^[A-Za-z0-9_-]{1,128}$/.test(value)
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
				"X-App-Version": "0.1.0",
			},
			cache: "no-store",
		})
	} catch {
		return NextResponse.json({ message: "Unable to retrieve media credentials" }, { status: 502 })
	}
	if (!upstream.ok) {
		return NextResponse.json(
			{ message: upstream.status === 403 ? "Access denied" : "Media credentials request failed" },
			{ status: upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502 },
		)
	}
	let json: unknown
	try { json = await upstream.json() } catch {
		return NextResponse.json({ message: "Invalid media credentials response" }, { status: 502 })
	}
	const credentials = credentialsFrom(json)
	if (!credentials) return NextResponse.json({ message: "Invalid media credentials response" }, { status: 502 })
	return NextResponse.json(credentials, { headers: { "Cache-Control": "no-store, max-age=0" } })
}
