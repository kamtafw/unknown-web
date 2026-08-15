/**
 * Core message/chat types.
 *
 * Field names verified 2026-08-12 against the real mobile contract
 * (`hooks/messenger/types.ts`), not just the guide — the guide's shapes
 * were close but not exact (e.g. `reaction_count` vs. the real
 * `reactions_count`). This supersedes the M0 version of this file.
 *
 * Deliberately NOT included here: poll/call/live-specific metadata shapes,
 * schedule types, community types — those belong to their own milestones.
 * E2EE fields (`nonce`, `sender_ephemeral_key`) are also omitted: the guide
 * confirms encryption is non-functional on mobile today, so there's
 * nothing meaningful for the web client to do with them yet.
 */

import { Pkid, Uuid } from "./identity"

export type MessageType =
	| "text"
	| "media"
	| "image"
	| "video"
	| "audio"
	| "voice"
	| "document"
	| "location"
	| "contact"
	| "sticker"
	| "poll"
	| "call"
	| "share"

export type MessageStatus =
	| "queued" // client-side only: optimistic, not yet sent
	| "sending" // client-side only: in flight
	| "sent"
	| "delivered"
	| "read"
	| "seen"
	| "failed" // client-side only: send failed, offer retry

export interface MediaAttachment {
	url: string
	type: "image" | "video" | "audio" | "pdf" | "document"
	fileName?: string
	caption?: string
}

export interface MessageSender {
	id: Uuid
	pkid: Pkid
	username: string
	first_name: string | null
	last_name: string | null
	profile_photo?: string | null
}

/** Payload for `POST chats/messages`. `receiver_id` (PKID) for a direct
 * message, `group_id` for a group message — exactly one should be set. */
export interface SendMessagePayload {
	receiver_id?: Pkid
	group_id?: number
	message_type: MessageType
	content?: string
	media?: MediaAttachment[]
	reply_to?: number
	excluded_users?: Pkid[]
	metadata?: Record<string, unknown>
	nonce?: string
	sender_ephemeral_key?: string
}

/** A message is returned by the server */
export interface Message {
	id: number
	sender: MessageSender
	receiver: MessageSender | null
	group: string | null
	message_type: MessageType
	content: string
	media: MediaAttachment[] | null
	metadata: Record<string, unknown> | null
	deleted?: boolean
	is_pinned: boolean
	collection_id: string
	status: MessageStatus
	reply_to: number | null
	forwarded_from: unknown | null
	is_hidden_by_me?: boolean
	is_deleted_for_all?: boolean
	reactions_count?: number
	views_count?: number
	replies_count?: number
	created_at: string
	updated_at: string
}

/** A row from `GET chats/lists` (and reused for `GET chats/users` search
 * results — same underlying shape, unread/preview fields just default to
 * empty for a user you haven't messaged yet). Field names match the real
 * `ChatListUser` contract, not the guide's paraphrase of it. */
export interface ChatListItem {
	id: Uuid
	pkid: Pkid
	first_name: string | null
	last_name: string | null
	username: string
	profile_photo: string
	unread_count: number
	last_message_preview: string | null
	last_message_time: string | null
	last_message_type?: MessageType | string | null
	is_pinned: boolean
	is_blocked: boolean
	has_blocked_me: boolean
	is_muted: boolean
}

export type ChatListFilter = "all" | "unread" | "favorites"

/**
 * The guide is explicit that pagination is not uniform: chat/group history
 * uses opaque cursors, some secondary endpoints use page numbers. Treat
 * `next` as opaque — it may be a bare cursor or a full URL containing one.
 * Never construct a cursor value yourself.
 */
export interface CursorPage<T> {
	results: T[]
	next: string | null
}
