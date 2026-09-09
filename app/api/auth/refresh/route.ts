import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

export async function POST() {
	const refreshToken = await getRefreshToken()

	if (!refreshToken) {
		return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 })
	}

	try {
		const { status, json } = await fetchJson<{
			success: boolean
			message: string
			data: { access_token: string; refresh_token?: string }
		}>(`${DJANGO_API_URL}/auth/token/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: refreshToken }),
		})

		if (!json.success) {
			await clearAuthCookies()
			return NextResponse.json({ success: false, message: json.message }, { status })
		}

		const { access_token, refresh_token } = json.data
		await setAuthCookies(access_token, refresh_token ?? refreshToken)

		return NextResponse.json({ success: true }, { status: 200 })
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 502
		const message = error instanceof UpstreamError ? error.message : "Refresh failed"
		await clearAuthCookies()
		return NextResponse.json({ success: false, message }, { status })
	}
}
