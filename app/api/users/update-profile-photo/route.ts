import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest) {
	const formData = await req.formData()
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/users/update-profile-photo`, {
		method: "PATCH",
		headers: { Authorization: `Bearer ${accessToken}` },
		body: formData,
	})
}
