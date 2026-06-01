import { clearAuthCookies, getRefreshToken } from "@/lib/cookies"
import { NextResponse } from "next/server"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function POST() {
	const refreshToken = await getRefreshToken()

	if (refreshToken) {
		await fetch(`${DJANGO}/auth/logout/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: refreshToken }),
		}).catch(() => {
			/* logout persists even on network failure */
		})
	}

	await clearAuthCookies()
	return NextResponse.json({ success: true }, { status: 200 })
}
