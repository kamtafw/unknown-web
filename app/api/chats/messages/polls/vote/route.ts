import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const accessToken = await getAccessToken()
	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const body = await req.json()

	return proxyJson(`${DJANGO_API_URL}/chats/messages/polls/vote`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
}
