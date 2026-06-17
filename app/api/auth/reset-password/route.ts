import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	console.log("BODY:", JSON.stringify(body))

	const upstream = await fetch(`${DJANGO_API_URL}/auth/reset-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json = await upstream.json()
	return NextResponse.json(json, { status: upstream.status })
}
