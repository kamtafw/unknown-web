import { DJANGO_API_URL } from "@/lib/server-config"
import { ApiResponse, LoginResponseData } from "@/types/api"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	const upstream = await fetch(`${DJANGO_API_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json: ApiResponse<LoginResponseData> = await upstream.json()

	if (!upstream.ok || !json.success) {
		return NextResponse.json(json, { status: upstream.status })
	}

	return NextResponse.json(json, { status: 200 })
}
