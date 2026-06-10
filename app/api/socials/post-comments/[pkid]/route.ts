import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"

export async function GET(req: NextRequest, { params }: { params: Promise<{ pkid: number }> }) {
	const { pkid } = await params
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const page = req.nextUrl.searchParams.get("page") ?? "1"

	const upstream = await fetch(`${DJANGO_API_URL}/socials/post/comment/list/${pkid}?page=${page}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
