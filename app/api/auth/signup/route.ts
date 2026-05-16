import { NextRequest, NextResponse } from "next/server"

const DJANGO = process.env.DJANGO_API_URL ?? "https://appscombo.org/api/v1"

export async function POST(req: NextRequest) {
	const body = await req.json()

	console.log("SIGNUP BODY:", JSON.stringify(body))

	const upstream = await fetch(`${DJANGO}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const json = await upstream.json()

	console.log("SIGNUP JSON:", JSON.stringify(json))

	return NextResponse.json(json, { status: upstream.status })
}
