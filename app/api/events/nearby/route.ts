import { getAccessToken } from "@/lib/cookies"
import { buildNearbyQuery } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Nearby-only discovery. The 25 km radius is pinned in `buildNearbyQuery`;
 * a client-supplied `radius_km` is ignored. This is the only discovery route.
 */
export async function GET(req: NextRequest) {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	const built = buildNearbyQuery(req.nextUrl.searchParams)
	if (!built.ok) {
		return NextResponse.json(
			{
				success: false,
				status_code: 400,
				message: built.message,
				code: built.code,
				errors: null,
			},
			{ status: 400 },
		)
	}

	return proxyJson(`${DJANGO_API_URL}/events/location/nearby?${built.value}`, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
		cache: "no-store",
	})
}
