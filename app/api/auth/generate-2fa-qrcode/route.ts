import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const email = req.nextUrl.searchParams.get("email")
	if (!email)
		return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })

	try {
		const upstream = await fetch(
			`${DJANGO_API_URL}/auth/generate-2fa-qrcode?email=${encodeURIComponent(email)}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
				cache: "no-store",
				signal: AbortSignal.timeout(15000),
			},
		)

		if (!upstream.ok) {
			return NextResponse.json(
				{ success: false, message: "Failed to generate QR code" },
				{ status: upstream.status },
			)
		}

		const buffer = await upstream.arrayBuffer()
		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": upstream.headers.get("content-type") ?? "image/svg+xml",
				"Cache-Control": "no-store",
			},
		})
	} catch (error) {
		const timedOut = error instanceof Error && error.name === "TimeoutError"
		return NextResponse.json(
			{
				success: false,
				message: timedOut ? "Upstream request timed out" : "Failed to generate QR code",
			},
			{ status: timedOut ? 504 : 502 },
		)
	}
}
