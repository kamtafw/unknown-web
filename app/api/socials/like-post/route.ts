import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"
import { LikeResponse } from "@/types/api"

const DJANGO = process.env.DJANGO_API_URL ?? "https://dev.appscombo.org/api/v1"

export async function POST(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/socials/post/like-post`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})

	const json: LikeResponse = await upstream.json()

	if (!upstream.ok || !json.success) {
		return NextResponse.json(json, { status: upstream.status })
	}

	return NextResponse.json(json, { status: 200 })
}
