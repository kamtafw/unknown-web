import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params
	if (!/^\d+$/.test(id))
		return NextResponse.json({ message: "Not found" }, { status: 404 })
	const token = await getAccessToken()
	if (!token)
		return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
	return proxyJson(`${DJANGO_API_URL}/users/connections/respond/${id}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(await req.json()),
	})
}
