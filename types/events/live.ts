/** Live-session comments and reactions (P4-08). Separate from event discussion comments. */

export const LIVE_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "👏", "🔥"] as const
export type LiveReactionEmoji = (typeof LIVE_REACTION_EMOJIS)[number]

/** Minimal public author projection; contact and presence fields are never retained. */
export interface LiveSessionUser {
	id: string
	pkid: number
	firstName: string
	lastName: string
	username: string
	photo: string | null
}

export interface LiveSessionComment {
	id: number
	user: LiveSessionUser
	content: string
	createdAt: string
}

export interface LiveSessionCommentsPage {
	comments: LiveSessionComment[]
	page: number
	hasNext: boolean
}

export interface LiveSessionReaction {
	eventId: string
	emoji: LiveReactionEmoji
	user: LiveSessionUser
	emojiCount: number
	createdAt: string
}

export interface LiveSessionReactionResult {
	sessionId: number
	reaction: LiveSessionReaction
}

export interface CreateLiveSessionCommentInput {
	content: string
}

export interface CreateLiveSessionReactionInput {
	emoji: LiveReactionEmoji
}
