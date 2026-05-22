import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function GET(_req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/users/friend-suggestions`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})

	const json = await upstream.json()

	return NextResponse.json(json, { status: upstream.status })
}
