/**
 * Socket authentication abstraction.
 *
 * See docs/messenger/decisions/ADR-003-temporary-socket-auth.md for the
 * full context. Short version: the production mechanism (cookie-based
 * handshake vs. a short-lived credential) is not yet confirmed by the
 * backend, so this module exists specifically so that decision can be
 * swapped in later by changing ONE export — `socketAuthProvider` — without
 * touching socket-manager.ts or any feature hook that consumes it.
 *
 * Nothing outside this file should construct socket connection options by
 * hand (no `io(\`\${url}?token=\${token}\`)` scattered across feature code).
 */

import { apiClient } from "../axios"

/** Shape socket.io-client accepts for `io(url, options)`. Kept minimal —
 * only the two fields any of our candidate mechanisms actually need. */
export interface SocketConnectAuth {
	auth?: Record<string, string>
	query?: Record<string, string>
}

export interface SocketAuthProvider {
	/** Resolve fresh connect options. Called on initial connect AND on every
	 * reconnect attempt after an auth-related failure, so implementations
	 * should not cache a stale credential internally. */
	getConnectAuth(): Promise<SocketConnectAuth>
}

interface SocketCredentialResponse {
	success: boolean
	data?: { token: string }
	message?: string
}

/**
 * TEMPORARY implementation (ADR-003). Fetches the access token via the
 * dev-only BFF route and puts it in the query string, matching the shape
 * `lib/socket/chat-socket.ts` uses on mobile today.
 *
 * Replace this implementation — not its call sites — when the backend
 * confirms the production mechanism.
 */
const temporaryDevSocketAuthProvider: SocketAuthProvider = {
	async getConnectAuth() {
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				"[messenger] using TEMPORARY query-string socket auth (ADR-003) — " +
					"not the confirmed production mechanism",
			)
		}

		const res = await apiClient.get<SocketCredentialResponse>("/api/messenger/socket-credential")
		const token = res.data.data?.token

		if (!token) {
			throw new Error("[messenger] socket credentials fetch returned no token")
		}

		return { query: { token } }
	},
}

/**
 * The single export every feature/socket-manager consumer should use.
 * Swapping the production mechanism in is a one-line change here.
 */
export const socketAuthProvider: SocketAuthProvider = temporaryDevSocketAuthProvider
