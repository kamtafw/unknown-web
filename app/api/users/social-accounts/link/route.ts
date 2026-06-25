import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const linkUrl = req.nextUrl.searchParams.get("linkUrl")

	if (!linkUrl || !linkUrl.startsWith(DJANGO_API_URL)) {
		return NextResponse.json(
			{ success: false, message: "Missing or invalid login URL" },
			{ status: 400 },
		)
	}

	const upstream = await fetch(linkUrl, {
		headers: { Authorization: `Bearer ${accessToken}` },
		redirect: "manual",
	})

	// capture the OAuth provider redirect URL without following it server-side
	if (upstream.status === 301 || upstream.status === 302) {
		const redirectUrl = upstream.headers.get("location")
		if (redirectUrl) {
			return NextResponse.json(
				{ success: true, status_code: 200, message: null, data: { redirect_url: redirectUrl } },
				{ status: 200 },
			)
		}
	}

	// some implementations return the URL in the body
	try {
		const json = await upstream.json()
		const url = json.data?.redirect_url ?? json.data?.url ?? json.data?.authorization_url ?? null
		if (url) {
			return NextResponse.json(
				{ success: true, status_code: 200, message: null, data: { redirect_url: url } },
				{ status: 200 },
			)
		}
		return NextResponse.json(json, { status: upstream.status })
	} catch {
		return NextResponse.json(
			{ success: false, message: "Unexpected response from server" },
			{ status: 502 },
		)
	}
}
