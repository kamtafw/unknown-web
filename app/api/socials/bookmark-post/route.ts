import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"
import { BookmarkResponse } from "@/types/api"

export async function POST(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO_API_URL}/socials/post/toggle-bookmark`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})

	const json: BookmarkResponse = await upstream.json()

	if (!upstream.ok || !json.success) {
		return NextResponse.json(json, { status: upstream.status })
	}

	return NextResponse.json(json, { status: 200 })
}
