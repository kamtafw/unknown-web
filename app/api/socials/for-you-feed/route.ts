import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"
import { FeedResponse } from "@/types/api"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/socials/posts/feed${req.nextUrl.search}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})

	const json: FeedResponse = await upstream.json()

	return NextResponse.json(json, { status: upstream.status })
}
