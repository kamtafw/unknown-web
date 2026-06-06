import { getAccessToken } from "@/lib/cookies"
import { NextRequest, NextResponse } from "next/server"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function PATCH(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/users/change-username`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
