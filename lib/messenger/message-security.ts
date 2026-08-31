/**
 * chats/schedules requires non-empty `nonce`/`sender_ephemeral_key`
 * strings on every recipient bundle even though no E2EE is active
 * anywhere in this app — confirmed via mobile's own
 * lib/messenger/message-security.ts. Transport-only placeholder tokens
 * satisfying a schema constraint, not encryption. Do not wire this into
 * the regular message-send path — the confirmed chats/messages contract
 * this app already uses doesn't require these fields.
 */
function createTransportToken(prefix: string): string {
	const timePart = Date.now().toString(36)
	const randomPart = Math.random().toString(36).slice(2, 12)
	return `${prefix}_${timePart}_${randomPart}`
}

export function resolveSecurityTokens(): { nonce: string; sender_ephemeral_key: string } {
	return {
		nonce: createTransportToken("nonce"),
		sender_ephemeral_key: createTransportToken("sender_ephemeral_key"),
	}
}
