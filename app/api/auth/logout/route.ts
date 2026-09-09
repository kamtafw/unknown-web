import { clearAuthCookies, getRefreshToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextResponse } from "next/server"

export async function POST() {
	const refreshToken = await getRefreshToken()

	if (refreshToken) {
		fetch(`${DJANGO_API_URL}/auth/logout`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: refreshToken }),
			signal: AbortSignal.timeout(5000),
		}).catch(() => {
			/* intentional: best-effort server-side token invalidation */
		})
	}

	await clearAuthCookies()
	return NextResponse.json({ success: true }, { status: 200 })
}
