import { getAccessToken,setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson,UpstreamError } from "@/lib/server-fetch"
import { ApiResponse,FullUser } from "@/types/api"
import { NextRequest,NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	try {
		const { status, json } = await fetchJson<{
			success: boolean
			message: string
			data: { access_token: string; refresh_token: string; user: FullUser }
		}>(`${DJANGO_API_URL}/users/switch-account`, {
			method: "POST",
			headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!json.success) return NextResponse.json(json, { status })

		const { access_token, refresh_token } = json.data
		await setAuthCookies(access_token, refresh_token)

		// best-effort — fall back to the user shape already in the switch response
		const meResult = await fetchJson<ApiResponse<FullUser>>(`${DJANGO_API_URL}/users/me`, {
			headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
		}).catch(() => null)

		return NextResponse.json(
			{
				success: true,
				message: json.message,
				data: { user: meResult?.json?.success ? meResult.json.data : json.data.user },
			},
			{ status: 200 },
		)
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 502
		const message = error instanceof UpstreamError ? error.message : "Account switch failed"
		return NextResponse.json({ success: false, message }, { status })
	}
}
