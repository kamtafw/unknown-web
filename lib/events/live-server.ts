import { LIVE_REACTION_EMOJIS, type LiveReactionEmoji } from "@/types/events/live"

type Built<T> = { ok: true; value: T } | { ok: false; message: string; code: string }

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
}

function pick(source: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
	const out: Record<string, unknown> = {}
	for (const key of keys) if (source[key] !== undefined) out[key] = source[key]
	return out
}

const ENVELOPE_KEYS = ["success", "status_code", "message"] as const
const PAGE_KEYS = ["count", "total_pages", "limit", "current", "previous", "next"] as const
const USER_KEYS = ["id", "pkid", "first_name", "last_name", "username", "profile_photo"] as const
const COMMENT_KEYS = ["id", "content", "created_at"] as const
const REACTION_KEYS = ["event_id", "emoji", "emoji_count", "created_at"] as const

export function isLiveSessionId(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value > 0
}

export function buildLiveSessionCommentBody(body: unknown): Built<{ content: string }> {
	const content = isRecord(body) && typeof body.content === "string" ? body.content.trim() : ""
	if (!content) return { ok: false, message: "A comment cannot be blank", code: "invalid_comment" }
	// No length limit is asserted: mobile has no local cap and backend semantics remain unverified.
	return { ok: true, value: { content } }
}

export function buildLiveSessionReactionBody(body: unknown): Built<{ emoji: LiveReactionEmoji }> {
	const emoji = isRecord(body) ? body.emoji : undefined
	if (typeof emoji !== "string" || !(LIVE_REACTION_EMOJIS as readonly string[]).includes(emoji)) {
		return { ok: false, message: "Invalid reaction", code: "invalid_reaction" }
	}
	return { ok: true, value: { emoji: emoji as LiveReactionEmoji } }
}

function sanitizeUser(raw: unknown): Record<string, unknown> | null {
	if (!isPlainRecord(raw)) return null
	return pick(raw, USER_KEYS)
}

function sanitizeComment(raw: Record<string, unknown>): Record<string, unknown> {
	const row = pick(raw, COMMENT_KEYS)
	const user = sanitizeUser(raw.user)
	if (user) row.user = user
	return row
}

function sanitizeReaction(raw: unknown): Record<string, unknown> | null {
	if (!isPlainRecord(raw)) return null
	const reaction = pick(raw, REACTION_KEYS)
	const user = sanitizeUser(raw.user)
	if (user) reaction.user = user
	return reaction
}

export function sanitizeLiveSessionCommentsPayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data) || !Array.isArray(json.data.results)) return null
	return {
		...pick(json, ENVELOPE_KEYS),
		data: {
			...pick(json.data, PAGE_KEYS),
			results: json.data.results.filter(isPlainRecord).map(sanitizeComment),
		},
	}
}

export function sanitizeLiveSessionCommentCreatePayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data) || !isPlainRecord(json.data.comment)) return null
	return { ...pick(json, ENVELOPE_KEYS), data: { comment: sanitizeComment(json.data.comment) } }
}

export function sanitizeLiveSessionReactionPayload(json: unknown): unknown | null {
	if (!isPlainRecord(json) || !isPlainRecord(json.data)) return null
	const sessionId = json.data.session_id
	const reaction = sanitizeReaction(json.data.reaction)
	if (!isLiveSessionId(sessionId) || !reaction) return null
	return { ...pick(json, ENVELOPE_KEYS), data: { session_id: sessionId, reaction } }
}
