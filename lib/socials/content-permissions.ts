import { SocialContent, WhoCanReply } from "@/types/socials/api"

/**
 * Works for any SocialContent kind, not just Post — comments/replies now
 * carry their own `permissions`, server-inherited from the root post
 * (docs/social/social-content-migration-inspection.md S~13). Renamed call
 * sites should read `canReplyTo(content)`; kept the old name too since
 * "reply to a post" is still the most common call and reads naturally.
 */
export function canReplyTo(content: SocialContent): boolean {
	return content.permissions?.can_reply ?? true
}

/** @deprecated use `canReplyTo` — kept as an alias during the migration so
 * call sites can be updated incrementally without a mass rename in one
 * commit. Remove once every call site has moved to `canReplyTo`. */
export const canReplyToPost = canReplyTo

/**
 * who_can_reply explains most restrictions, but can_reply can also be
 * false for reasons who_can_reply doesn't encode (blocked, muted, etc);
 * the default branch covers that case with a generic message instead of
 * lying and saying "everyone can reply"
 */
export function replyRestrictionMessage(whoCanReply: WhoCanReply, username: string): string {
	switch (whoCanReply) {
		case "ONLY_FOLLOWERS":
			return `Only followers of @${username} can reply`
		case "ACCOUNTS_YOU_FOLLOW":
			return `Only accounts @${username} follows can reply`
		case "ONLY_ACCOUNTS_YOU_MENTION":
			return `Only accounts @${username} mentioned can reply`
		case "VERIFIED_ACCOUNTS":
			return "Only verified accounts can reply"
		default:
			return "You don't have permission to reply to this post"
	}
}
