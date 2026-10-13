import type { MessageType, Pkid } from "@/types/messenger"
import { resolvePreviewFallbackLabel } from "../preview"
import { getLatestLocalMessageCopy } from "./local-message-store"

function isSameLatestMessage(
	createdAt: number,
	lastMessageTime: string | null,
): boolean {
	if (!lastMessageTime) return false
	const expected = Date.parse(lastMessageTime)
	return Number.isFinite(expected) && createdAt === expected
}

/**
 * Resolves a direct-message list preview without ever exposing the server's
 * preview string. The server response does not include the message envelope,
 * so that string cannot be authenticated or decrypted here.
 *
 * A local plaintext copy is only eligible when its creation timestamp matches
 * the latest message timestamp returned by the list endpoint. Without a
 * message ID in the list contract this is the strongest available freshness
 * check; a future contract may use an explicit latest-message ID instead.
 */
export async function resolveLocalChatPreview(
	accountId: Pkid,
	peerId: Pkid,
	serverPreview: string | null,
	lastMessageTime: string | null = null,
	lastMessageType: MessageType | string | null = null,
): Promise<string> {
	const local = await getLatestLocalMessageCopy(accountId, peerId)

	if (local && isSameLatestMessage(local.createdAt, lastMessageTime)) {
		return local.plaintext || resolvePreviewFallbackLabel(local.messageType)
	}

	// Never return serverPreview: for E2EE direct messages it may be ciphertext.
	// A type-specific label is useful even when the server preview is empty.
	if (serverPreview || lastMessageTime) {
		return lastMessageType
			? resolvePreviewFallbackLabel(lastMessageType)
			: "Encrypted message"
	}

	return ""
}
