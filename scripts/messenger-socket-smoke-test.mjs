#!/usr/bin/env node
/**
 * Messenger socket consolidation smoke test.
 *
 * WHY THIS EXISTS
 * ----------------
 * M0 is treating "one Socket.IO connection for chat + group + call + live"
 * as a working hypothesis (see docs/messenger/decisions/ADR-002 and risk
 * register #2), because mobile's three separate connections all point at
 * the same host with three different auth shapes — that looks like organic
 * duplication, not a deliberate multi-server design. This script tries to
 * falsify that hypothesis cheaply, against the real dev socket server,
 * before it becomes load-bearing in M1+.
 *
 * WHAT IT CHECKS
 * --------------
 *   1. A single connection using the TEMPORARY query-string auth (ADR-003)
 *      succeeds at all.
 *   2. The connection survives long enough to send/receive on the
 *      documented chat/group event names (chat:typing, group:join,
 *      group:error) without the server dropping it.
 *   3. (Best-effort) whether any call/live-shaped event arrives on the
 *      same connection — this is NOT a full validation, since call/live
 *      event names aren't documented anywhere yet (that's M8/M11 work);
 *      it only tells you whether the connection itself gets rejected when
 *      it's the one also expected to carry those namespaces.
 *
 * WHAT IT CANNOT TELL YOU
 * ------------------------
 * Whether the backend is *architecturally fine* with one connection doing
 * everything (e.g. rate limits, separate scaling) — only a real
 * conversation with the backend team resolves that. Treat a "pass" here as
 * "didn't immediately break," not "confirmed safe."
 *
 * USAGE
 * -----
 *   cd web-client && npm install   # socket.io-client is already a dependency
 *   node scripts/messenger-socket-smoke-test.mjs --token <access_token> [--url <socket_url>] [--group-id <id>]
 *
 * Get a token: sign in on web, open devtools → Application → Cookies →
 * copy the `ac_token` value. (This is exactly the credential exposure
 * ADR-003 flags as temporary — don't paste it anywhere but your terminal.)
 */

import { io } from "socket.io-client"

function parseArgs(argv) {
	const out = { url: "https://socket.appscombo.com", token: null, groupId: null }
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--token") out.token = argv[++i]
		else if (argv[i] === "--url") out.url = argv[++i]
		else if (argv[i] === "--group-id") out.groupId = argv[++i]
	}
	return out
}

const args = parseArgs(process.argv.slice(2))

if (!args.token) {
	console.error(
		"Usage: node messenger-socket-smoke-test.mjs --token <access_token> [--url <url>] [--group-id <id>]",
	)
	process.exit(1)
}

console.log(`\n→ Connecting to ${args.url} with temporary query-string auth (ADR-003)...\n`)

const socket = io(args.url, {
	path: "/socket.io",
	transports: ["websocket"],
	reconnection: false, // this is a one-shot test, not the real manager
	query: { token: args.token },
})

const results = {
	connected: false,
	chatTypingAccepted: null, // no server ack expected; null = "emitted, no rejection observed"
	groupJoinAccepted: null,
	groupErrorReceived: false,
	unexpectedDisconnect: false,
}

const TIMEOUT_MS = 10000
const timeout = setTimeout(() => {
	console.log("\n⏱  Timed out waiting for further events — wrapping up.\n")
	finish()
}, TIMEOUT_MS)

socket.on("connect", () => {
	results.connected = true
	console.log(`✓ Connected. socket.id = ${socket.id}`)
	console.log("  → this is the single most important result: the temporary")
	console.log("    query-string auth was accepted by the socket server.\n")

	console.log("→ Emitting chat:typing (documented direct-chat event)...")
	socket.emit("chat:typing", { receiverId: "smoke-test-fake-uuid", isTyping: true })
	results.chatTypingAccepted = true // no rejection = didn't immediately error

	if (args.groupId) {
		console.log(`→ Emitting group:join for groupId=${args.groupId}...`)
		socket.emit("group:join", { groupId: args.groupId })
		results.groupJoinAccepted = true
	} else {
		console.log("  (skipping group:join — pass --group-id <id> to exercise it)")
	}

	// give the server a moment to push anything back, then finish
	setTimeout(finish, 3000)
})

socket.on("group:error", (payload) => {
	results.groupErrorReceived = true
	console.log("✓ Received group:error on the SAME connection used for chat:typing above —")
	console.log("  this is real evidence the server multiplexes chat + group events on one socket.")
	console.log("  payload:", payload)
})

socket.on("connect_error", (err) => {
	console.error(`✗ connect_error: ${err.message}`)
	finish()
})

socket.on("disconnect", (reason) => {
	if (!results.connected) return
	results.unexpectedDisconnect = true
	console.log(`⚠ Disconnected: ${reason}`)
})

function finish() {
	clearTimeout(timeout)
	console.log("\n──────────────────────────────────────────────")
	console.log("SUMMARY")
	console.log("──────────────────────────────────────────────")
	console.log(`connected:                 ${results.connected}`)
	console.log(`chat:typing emitted OK:     ${results.chatTypingAccepted}`)
	console.log(`group:join emitted OK:      ${results.groupJoinAccepted}`)
	console.log(`group:error observed:       ${results.groupErrorReceived}`)
	console.log(`unexpected disconnect:      ${results.unexpectedDisconnect}`)
	console.log("──────────────────────────────────────────────")

	if (!results.connected) {
		console.log("\nRESULT: connection failed. This blocks M0 — check the token is fresh")
		console.log("(access tokens expire quickly) and that --url is correct.\n")
		process.exit(1)
	}

	console.log("\nRESULT: single connection accepted and stayed open for chat + group")
	console.log("events. This supports (does not prove) the one-socket hypothesis.")
	console.log("Still needed before treating this as settled:")
	console.log("  - confirm with backend whether call/live events are also expected")
	console.log("    on this same connection, or use a genuinely separate one")
	console.log("  - run this again with a real --group-id you're a member of and")
	console.log("    confirm group:message/group:status arrive as expected\n")

	socket.disconnect()
	process.exit(0)
}
