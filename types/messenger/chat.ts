/**
 * Core message/chat types.
 *
 * Source: messenger-web-implementation-guide.md §"Core message model" and
 * §"One-to-one chats" — this is the highest-confidence, fully-documented
 * part of the Messenger contract, so these types are taken close to
 * verbatim rather than inferred.
 *
 * Deliberately NOT included here: poll/call/live-specific metadata shapes,
 * schedule types, community types. Those belong to their own milestones
 * (M6/M8/M9/M11) and should be added when that milestone starts, using the
 * same evidence-first approach — not speculatively pre-built now.
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

/** Payload for `POST chats/messages`. `receiver_id` (PKID) for a direct
 * message, `group_id` for a group message — exactly one should be set. */
export interface SendMessagePayload {
	receiver_id?: Pkid
	group_id: number
	message_type: MessageType
	content?: string
	media?: MediaAttachment[]
	reply_to?: number
	excluded_users?: Pkid[]
	metadata?: Record<string, unknown>
}

/** A message is returned by the server */
export interface Message {
	id: number
	sender: {
		userUuid: Uuid
		userPkid: Pkid
		displayName: string
		avatarUrl: string | null
	}
	message_type: MessageType
	content: string | null
	media: MediaAttachment[] | null
	status: MessageStatus
	collection_id: string
	reply_to: number | null
	metadata: Record<string, unknown> | null
	reaction_count: number
	reply_count: number
	created_at: string
	updated_at: string
}

/** A row from `GET chats/lists`. */
export interface ChatListItem {
	userUuid: Uuid
	userPkid: Pkid
	displayName: string
	username: string
	avatarUrl: string | null
	unreadCount: number
	lastMessagePreview: string | null
	lastMessageType: MessageType | null
	lastMessageAt: string | null
	isPinned: boolean
	isBlocked: boolean
	isMuted: boolean
	isReverseBlocked: boolean
}

export type ChatListFilter = "all" | "unread" | "pinned"

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

/** Local-only outbox entry for the optimistic send flow described in the
 * guide (§"Sending a message"). Never sent to the server as-is. */
export interface OutboxMessage {
	localId: string
	payload: SendMessagePayload
	status: Extract<MessageStatus, "queued" | "sending" | "failed">
	createdAt: string
}
