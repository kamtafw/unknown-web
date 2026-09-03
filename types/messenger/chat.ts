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
 * E2EE fields (`nonce`, `sender_ephemeral_key`) have been added: the
 * backend has set these fields as required when making an API call;
 * these fields currently accept random values as encryption is
 * non-functional today.
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

/** Embedded reply context — NOT a bare id. Confirmed via live payload
 * inspection (2026-08-29): both the POST create-response and the
 * `chat:receive` socket event return this full object. Only the CREATE
 * payload (`SendMessagePayload.reply_to`) is a bare id — that's what's
 * sent to create a reply; this is what comes back describing it. */
export interface MessageReplyTo {
	id: number
	sender_id: Uuid
	content: string
	message_type: MessageType
	created_at: string
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
	is_pinned: boolean
	collection_id: string
	status: MessageStatus
	reply_to: number | null
	forwarded_from: unknown | null
	is_hidden_by_me: boolean
	is_deleted_for_all: boolean
	reactions_count?: number
	emoji_reaction_counts?: EmojiReactionCount[]
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

/**
 * Confirmed via mobile's `useGetUserProfile` (`chats/users/:pkid/profile`).
 * Deliberately not merged into ChatListItem — this is a dedicated fetch,
 * not derivable from list/peer cache (see usePeerProfile's own doc comment
 * on why the list shape stays thin).
 */
export interface MessengerAttachmentMedia {
	url: string
	type: "image" | "video" | "audio" | "document" | string
	caption?: string
}

export interface MessengerAttachment {
	id: number
	message_type: string
	attachment_type: "media" | "doc" | "link" | string
	media: MessengerAttachmentMedia[] | null
	content: string
	created_at: string
}

export interface MessengerUserProfile {
	user: {
		id: Uuid
		pkid: Pkid
		username: string
		first_name: string
		last_name: string
		email: string
		phone_number: string
		profile_photo: string
		is_blocked?: boolean
		has_blocked_me?: boolean
	}
	attachments: MessengerAttachment[]
	attachments_count: number
	size?: string | null
	total_size?: number | null
}

export interface UserAttachmentsData {
	total_size?: number | null
	metadata: { next: string | null; previous: string | null }
	results: MessengerAttachment[]
}

export type ReportUserReason =
	"misuse_of_the_platform" | "bullying_or_harassment" | "violation_of_community_rules" | "other"

/** Confirmed via mobile's `useReportUser` (`chats/users/:pkid/report`). */
export interface ReportUserPayload {
	reason: ReportUserReason
	description?: string
	block_and_delete: boolean
}

export interface EmojiReactionCount {
	emoji: string
	count: number
	/** String pkids of users who reacted with this emoji — lets us tell a
	 * new reaction apart from a switch or toggle-off so optimistic counts
	 * stay correct. */
	actor_ids?: string[]
}

/** `GET chats/messages/:id/reactions` response row — 1:1 only, confirmed
 * endpoint but mobile never built UI on it; group has no equivalent, see
 * `emoji_reaction_counts.actor_ids` instead */
export interface MessageReaction {
	id: number
	user: MessageSender
	emoji: string
	created_at: string
}
