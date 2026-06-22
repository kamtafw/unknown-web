import { clearAuthCookies, getRefreshToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

export async function POST() {
	const refreshToken = await getRefreshToken()

	if (refreshToken) {
		// fire-and-forget with a short timeout — local logout proceeds regardless
		fetchJson(`${DJANGO_API_URL}/auth/logout/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: refreshToken }),
			timeoutMs: 5000,
		}).catch(() => {
			/* intentional */
		})
	}

	await clearAuthCookies()
	return NextResponse.json({ success: true }, { status: 200 })
}
