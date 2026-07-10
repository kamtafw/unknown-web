import { Post, WhoCanReply } from "@/types/api"

export function canReplyToPost(post: Post): boolean {
	return post.viewer_permissions?.can_reply ?? true
}

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
