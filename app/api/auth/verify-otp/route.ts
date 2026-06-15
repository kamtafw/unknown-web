import { setAuthCookies } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { ApiResponse, FullUser, VerifyOtpResponseData } from "@/types/api"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	const verifyRes = await fetch(`${DJANGO_API_URL}/auth/verify-otp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const verifyJson: ApiResponse<
		VerifyOtpResponseData & { access_token?: string; refresh_token?: string }
	> = await verifyRes.json()

	if (!verifyRes.ok || !verifyJson.success) {
		return NextResponse.json(
			{ success: false, message: verifyJson.message },
			{ status: verifyRes.status },
		)
	}

	const { access_token, refresh_token, otp_token } = verifyJson.data

	// only set cookies when tokens are actually returned (need_tokens: false skips this)
	if (access_token && refresh_token) {
		await setAuthCookies(access_token, refresh_token)

		const meRes = await fetch(`${DJANGO_API_URL}/users/me`, {
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		})

		const meJson: ApiResponse<FullUser> = await meRes.json()

		if (!meRes.ok || !meJson.success) {
			return NextResponse.json(
				{ success: true, message: verifyJson.message, data: { user: null, otp_token } },
				{ status: 200 },
			)
		}

		// return full user + otp_token
		return NextResponse.json(
			{
				success: true,
				message: verifyJson.message,
				data: { user: meJson.data, otp_token },
			},
			{ status: 200 },
		)
	}

	// no tokens (e.g. account-linking OTP flow)
	return NextResponse.json(
		{ success: true, message: verifyJson.message, data: verifyJson.data },
		{ status: 200 },
	)
}
