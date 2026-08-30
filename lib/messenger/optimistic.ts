/**
 * Optimistic messages are represented as real `Message` objects with a
 * synthetic negative `id`, injected straight into the history query cache
 * (guide's recommended "Basic" tier: TanStack Query cache + in-memory
 * outbox, no IndexedDB — see the M0 decision to keep persistence minimal
 * for M1). Real server IDs are always positive, so `id < 0` is a safe,
 * simple discriminator — no separate outbox type needed anywhere
 * downstream.
 */

import { Message, MessageSender, MessageStatus, SendMessagePayload } from "@/types/messenger"

let counter = 0

export function createOptimisticMessage(
	payload: SendMessagePayload,
	sender: MessageSender,
	replyingTo?: Message | null,
): Message {
	counter -= 1
	return {
		id: counter,
		sender,
		receiver: null,
		group: payload.group_id ? String(payload.group_id) : null,
		message_type: payload.message_type,
		content: payload.content ?? "",
		media: payload.media ?? null,
		metadata: payload.metadata ?? null,
		is_pinned: false,
		is_deleted_for_all: false,
		is_hidden_by_me: false,
		collection_id: "",
		status: "queued",
		reply_to: replyingTo
			? {
					id: replyingTo.id,
					sender_id: replyingTo.sender.id,
					content: replyingTo.content,
					message_type: replyingTo.message_type,
					created_at: replyingTo.created_at,
				}
			: null,
		forwarded_from: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
}

export function isOptimisticMessage(message: Pick<Message, "id">): boolean {
	return message.id < 0
}

export function withStatus(message: Message, status: MessageStatus): Message {
	return { ...message, status }
}

/**
 * Orders a mixed list of real (positive-id) and optimistic (negative-id)
 * messages: real messages sort by id ascending; optimistic ones always
 * sort after every real message and, among themselves, by send order. A
 * plain numeric sort puts negative ids FIRST — the exact bug where a
 * just-sent message appears at the top instead of the bottom until the
 * server confirms it. Shared by use-chat-history.ts and
 * use-group-history.ts — don't reimplement this locally in a new history
 * hook; a second copy is exactly how this regressed once already.
 */
export function compareMessageOrder(
	a: Pick<Message, "id" | "created_at">,
	b: Pick<Message, "id" | "created_at">,
): number {
	const aPending = a.id < 0
	const bPending = b.id < 0
	if (aPending !== bPending) return aPending ? 1 : -1
	if (aPending && bPending) {
		return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
	}
	return a.id - b.id
}
