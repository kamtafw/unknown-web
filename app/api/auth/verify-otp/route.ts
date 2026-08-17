import { setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { ApiResponse, FullUser, VerifyOtpResponseData } from "@/types/socials/api"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	try {
		const { status, json: verifyJson } = await fetchJson<
			ApiResponse<VerifyOtpResponseData & { access_token?: string; refresh_token?: string }>
		>(`${DJANGO_API_URL}/auth/verify-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})

		if (!verifyJson.success) {
			return NextResponse.json({ success: false, message: verifyJson.message }, { status })
		}

		const { access_token, refresh_token, otp_token } = verifyJson.data

		if (access_token && refresh_token) {
			await setAuthCookies(access_token, refresh_token)

			// best-effort — /users/me failure is non-fatal; client re-fetches on mount
			const meResult = await fetchJson<ApiResponse<FullUser>>(`${DJANGO_API_URL}/users/me`, {
				headers: {
					Authorization: `Bearer ${access_token}`,
					"Content-Type": "application/json",
				},
			}).catch(() => null)

			return NextResponse.json(
				{
					success: true,
					message: verifyJson.message,
					data: {
						user: meResult?.json?.success ? meResult.json.data : null,
						otp_token,
					},
				},
				{ status: 200 },
			)
		}

		// no tokens — account-linking OTP flow, password-reset flow
		return NextResponse.json(
			{ success: true, message: verifyJson.message, data: verifyJson.data },
			{ status: 200 },
		)
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 502
		const message = error instanceof UpstreamError ? error.message : "Verification failed"
		return NextResponse.json({ success: false, message }, { status })
	}
}
