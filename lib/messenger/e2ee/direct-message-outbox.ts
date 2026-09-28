import type { MediaAttachment, MessageType, Pkid } from "@/types/messenger"

export interface DirectMessageOutboxEntry {
	localId: number
	accountId: Pkid
	recipientId: Pkid
	messageType: MessageType
	plaintext: string
	media?: MediaAttachment[]
	metadata?: Record<string, unknown>
	replyTo?: number
}

const entries = new Map<number, DirectMessageOutboxEntry>()

export function saveDirectMessageOutboxEntry(entry: DirectMessageOutboxEntry): void {
	entries.set(entry.localId, entry)
}

export function getDirectMessageOutboxEntry(localId: number): DirectMessageOutboxEntry | null {
	return entries.get(localId) ?? null
}

export function removeDirectMessageOutboxEntry(localId: number): void {
	entries.delete(localId)
}

export function clearDirectMessageOutbox(): void {
	entries.clear()
}
