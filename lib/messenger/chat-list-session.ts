export interface ChatListSession {
	accountId: number | null
	generation: number
}

export class StaleChatListSessionError extends Error {
	constructor() {
		super("Chat-list request belongs to a stale account session")
		this.name = "StaleChatListSessionError"
	}
}

/**
 * Prevents a request from producing cacheable data after logout, account
 * switch, or logout/relogin to the same account. Query keys must also include
 * the captured account ID and session generation.
 */
export async function fetchForChatListSession<T>(
	session: ChatListSession,
	getCurrentSession: () => ChatListSession,
	fetchList: () => Promise<T>,
): Promise<T> {
	const isCurrent = () => {
		const current = getCurrentSession()
		return (
			current.accountId !== null &&
			current.accountId === session.accountId &&
			current.generation === session.generation
		)
	}

	if (!isCurrent()) throw new StaleChatListSessionError()

	const result = await fetchList()

	if (!isCurrent()) throw new StaleChatListSessionError()

	return result
}
