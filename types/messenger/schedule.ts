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

/**
 * The backend also supports `schedule_type: "call"` (confirmed via the
 * shared `chats/schedules` contract), but call scheduling is deliberately
 * NOT exposed anywhere in this release — see DECISIONS.md. Every list
 * fetch explicitly requests `type=message` or `type=reminder`, so a call
 * schedule should never actually reach the client, but the type is kept
 * narrow here on purpose: it's a compile-time guard against accidentally
 * building call-shaped UI, not just a documentation note.
 */
export type ScheduleType = "message" | "reminder"

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

export interface CreateReminderSchedulePayload {
	schedule_type: "reminder"
	scheduled_at: string
	content: string
}

export type CreateSchedulePayload = CreateMessageSchedulePayload | CreateReminderSchedulePayload

/** PATCH payloads — deliberately separate from the create payloads rather
 * than `Partial<CreateSchedulePayload>`: `schedule_type` is never sent on
 * update (the backend contract has no confirmed "change the type of an
 * existing schedule" behavior, and nothing in this app attempts it). */
export interface UpdateMessageSchedulePayload {
	scheduled_at?: string
	recipient_bundles?: ScheduleRecipientBundlePayload[]
}
export interface UpdateReminderSchedulePayload {
	scheduled_at?: string
	content?: string
}
export type UpdateSchedulePayload = UpdateMessageSchedulePayload | UpdateReminderSchedulePayload

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

/**
 * `recipients`/`recipient_bundles` are `null` for reminder schedules —
 * a reminder has no recipient bundle at all, it's just `content` +
 * `scheduled_at`. Every renderer must branch on `schedule_type` rather
 * than assuming these arrays exist.
 */
export interface Schedule {
	id: number
	schedule_type: ScheduleType
	status: ScheduleStatus
	recipients: ScheduleRecipientResponse[] | null
	recipient_bundles: ScheduleRecipientBundleResponse[] | null
	content: string
	scheduled_at: string
	sent_at: string | null
	created_at: string
	updated_at: string
}

export interface ScheduleListData {
	results: Schedule[]
}
