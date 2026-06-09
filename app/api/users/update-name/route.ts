import { DJANGO_API_URL } from "@/lib/server-config"
import { getAccessToken } from "@/lib/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO_API_URL}/users/update-name`, {
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
