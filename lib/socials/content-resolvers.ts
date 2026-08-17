import { SocialContent } from "@/types/socials/api"

/** Sentinel prefix for the temporary id assigned to an optimistic repost
 * before the server confirms and returns the real one — replaces the old
 * "pkid: -Date.now()" negative-number sentinel now that identity is
 * UUID-only. See hooks/socials/use-repost.ts. */
export const PENDING_REPOST_ID_PREFIX = "pending-repost-"

/** True once `my_repost_id` holds a real server-assigned id rather than the
 * temporary sentinel used while a bare-repost mutation is in flight —
 * guards "Undo repost" from firing on an id that doesn't exist on the
 * server yet. */
export function isSettledRepostId(id: string | null): id is string {
	return id != null && !id.startsWith(PENDING_REPOST_ID_PREFIX)
}

/** True when `content` is a bare repost — no quote text — of anything
 * (post, comment, or reply). Generalized from the old Post-only check
 * (`isUnquotedPostRepost`) now that `original.kind` makes every case
 * equally checkable — a bare repost of a comment/reply is no longer a
 * special case. See docs/social/social-content-migration-inspection.md
 * S~12 (this closes risk item #5 from that document). */
export function isBareRepost(
	content: SocialContent,
): content is SocialContent & { original: SocialContent } {
	return content.flags.repost && !content.message?.trim() && !!content.original
}

/**
 * Returns the SocialContent-shaped object that should drive every
 * engagement affordance — like/reply/repost/bookmark counts and
 * my-interaction flags — for a card. For a bare repost this resolves to
 * the underlying original (whatever its kind); for anything else (a real
 * post/comment/reply, or a repost with quote text) it returns the content
 * unchanged.
 *
 * Field-by-field override (not a plain `{...original}` spread) preserves
 * the wrapping repost's own `permissions`/`id` semantics exactly as the
 * pre-migration implementation did — only identity, content, and
 * engagement state come from the original.
 */
export function resolveEngagementContent(content: SocialContent): SocialContent {
	if (!isBareRepost(content)) return content
	const original = content.original

	return {
		...content,
		id: original.id,
		kind: original.kind,
		post_id: original.post_id,
		parent_id: original.parent_id,
		user: original.user,
		message: original.message,
		media: original.media,
		location: original.location,
		hashtags: original.hashtags,
		metrics: original.metrics,
		viewer: original.viewer,
		created_at: original.created_at,
		updated_at: original.updated_at,
		flags: { ...content.flags, repost: false },
		original: null,
		my_repost_id: original.my_repost_id,
	}
}

/**
 * Normalizes whatever engagement entity was found — a real, already-
 * standalone SocialContent, or one still wrapped inside someone's repost
 * via `.original` — into a full standalone SocialContent. Needed when
 * inserting it as its own card, e.g. into the Bookmarks feed.
 *
 * Now that `original` is the exact same `SocialContent` shape as
 * everything else (no separate "OriginalPost" shape missing fields like
 * `who_can_see`/`updated_at` to backfill), this collapses to
 * `resolveEngagementContent`. Kept as its own name because call sites use
 * it to express a different intent ("give me a standalone card") than
 * `resolveEngagementContent`'s ("what should drive this card's engagement
 * affordances") — worth revisiting if that distinction turns out not to
 * matter once every call site is migrated.
 */
export function toStandaloneContent(entity: SocialContent): SocialContent {
	return resolveEngagementContent(entity)
}
