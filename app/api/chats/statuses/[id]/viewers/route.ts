import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET chats/statuses/:id/viewers
 *
 * BUG FIX: this used to live at `app/api/chats/statuses/[id]/route.ts`'s
 * GET handler, which only matches the path `/api/chats/statuses/:id` —
 * one segment short of what `statusApi.viewers` actually calls
 * (`/api/chats/statuses/:id/viewers`). Next.js has no fallback matching
 * for a longer path, so every call 404'd before this route existed. The
 * old handler also proxied to `chats/${id}/statuses/viewers` (id and
 * "statuses" swapped) rather than the correct
 * `chats/statuses/${id}/viewers` — doubly broken, not just misrouted.
 * Net effect: view counts / the viewers sheet have never actually
 * worked. This is a proxy-plumbing fix only; the Django contract itself
 * is unchanged.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/statuses/${id}/viewers`, {
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		cache: "no-store",
	})
}
