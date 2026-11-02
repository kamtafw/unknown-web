import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const path = (await params).path.join("/")
	if (!/^(all|follow|mention|birthday)\/alerts$/.test(path))
		return NextResponse.json({ message: "Not found" }, { status: 404 })
	const token = await getAccessToken()
	if (!token)
		return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
	return proxyJson(
		`${DJANGO_API_URL}/notifications/${path}${req.nextUrl.search}`,
		{ headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
	)
}
