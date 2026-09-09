/** Mirrors the `getInitials` pattern in components/dashboard/top-bar.tsx —
 * kept as a small Messenger-local copy rather than extracting a shared
 * util, since that file doesn't currently export it and duplicating two
 * lines is cheaper than a cross-cutting refactor for M1. */
export function getInitials(firstName: string | null, lastName: string | null): string {
	const a = (firstName ?? "").charAt(0)
	const b = (lastName ?? "").charAt(0)
	return (a + b || "?").toUpperCase()
}

export function getDisplayName(user: {
	first_name: string | null
	last_name: string | null
	username: string
}): string {
	const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
	return name || user.username
}

/** Minimal shape the conversation header actually needs — deliberately
 * smaller than ChatListItem so it can be satisfied by either real list
 * data or profile rebuilt from message history, without lying about
 * having fields (unread_count, is_pinned, etc.) it doesn't have. */
export interface PeerDisplay {
	id: string
	pkid: number
	first_name: string | null
	last_name: string | null
	username: string
	profile_photo?: string | null
}

/**
 * Fallback for the "peer data disappears on refresh" bug: there's no
 * confirmed UUID-keyed profile endpoint (see use-peer-profile.ts), but
 * every message already carries a full sender/receiver record. If this
 * conversation has any history at all, we can rebuild everything the
 * header needs from it without a new request.
 *
 * Only returns null when the conversation truly has zero messages AND no
 * cached list/primed entry exists — a refreshed, brand-new, message-less
 * conversation. That's the one case genuinely unrecoverable client-side.
 */
export function derivePeerFromMessages(
	messages: Array<{ sender: PeerDisplay; receiver: PeerDisplay | null }>,
	peerUuid: string,
): PeerDisplay | null {
	for (const message of messages) {
		if (message.sender.id === peerUuid) return message.sender
		if (message.receiver?.id === peerUuid) return message.receiver
	}
	return null
}
