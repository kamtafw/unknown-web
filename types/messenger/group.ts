/**
 * Group (M3) types.
 *
 * Deliberately NOT included on `Group`: `community_id`,
 * `enable_moderation_rules`, `keywords`, `objective`, `group_severity` —
 * these belong to Communities and AI Moderation, separate Tier 3
 * milestones. To be added when those milestones start, grounded in their own
 * confirmed contracts — not speculatively here.
 *
 * Reactions (`reactions_count`, `emoji_reaction_counts`, `group:reaction`)
 * are confirmed to exist on the wire but are explicitly out of M3 scope —
 * not modeled here yet.
 */

import type { MediaAttachment, MessageStatus, MessageType } from "./chat"
import type { Pkid, Uuid } from "./identity"

export type GroupRole = "admin" | "moderator" | "member"

/**
 * Confirmed via mobile's `GroupMember extends MessengerUser` — note
 * mobile's `MessengerUser` has non-nullable `first_name`/`last_name`,
 * unlike this app's `MessageSender`. Deliberately NOT reusing this repo's
 * existing (currently unused) `types/messenger/identity.ts` `MessengerUser`
 * — its shape (`userUuid`/`userPkid`/`displayName`) doesn't match the
 * confirmed mobile contract, so extending it would silently misrepresent
 * the real payload.
 */
export interface GroupMember {
	id: Uuid
	pkid: Pkid
	username: string
	first_name: string
	last_name: string
	profile_photo: string | null
	role: GroupRole
	is_approved: boolean
	joined_at: string
}

/** Same shape as `GroupMember` — the mobile contract uses a distinct name
 * (`GroupPreviewMember`) for `Group.member_preview` even though the fields
 * are identical. Kept as an alias for contract fidelity; collapse if
 * evidence later shows a genuine divergence. */
export type GroupPreviewMember = GroupMember

/** A row from `GET chats/groups/lists`. No `members_count` here — that
 * only exists on the detail payload (`Group`). */
export interface GroupListItem {
	id: number
	name: string
	icon_url: string
	unread_count: number | null
	last_message_preview: string | null
	last_message_time: string | null
	last_message_type?: MessageType | string | null
	is_paused: boolean
	pause_until: string | null
	is_muted: boolean
}

export interface GroupListData {
	metadata: { next: string | null; previous: string | null }
	groups: GroupListItem[]
}

/** `GET chats/groups/:id`. */
export interface Group {
	id: number
	name: string
	icon_url: string | null
	members_count: number
	admins_count: number
	created_by: {
		id: Uuid
		pkid: Pkid
		username: string
		first_name: string
		last_name: string
		profile_photo: string | null
	}
	can_members_edit_info: boolean
	can_members_add_users: boolean
	can_members_send_messages: boolean
	admin_have_to_approve_new_members: boolean
	is_paused: boolean
	pause_until: string | null
	last_message_preview: string | null
	last_message_time: string | null
	member_preview: GroupPreviewMember[]
	created_at: string
}

/** `GET chats/groups/:id/members`. Page-based (`current`/`total_pages`),
 * NOT cursor-based like history — the guide is explicit that pagination
 * isn't uniform across endpoints; don't "normalize" this to match
 * `CursorPage<T>`. */
export interface GroupMembersData {
	count: number
	total_pages: number
	limit: number
	current: number
	previous: string | null
	next: string | null
	results: GroupMember[]
}

/** Embedded on `GroupMessage.group` — a distinct shape from the 1:1
 * `Message.group` (`string | null`, just the group id). */
export interface GroupInfo {
	id: number
	name: string
	icon_url: string
}

/**
 * A message from `GET chats/groups/:id/history` or the (not-yet-wired)
 * `group:message` socket event. Reuses the shared `MediaAttachment` shape
 * from chat.ts. See `groupMessageToMessage` in
 * `hooks/messenger/use-group-history.ts` for how this is normalized into
 * the shared `Message` shape so `MessageList`/`MessageBubble` don't need a
 * parallel implementation.
 */
