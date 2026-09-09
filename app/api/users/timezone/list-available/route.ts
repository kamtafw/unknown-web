import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const locale = req.nextUrl.searchParams.get("locale") ?? "en"

	return proxyJson(`${DJANGO_API_URL}/users/timezone/list-available?locale=${locale}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
}
