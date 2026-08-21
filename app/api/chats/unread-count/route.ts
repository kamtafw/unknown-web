import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

/** Proxies `GET chats/lists/unread-count` — the fallback total-unread
 * endpoint from the guide §4, used for the TopBar Messenger-icon badge. */
export async function GET() {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/chats/lists/unread-count`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})
}
