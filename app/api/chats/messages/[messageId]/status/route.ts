import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxies `PATCH chats/messages/:messageId/status` per the guide SN4.
 * Called client-side on `chat:receive` (mark delivered) and while the
 * conversation is visible (mark seen) — never assume a socket connection
 * alone means "seen".
 */
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ messageId: string }> },
) {
	const { messageId } = await params
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/chats/messages/${messageId}/status`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
}
