import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxies `GET chats/lists?status=all|unread|pinned&search=<text>&cursor=<cursor>`
 * per the implementation guide §4. Query params pass through unchanged —
 * the client is the source of truth for filter/search/cursor state.
 */
export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/chats/lists${req.nextUrl.search}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})
}
