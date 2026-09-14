import type {
	Schedule,
	ScheduleRecipientBundlePayload,
	ScheduleRecipientResponse,
} from "@/types/messenger"
import { resolveSecurityTokens } from "./message-security"

export const SCHEDULE_MESSAGE_MAX_CHARS = 100
export const SCHEDULE_REMINDER_MAX_CHARS = 100
export const SCHEDULE_MAX_IMAGES = 5

/** A schedule can't be created for "right now" — require at least a
 * minute of lead time so a slow submit doesn't land in the past by the
 * time the request reaches the server. */
export const SCHEDULE_MIN_LEAD_MS = 60_000

export interface ScheduleRecipientDraft {
	type: "user" | "group"
	id: number
	name: string
	photo: string | null
}

/** Mirrors mobile's buildBundles — one bundle per recipient, identical
 * content (and, once wired up, identical media) in each — the same
 * "one caption applied uniformly" convention already established for
 * regular message media sends (see MediaComposerDialog). */
export function buildScheduleBundles(
	recipients: ScheduleRecipientDraft[],
	content: string,
	media: string[] = [],
): ScheduleRecipientBundlePayload[] {
	return recipients.map((r) => {
		const { nonce, sender_ephemeral_key } = resolveSecurityTokens()
		return {
			recipient_type: r.type,
			recipient_id: r.id,
			encrypted_content: content,
			nonce,
			sender_ephemeral_key,
			...(media.length > 0 ? { media } : {}),
		}
	})
}

export function scheduleRecipientName(r: ScheduleRecipientResponse): string {
	if (r.type === "group") return r.name
	const full = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim()
	return full || r.username || r.email || "Unknown"
}

export function scheduleRecipientPhoto(r: ScheduleRecipientResponse): string | null {
	return r.type === "group" ? r.icon_url : r.profile_photo
}

/** First recipient plus a count of how many more, for the common
 * "Jane +2" row treatment — works for 1, 2, or many recipients without
 * the caller needing to branch. */
export function scheduleRecipientsSummary(schedule: Schedule): {
	primary: ScheduleRecipientResponse | null
	extraCount: number
} {
	const recipients = schedule.recipients ?? []
	return { primary: recipients[0] ?? null, extraCount: Math.max(0, recipients.length - 1) }
}

/**
 * `encrypted_content` must NEVER be rendered as a preview — even though
 * it happens to hold plaintext today (no E2EE is wired up anywhere in
 * this app, see message-security.ts), treating it as opaque now means
 * this call site doesn't quietly start leaking real ciphertext the day
 * encryption actually lands. Reminders have no bundle at all and use
 * their own plaintext `content` field directly.
 */
export function schedulePreview(schedule: Schedule): string {
	if (schedule.schedule_type === "reminder") return schedule.content || "Reminder"
	return schedule.content || "Message"
}

/** All media URLs attached to a message schedule, deduped across
 * recipient bundles (every bundle carries the same media array — see
 * buildScheduleBundles). Returns `[]` for reminders or a bundle-less
 * schedule rather than throwing. */
export function scheduleMediaUrls(schedule: Schedule): string[] {
	if (schedule.schedule_type !== "message") return []
	for (const bundle of schedule.recipient_bundles ?? []) {
		if (bundle.media && bundle.media.length > 0) return bundle.media
	}
	return []
}

export function mergeDateAndTime(date: Date, time: Date): Date {
	const merged = new Date(date)
	merged.setHours(time.getHours(), time.getMinutes(), 0, 0)
	return merged
}

/** Must be far enough in the future to survive the round-trip to the
 * server — see SCHEDULE_MIN_LEAD_MS. */
export function isScheduleDateTimeValid(date: Date): boolean {
	return date.getTime() >= Date.now() + SCHEDULE_MIN_LEAD_MS
}

/**
 * Human-friendly date label for a schedule's `scheduled_at` — Today /
 * Tomorrow / weekday name / full date, deliberately NOT reusing
 * `resolveDateSeparatorLabel` from date-separators.ts: that helper is
 * tuned for message-history separators (past dates, "Yesterday"), and
 * doesn't handle "Tomorrow" or future weekdays at all. Scheduling only
 * ever deals with future dates, so this is a small, separate helper
 * rather than overloading a utility a different, already-shipped surface
 * depends on.
 */
export function formatScheduleDate(iso: string, now: Date = new Date()): string {
	const date = new Date(iso)
	const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
	const dayDiff = Math.round(
		(startOfDay(date).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24),
	)
	if (dayDiff === 0) return "Today"
	if (dayDiff === 1) return "Tomorrow"
	if (dayDiff > 1 && dayDiff < 7) return date.toLocaleDateString(undefined, { weekday: "long" })
	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
	})
}

export function formatScheduleTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function formatScheduleDateTime(iso: string): string {
	return `${formatScheduleDate(iso)} · ${formatScheduleTime(iso)}`
}
