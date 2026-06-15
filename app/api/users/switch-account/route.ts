import { getAccessToken, setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { ApiResponse, FullUser } from "@/types/api"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const upstream = await fetch(`${DJANGO_API_URL}/users/switch-account`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json = await upstream.json()
	if (!upstream.ok || !json.success) return NextResponse.json(json, { status: upstream.status })

	const { access_token, refresh_token } = json.data
	await setAuthCookies(access_token, refresh_token)

	const meRes = await fetch(`${DJANGO_API_URL}/users/me`, {
		headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
	})
	const meJson: ApiResponse<FullUser> = await meRes.json()

	if (!meRes.ok || !meJson.success) {
		return NextResponse.json(
			{ success: true, message: json.message, data: { user: json.data.user } },
			{ status: 200 },
		)
	}

	return NextResponse.json(
		{ success: true, message: json.message, data: { user: meJson.data } },
		{ status: 200 },
	)
}
