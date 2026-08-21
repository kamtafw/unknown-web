import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/** Proxies `POST chats/messages/:messageId` — { delete_type: "self" | "both" }.
 * sent as both body and query param. */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ messageId: string }> },
) {
	const { messageId } = await params
	const body = await req.json()
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const qs = new URLSearchParams({ delete_type: body.delete_type }).toString()
	return proxyJson(`${DJANGO_API_URL}/chats/messages/${messageId}?${qs}`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})
}
