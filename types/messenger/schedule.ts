/**
 * IMPORTANT: despite the field name, `encrypted_content` is NOT actually
 * encrypted. Mobile's own schedule/create.tsx has TODO(e2ee) comments and
 * sends `encrypted_content: message.trim()` verbatim — no E2EE key
 * exchange is wired up anywhere in the app, mobile or web.
 * `nonce`/`sender_ephemeral_key` are non-empty placeholder strings the
 * backend schema requires, not real crypto material — see
 * lib/messenger/message-security.ts.
 */

export type ScheduleRecipientType = "user" | "group"
export type ScheduleStatus = "pending" | "sent" | "failed" | "cancelled"

export interface ScheduleRecipientBundlePayload {
	recipient_type: ScheduleRecipientType
	recipient_id: number
	encrypted_content: string
	nonce: string
	sender_ephemeral_key: string
	media?: string[]
}

export interface CreateMessageSchedulePayload {
	schedule_type: "message"
	scheduled_at: string
	recipient_bundles: ScheduleRecipientBundlePayload[]
}

export interface ScheduleRecipientUser {
	type: "user"
	id: string
	pkid: number
	username: string
	first_name: string | null
	last_name: string | null
	email: string
	phone_number: string
	profile_photo: string | null
}

export interface ScheduleRecipientGroup {
	type: "group"
	id: number
	name: string
	icon_url: string | null
}

export type ScheduleRecipientResponse = ScheduleRecipientUser | ScheduleRecipientGroup

export interface ScheduleRecipientBundleResponse extends Omit<
	ScheduleRecipientBundlePayload,
	"media"
> {
	media: string[] | null
}

export interface Schedule {
	id: number
	schedule_type: "message"
	status: ScheduleStatus
	recipients: ScheduleRecipientResponse[]
	recipient_bundles: ScheduleRecipientBundleResponse[]
	content: string
	scheduled_at: string
	sent_at: string | null
	created_at: string
	updated_at: string
}

export interface ScheduleListData {
	results: Schedule[]
}
