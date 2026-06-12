import { setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	const upstream = await fetch(`${DJANGO_API_URL}/auth/verify-totp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json = await upstream.json()

	if (!upstream.ok || !json.success) {
		return NextResponse.json(json, { status: upstream.status })
	}

	const { access_token, refresh_token, user } = json.data

	await setAuthCookies(access_token, refresh_token)

	return NextResponse.json(
		{ success: true, message: json.message, data: { user } },
		{ status: 200 },
	)
}
