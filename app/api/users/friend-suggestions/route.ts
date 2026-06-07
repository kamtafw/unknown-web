import { DJANGO_API_URL } from "@/lib/server-config"
import { getAccessToken } from "@/lib/cookies"
import { NextResponse } from "next/server"

export async function GET() {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO_API_URL}/users/friend-suggestions`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})

	const json = await upstream.json()

	return NextResponse.json(json, { status: upstream.status })
}
