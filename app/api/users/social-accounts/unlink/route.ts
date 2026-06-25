import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const unlinkUrl = req.nextUrl.searchParams.get("unlinkUrl")

	if (!unlinkUrl || !unlinkUrl.startsWith(DJANGO_API_URL)) {
		return NextResponse.json(
			{ success: false, message: "Missing or invalid unlink URL" },
			{ status: 400 },
		)
	}

	const upstream = await fetch(unlinkUrl, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (upstream.status === 204) return NextResponse.json({ success: true }, { status: 200 })

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