export interface GroupMessage {
	id: number
	sender: {
		id: Uuid
		pkid: Pkid
		username: string
		first_name: string | null
		last_name: string | null
		profile_photo?: string | null
	}
	receiver: null
	group: GroupInfo
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
	excluded_users?: Pkid[]
	views_count?: number
	replies_count?: number
	created_at: string
	updated_at: string
}

/**
 * `GET chats/groups/:id/history`.
 *
 * NAMING TRAP — confirmed via mobile's `useGetGroupChatHistory` comment
 * ("same contract as 1:1 chat history... asks for next pages when the
 * user reaches the visual top"): the field that pages toward OLDER
 * messages is called `next` here, whereas 1:1's `ChatHistoryData`
 * (`lib/messenger/api.ts`) uses `previous` for that same role. Do NOT
 * reuse `use-chat-history.ts`'s `getNextPageParam` pattern verbatim —
 * it must read `.next`, not `.previous`, for groups. Getting this
 * backwards silently breaks "load older messages."
 *
 * `message` is present on the real payload with no confirmed purpose
 * (not referenced anywhere in mobile beyond the type declaration) — kept
 * for shape fidelity, not consumed.
 */
export interface GroupChatHistoryData {
	message?: string
	next: string | null
	previous: string | null
	results: GroupMessage[]
}

/**
 * Write-side payload shapes — confirmed, but NOT wired to any hook/UI yet.
 * That's the composer/admin-surfaces slice. Recorded now so the contract
 * doesn't drift between slices.
 *
 * OPEN ITEM for the composer slice: mobile's own `SendGroupMessagePayload`
 * (used by `useSendGroupMessage`) has no `reply_to` field, but the group
 * "replies" screen sends with `reply_to: messageId` set regardless —
 * meaning a reply likely goes through the shared, wider `SendMessagePayload`
 * (chat.ts already has an optional `group_id` for exactly this reason),
 * not this narrower type. Confirm against a real reply send before wiring
 * the composer — don't guess which shape the backend actually expects.
 */
export interface SendGroupMessagePayload {
	group_id: number
	message_type: MessageType
	content?: string
	media?: MediaAttachment[]
	excluded_users?: Pkid[]
	metadata?: Record<string, unknown>
}

export interface PauseGroupPayload {
	pause: boolean
	pause_until?: string | null
}

export interface UpdateGroupPermissionsPayload {
	can_members_edit_info?: boolean
	can_members_send_messages?: boolean
	can_members_add_users?: boolean
	admin_have_to_approve_new_members?: boolean
}

export interface ManageGroupMemberRolePayload {
	userPkid: Pkid
	role: GroupRole
}

export interface RemoveGroupMemberPayload {
	userPkid: Pkid
}

export interface SyncGroupMembersPayload {
	userPkids: Pkid[]
}

export interface CreateGroupMember {
	user_id: Pkid
	role: GroupRole
}

/** POST chats/groups. `icon_url` is optional on the wire, but every
 * confirmed caller always sends a concrete value — mirrored here as
 * required to match how it's actually used, not the looser type. */
export interface CreateGroupPayload {
	name: string
	icon_url: string
	can_members_edit_info?: boolean
	can_members_add_users?: boolean
	can_members_send_messages?: boolean
	admin_have_to_approve_new_members?: boolean
	members: CreateGroupMember[]
}

/**
 * NAMING TRAP: `group_name`, not `name` — differs from both the request
 * payload and the `Group`/`GroupListItem` shapes. Also thinner than
 * `Group` (no `members_count`/`created_by`/`member_preview`) — don't
 * construct a full `Group` from this; navigate to the group and let
 * useGroupDetail fetch it fresh.
 */
export interface CreateGroupResponse {
	id: number
	group_name: string
	icon_url: string
	can_members_edit_info: boolean
	can_members_add_users: boolean
	can_members_send_messages: boolean
	admin_have_to_approve_new_members: boolean
}
