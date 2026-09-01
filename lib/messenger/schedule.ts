import type {
	Schedule,
	ScheduleRecipientBundlePayload,
	ScheduleRecipientResponse,
} from "@/types/messenger"
import { resolveSecurityTokens } from "./message-security"

export const SCHEDULE_MESSAGE_MAX_CHARS = 100

export interface ScheduleRecipientDraft {
	type: "user" | "group"
	id: number
	name: string
	photo: string | null
}

/** Mirrors mobile's buildBundles — one bundle per recipient, identical
 * content in each. */
export function buildScheduleBundles(
	recipients: ScheduleRecipientDraft[],
	content: string,
): ScheduleRecipientBundlePayload[] {
	return recipients.map((r) => {
		const { nonce, sender_ephemeral_key } = resolveSecurityTokens()
		return {
			recipient_type: r.type,
			recipient_id: r.id,
			encrypted_content: content,
			nonce,
			sender_ephemeral_key,
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

export function schedulePreview(schedule: Schedule): string {
	return schedule.content || schedule.recipient_bundles[0]?.encrypted_content || ""
}

export function mergeDateAndTime(date: Date, time: Date): Date {
	const merged = new Date(date)
	merged.setHours(time.getHours(), time.getMinutes(), 0, 0)
	return merged
}
