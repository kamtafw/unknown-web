import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxies `GET chats/users?page=1&limit=20&search=<text>` — confirmed via
 * `hooks/messenger/use-chats.ts`'s `useSearchUsers` on mobile, not in the
 * guide. Backs the M1 "Start New Chat" search dialog (product decision:
 * +Create → search/select a user → open a direct conversation).
 */
export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const search = req.nextUrl.searchParams.get("search") ?? ""
	const params = new URLSearchParams({ page: "1", limit: "20", search })

	return proxyJson(`${DJANGO_API_URL}/chats/users?${params.toString()}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})
}
