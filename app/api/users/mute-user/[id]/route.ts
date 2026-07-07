import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	try {
		const { status, json } = await fetchJson(`${DJANGO_API_URL}/users/mute/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${accessToken}` },
		})

		if (status === 204) return NextResponse.json({ success: true }, { status: 200 })
		return NextResponse.json(json, { status })
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 502
		const message = error instanceof UpstreamError ? error.message : "Unmute failed"
		return NextResponse.json({ success: false, message }, { status })
	}
}
