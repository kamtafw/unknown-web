import { getAccessToken } from "@/lib/cookies"
import { NextResponse } from "next/server"

/**
 * TEMPORARY — see docs/messenger/decisions/ADR-003-temporary-socket-auth.md
 *
 * The web app's normal HTTP auth model never exposes the access token to
 * client JS (it lives in the httpOnly `ac_token` cookie and every backend
 * call is proxied server-side — see lib/cookies.ts, lib/server-fetch.ts).
 *
 * Socket.IO connects directly from the browser, and the production auth
 * contract for that (cookie-based handshake vs. a short-lived credential)
 * is not yet confirmed by the backend team. Until it is, this route
 * deliberately breaks the "browser never sees the token" rule for the sole
 * purpose of unblocking Messenger realtime development, matching the
 * query-string pattern the guide describes as mobile's current
 * compatibility behavior.
 *
 * Do not:
 *   - call this from anywhere other than lib/messenger/socket-auth.ts
 *   - treat its existence as evidence the production mechanism is settled
 *   - extend this pattern to any other feature
 *
 * Replace: once the backend confirms a production mechanism, delete this
 * route (or repurpose it if the backend actually wants a minted ticket —
 * TBD, not decided here) and update only lib/messenger/socket-auth.ts.
 * Nothing else in Messenger should need to change.
 */
export async function GET() {
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return NextResponse.json({ success: true, data: { token: accessToken } })
}
