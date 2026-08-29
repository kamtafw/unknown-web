import { Message } from "@/types/messenger"

export interface ResolvedPollOption {
	id: number
	text: string
	voteCount: number
}

export interface ResolvedPoll {
	question: string
	options: ResolvedPollOption[]
	isMultiple: boolean
	isAnonymous: boolean
	isExpired: boolean
	expiresAt: string | null
	totalVotes: number
	selectedOptionIds: number[]
}

/**
 * Defensive read of `message.metadata` for a poll message. Mirrors
 * mobile's poll-bubble.tsx, which itself hedges between field-name
 * variants (`allow_multiple` vs `allow_multiple_answers`, etc.) — kept
 * here rather than assuming one exact server shape, since mobile's own
 * source shows the same uncertainty about what comes back.
 */
export function resolvePoll(message: Message): ResolvedPoll | null {
	const meta = message.metadata as Record<string, unknown> | null
	if (!meta || typeof meta.question !== "string" || !Array.isArray(meta.options)) return null

	const options: ResolvedPollOption[] = (meta.options as Record<string, unknown>[]).map((o) => ({
		id: Number(o.id),
		text: String(o.text ?? ""),
		voteCount: Number(o.vote_count ?? o.votes ?? 0),
	}))

	const isMultiple = Boolean(meta.allow_multiple_answers ?? meta.allow_multiple ?? false)
	const isAnonymous = Boolean(meta.is_anonymous ?? meta.anonymous_votes ?? false)

	const duration = meta.duration as Record<string, unknown> | undefined
	const expiresAt =
		(typeof meta.expires_at === "string" ? meta.expires_at : undefined) ??
		(typeof duration?.expires_at === "string" ? duration.expires_at : undefined) ??
		null

	const isExpired = Boolean(
		meta.is_expired ??
		duration?.is_expired ??
		(expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false),
	)

	const totalVotes = Number(
		meta.total_voters ?? meta.total_votes ?? options.reduce((sum, o) => sum + o.voteCount, 0),
	)

	const selectedOptionIds = Array.isArray(meta.selected_option_ids)
		? (meta.selected_option_ids as unknown[]).map(Number)
		: []

	return {
		question: meta.question,
		options,
		isMultiple,
		isAnonymous,
		isExpired,
		expiresAt,
		totalVotes,
		selectedOptionIds,
	}
}

/** "Closes in …" label — ported from mobile's pollCountdownLabel. */
export function pollCountdownLabel(expiresAt: string): string {
	const diffMs = new Date(expiresAt).getTime() - Date.now()
	if (diffMs <= 0) return "Poll ended"
	const minutes = Math.ceil(diffMs / 60_000)
	if (minutes < 60) return `Closes in ${minutes} min`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `Closes in ${hours} h`
	const days = Math.floor(hours / 24)
	return `Closes in ${days} d`
}
