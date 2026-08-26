import type { Group, Pkid } from "@/types/messenger"

export interface GroupComposerState {
	canSend: boolean
	reason: "ok" | "paused" | "not-admin"
}

/**
 * Derives composer send-capability from the group + current user's pkid.
 *
 * CONFIRMED (mobile, group-chat/[id].tsx):
 *   isAdmin = group.created_by.pkid === currentUserPkid
 *             || group.member_preview.some(m => m.pkid === currentUserPkid && m.role === "admin")
 *   canSendMessages = isAdmin || group.can_members_send_messages !== false
 *
 * UNRESOLVED (flagged, not yet verified against the live backend): mobile's
 * reference implementation does NOT gate sending on `is_paused` at all —
 * pause is wired up purely as an admin settings toggle, never consulted by
 * canSendMessages. Whether pause overrides admin capability on the real
 * backend is unknown.
 *
 * DEFAULT TAKEN HERE, deliberately conservative and isolated to one branch:
 * `is_paused` blocks EVERYONE, including admins, until verified otherwise.
 * An admin momentarily blocked in the UI when the real rule allows them
 * through is a smaller problem than an admin hitting a confusing rejected
 * send. Flip only the `is_paused` branch below once confirmed — nothing
 * else here should need to move.
 */
export function deriveGroupComposerState(group: Group, currentUserPkid: Pkid): GroupComposerState {
	const isAdmin =
		group.created_by.pkid === currentUserPkid ||
		group.member_preview.some((m) => m.pkid === currentUserPkid && m.role === "admin")

	if (group.is_paused) {
		return { canSend: false, reason: "paused" }
	}
	if (!isAdmin && group.can_members_send_messages === false) {
		return { canSend: false, reason: "not-admin" }
	}
	return { canSend: true, reason: "ok" }
}
