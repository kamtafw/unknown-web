import { DJANGO_API_URL } from "@/lib/server-config"
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/cookies"
import { NextResponse } from "next/server"

export async function POST() {
	const refreshToken = await getRefreshToken()

	if (!refreshToken) {
		return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 })
	}

	const upstream = await fetch(`${DJANGO_API_URL}/auth/token/refresh`, {
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
