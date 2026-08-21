import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
	const { userId } = await params
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/users/${userId}/unpin`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
	})
}
