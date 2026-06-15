import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const upstream = await fetch(`${DJANGO_API_URL}/users/accounts/${id}`, {
		method: "PATCH",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()

	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	const upstream = await fetch(`${DJANGO_API_URL}/users/social/${id}/unlink`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (upstream.status === 204) return NextResponse.json({ success: true }, { status: 200 })

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
