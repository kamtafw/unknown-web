import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/${id}/statuses/viewers`, {
		method: "GET",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
	})
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/statuses/${id}/view`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
	})
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const body = await req.json()
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/statuses/${id}/update`, {
		method: "PATCH",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()
	if (!accessToken)
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

	return proxyJson(`${DJANGO_API_URL}/chats/statuses/${id}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
	})
}
