import type { MessageType, Pkid } from "@/types/messenger"
import { resolveEncryptedPreviewFallback, resolvePreviewFallbackLabel } from "../preview"
import { getLatestLocalMessageCopy } from "./local-message-store"

function isSameLatestMessage(
	messageId: number,
	createdAt: number,
	lastMessageTime: string | null,
	lastMessageId: number | null,
): boolean {
	if (lastMessageId !== null) return messageId === lastMessageId
	if (!lastMessageTime) return false
	const expected = Date.parse(lastMessageTime)
	return Number.isFinite(expected) && createdAt === expected
}

/**
 * Resolves a direct-message list preview without ever exposing the server preview.
 * A local plaintext copy is eligible only when its creation timestamp matches
 * the latest message timestamp returned by the list endpoint.
 */
export async function resolveLocalChatPreview(
	accountId: Pkid,
	peerId: Pkid,
	serverPreview: string | null,
	lastMessageTime: string | null = null,
	lastMessageType: MessageType | string | null = null,
	lastMessageId: number | null = null,
): Promise<string> {
	const local = await getLatestLocalMessageCopy(accountId, peerId)

	if (local && isSameLatestMessage(local.messageId, local.createdAt, lastMessageTime, lastMessageId)) {
		return local.plaintext || resolvePreviewFallbackLabel(local.messageType)
	}

	// The server preview may be ciphertext; never return it.
	return resolveEncryptedPreviewFallback(Boolean(serverPreview || lastMessageTime), lastMessageType) ?? ""
}
