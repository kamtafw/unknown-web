import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

/** Proxies `POST chats/history/:userUuid/seen` — the conversation-level
 * seen call per the guide SN4, distinct from the per-message status PATCH. */
export async function POST(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
	const { uuid } = await params
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/chats/history/${uuid}/seen`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	})
}
