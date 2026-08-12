import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxies `POST chats/messages` — the HTTP-durable send path per the guide
 * §"Sending a message". The guide is explicit that the socket `chat:send`
 * helper exists on mobile but is NOT the active send path; do not switch
 * this to a socket emit without an explicit backend confirmation.
 */
export async function POST(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/chats/messages`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
}
