import type { EmojiReactionCount } from "@/types/messenger"

/** Sum of every emoji's count — the value for `reactions_count`. */
export function totalReactionCount(counts: EmojiReactionCount[]): number {
	return counts.reduce((sum, c) => sum + c.count, 0)
}

function removeActorFromEmoji(
	counts: EmojiReactionCount[],
	actorId: string,
	emoji: string,
): EmojiReactionCount[] {
	return counts
		.map((c) => {
			if (c.emoji !== emoji) return c
			const actors = c.actor_ids ?? []
			if (!actors.includes(actorId)) return c
			return {
				...c,
				actor_ids: actors.filter((a) => a !== actorId),
				count: Math.max(0, c.count - 1),
			}
		})
		.filter((c) => c.count > 0)
}

function removeActorReaction(counts: EmojiReactionCount[], actorId: string): EmojiReactionCount[] {
	return counts
		.map((c) => {
			const actors = c.actor_ids ?? []
			if (!actors.includes(actorId)) return c
			return {
				...c,
				actor_ids: actors.filter((a) => a !== actorId),
				count: Math.max(0, c.count - 1),
			}
		})
		.filter((c) => c.count > 0)
}

/** Make `actorId`'s single reaction be `emoji` — a fresh reaction or a
 * switch, clearing any prior emoji first. */
function setActorReaction(
	counts: EmojiReactionCount[],
	actorId: string,
	emoji: string,
): EmojiReactionCount[] {
	const cleared = removeActorReaction(counts, actorId)
	const idx = cleared.findIndex((c) => c.emoji === emoji)
	if (idx >= 0) {
		const next = [...cleared]
		next[idx] = {
			...next[idx],
			actor_ids: [...(next[idx].actor_ids ?? []), actorId],
			count: next[idx].count + 1,
		}
		return next
	}
	return [...cleared, { emoji, count: 1, actor_ids: [actorId] }]
}

/** Same emoji again → remove. Different emoji → switch. No reaction → add. */
export function toggleActorReaction(
	counts: EmojiReactionCount[],
	actorId: string,
	emoji: string,
): EmojiReactionCount[] {
	const current = counts.find((c) => (c.actor_ids ?? []).includes(actorId))
	if (current?.emoji === emoji) return removeActorFromEmoji(counts, actorId, emoji)
	return setActorReaction(counts, actorId, emoji)
}

/** Whether toggling `emoji` for `actorId` given current `counts` is a
 * removal (tapping the same emoji already reacted with) vs. an add/switch.
 * Needed because DELETE and POST are NOT interchangeable here — DELETE
 * takes no params and resolves the caller's own reaction server-side;
 * POST always sets/switches to the given emoji. Picking the wrong one is
 * exactly the bug this fixes. */
export function isReactionRemoval(
	counts: EmojiReactionCount[],
	actorId: string,
	emoji: string,
): boolean {
	const current = counts.find((c) => (c.actor_ids ?? []).includes(actorId))
	return current?.emoji === emoji
}

export { removeActorFromEmoji, setActorReaction }
