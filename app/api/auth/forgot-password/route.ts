import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
	const body = await req.json()

	return proxyJson(`${DJANGO_API_URL}/auth/forgot-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})
}
