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
		collection_id: "",
		status: "queued",
		reply_to: payload.reply_to ?? null,
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
