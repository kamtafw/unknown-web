import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET chats/groups/:group_id/messages/:message_id/replies?order=asc|desc
 *
 * Read-only proxy for a group message's thread replies (new backend
 * contract, 2026-09-04 — see types/messenger/group.ts's
 * GroupThreadRepliesData doc comment for what's actually confirmed vs.
 * assumed about the response shape). Sending a reply does NOT get its
 * own route: it reuses the existing `POST /api/chats/messages` route
 * with `group_id` + `reply_to` set, exactly like every other group
 * send — see hooks/messenger/use-send-group-message.ts.
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string; messageId: string }> },
) {
	const { id, messageId } = await params
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(
		`${DJANGO_API_URL}/chats/groups/${id}/messages/${messageId}/replies${req.nextUrl.search}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		},
	)
}
