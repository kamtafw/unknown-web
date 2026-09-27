import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { UpstreamError, fetchJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

/**
 * Restore-only proxy for the mobile-created E2EE key backup.
 *
 * GET is the ONLY verb this route may ever implement. Web must never
 * create, replace, rotate, or delete a backup — see
 * E2EE-KEY-BACKUP-WEB-IMPLEMENTATION-1.md §6 and D-E2EE-03. Do not add a
 * PUT or DELETE handler to this file.
 *
 * Hand-rolled rather than `proxyJson` (the usual pattern for a simple GET
 * proxy — see e.g. `chats/unread-count`) so an explicit
 * `Cache-Control: no-store` can be set on the RESPONSE, not just the
 * outbound fetch. This mirrors `auth/generate-2fa-qrcode`, the other route
 * in this app returning similarly sensitive key material — the response
 * must never be preloaded, persistently cached, or logged (guide §2).
 */
export async function GET() {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: "Not authenticated" },
			{ status: 401, headers: { "Cache-Control": "no-store" } },
		)
	}

	try {
		const { status, json } = await fetchJson(`${DJANGO_API_URL}/chats/users/key-backup`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		})
		return NextResponse.json(json, { status, headers: { "Cache-Control": "no-store" } })
	} catch (error) {
		if (error instanceof UpstreamError) {
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: error.status, headers: { "Cache-Control": "no-store" } },
			)
		}
		return NextResponse.json(
			{ success: false, message: "Unexpected server error" },
			{ status: 500, headers: { "Cache-Control": "no-store" } },
		)
	}
}
