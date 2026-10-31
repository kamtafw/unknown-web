import { resolveMediaUrl } from "@/lib/server-config"
import type {
	LiveReactionEmoji,
	LiveSessionComment,
	LiveSessionCommentsPage,
	LiveSessionReaction,
	LiveSessionReactionResult,
	LiveSessionUser,
} from "@/types/events/live"
import { LIVE_REACTION_EMOJIS } from "@/types/events/live"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
	return typeof value === "string" ? value.trim() : ""
}

function positiveInteger(value: unknown): number | null {
	return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null
}

function normalizeUser(raw: unknown): LiveSessionUser | null {
	if (!isRecord(raw)) return null
	const id = text(raw.id)
	const pkid = positiveInteger(raw.pkid)
	const username = text(raw.username)
	if (!id || pkid === null || (!username && !text(raw.first_name) && !text(raw.last_name))) return null
	const photoPath = text(raw.profile_photo)
	return {
		id,
		pkid,
		firstName: text(raw.first_name),
		lastName: text(raw.last_name),
		username,
		photo: photoPath ? resolveMediaUrl(photoPath) ?? null : null,
	}
}

function validDate(value: unknown): string | null {
	const date = text(value)
	return date && Number.isFinite(Date.parse(date)) ? date : null
}

export function normalizeLiveSessionComment(raw: unknown): LiveSessionComment | null {
	if (!isRecord(raw)) return null
	const id = positiveInteger(raw.id)
	const user = normalizeUser(raw.user)
	const createdAt = validDate(raw.created_at)
	if (id === null || !user || typeof raw.content !== "string" || !raw.content.trim() || !createdAt)
		return null
	return { id, user, content: raw.content, createdAt }
}

/** The next link, not counts or page length, is the sole pagination signal. */
export function normalizeLiveSessionCommentsPage(
	data: unknown,
	page: number,
): LiveSessionCommentsPage | null {
	if (!isRecord(data) || !Array.isArray(data.results)) return null
	return {
		comments: data.results
			.map(normalizeLiveSessionComment)
			.filter((item): item is LiveSessionComment => item !== null),
		page,
		hasNext: typeof data.next === "string" && data.next.length > 0,
	}
}

function isLiveReactionEmoji(value: unknown): value is LiveReactionEmoji {
	return typeof value === "string" && (LIVE_REACTION_EMOJIS as readonly string[]).includes(value)
}

export function normalizeLiveSessionReaction(raw: unknown): LiveSessionReaction | null {
	if (!isRecord(raw)) return null
	const eventId = text(raw.event_id)
	const user = normalizeUser(raw.user)
	const emojiCount = raw.emoji_count
	const createdAt = validDate(raw.created_at)
	if (
		!eventId ||
		!isLiveReactionEmoji(raw.emoji) ||
		!user ||
		typeof emojiCount !== "number" ||
		!Number.isSafeInteger(emojiCount) ||
		emojiCount < 0 ||
		!createdAt
	) return null
	return { eventId, emoji: raw.emoji, user, emojiCount, createdAt }
}

export function normalizeLiveSessionReactionResult(data: unknown): LiveSessionReactionResult | null {
	if (!isRecord(data)) return null
	const sessionId = positiveInteger(data.session_id)
	const reaction = normalizeLiveSessionReaction(data.reaction)
	if (sessionId === null || !reaction) return null
	return { sessionId, reaction }
}
