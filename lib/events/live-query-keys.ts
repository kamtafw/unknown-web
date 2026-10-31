/** Live-session cache keys; separate from event-discussion comments and Messenger. */

export const liveSessionKeys = {
	all: ["events", "live-session-data"] as const,
	commentsRoot: () => [...liveSessionKeys.all, "comments"] as const,
	comments: (
		accountId: number | null,
		sessionGeneration: number | null,
		sessionId: number,
		limit: number,
	) => [...liveSessionKeys.commentsRoot(), accountId, sessionGeneration, sessionId, { limit }] as const,
	roomRoot: () => [...liveSessionKeys.all, "room"] as const,
	room: (accountId: number | null, sessionGeneration: number | null, sessionId: number) =>
		[...liveSessionKeys.roomRoot(), accountId, sessionGeneration, sessionId] as const,
}
