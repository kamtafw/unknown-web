import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/cookies"
import { NextRequest, NextResponse } from "next/server"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function POST(_req: NextRequest) {
	const refreshToken = await getRefreshToken()

	if (!refreshToken) {
		return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO}/auth/token/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh: refreshToken }),
	})

	const json = await upstream.json()

	if (!upstream.ok || !json.success) {
		await clearAuthCookies()
		return NextResponse.json({ success: false, message: json.message }, { status: upstream.status })
	}

	const { access_token, refresh_token } = json.data

	await setAuthCookies(access_token, refresh_token ?? refreshToken)

	return NextResponse.json({ success: true }, { status: 200 })
}
