import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function POST(req: NextRequest) {
	const formData = await req.formData()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/socials/post/upload/media`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` },
		body: formData,
	})

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
