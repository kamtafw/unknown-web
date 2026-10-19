import { getAccessToken } from "@/lib/cookies"
import { buildAddressBody } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Optional display address for the discovery location label.
 *
 * The address is cosmetic, so an upstream failure (geocoder error, 4xx/5xx,
 * timeout) is returned as HTTP 200 with `success: false`. Otherwise the shared
 * axios interceptor would raise a global "network error" / "unavailable"
 * toast over a label nobody asked for. An expired session (401) is still
 * passed through so the interceptor can refresh it.
 */
export async function POST(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const body = await req.json().catch(() => null)
	const built = buildAddressBody(body)
	if (!built.ok) {
		return NextResponse.json(
			{ success: false, status_code: 400, message: built.message, code: built.code, errors: null },
			{ status: 400 },
		)
	}

	try {
		const { status, json } = await fetchJson(`${DJANGO_API_URL}/events/my-location`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(built.value),
			timeoutMs: 10000,
		})

		if (status === 401) return NextResponse.json(json, { status })
		if (status >= 400) {
			return NextResponse.json({ success: false, status_code: status, data: null }, { status: 200 })
		}
		return NextResponse.json(json, { status })
	} catch (error) {
		const status = error instanceof UpstreamError ? error.status : 500
		return NextResponse.json({ success: false, status_code: status, data: null }, { status: 200 })
	}
}
