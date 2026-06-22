import { setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	try {
		const { status, json } = await fetchJson<{
			success: boolean
			message: string
			data: { access_token: string; refresh_token: string; user: unknown }
		}>(`${DJANGO_API_URL}/auth/verify-totp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!json.success) return NextResponse.json(json, { status })

		const { access_token, refresh_token, user } = json.data
		await setAuthCookies(access_token, refresh_token)

		return NextResponse.json(
			{ success: true, message: json.message, data: { user } },
			{ status: 200 },
		)
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 502
		const message = error instanceof UpstreamError ? error.message : "Verification failed"
		return NextResponse.json({ success: false, message }, { status })
	}
}
