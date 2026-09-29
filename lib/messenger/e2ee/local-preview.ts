import type { Pkid } from "@/types/messenger"
import { getLatestLocalMessageCopy } from "./local-message-store"

export async function resolveLocalChatPreview(
	accountId: Pkid,
	peerId: Pkid,
	serverPreview: string | null,
): Promise<string> {
	const local = await getLatestLocalMessageCopy(accountId, peerId)

	if (local) {
		return local.plaintext
	}

	/**
	 * We deliberately do not return serverPreview here.
	 *
	 * The server preview may be encrypted ciphertext and the chat-list
	 * endpoint does not provide enough of the envelope to decrypt it.
	 */
	return serverPreview ? "Encrypted message" : ""
}
