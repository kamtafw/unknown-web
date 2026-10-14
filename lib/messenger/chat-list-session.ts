export class StaleChatListSessionError extends Error {
	constructor() {
		super("Chat-list request belongs to a stale account session")
		this.name = "StaleChatListSessionError"
	}
}

/**
 * Prevents an account's outstanding list request from producing cacheable
 * data after logout or an account switch. Query keys must also include the
 * captured account ID; this guard closes the in-flight request race.
 */
export async function fetchForChatListSession<T>(
	accountId: number | null,
	getCurrentAccountId: () => number | null,
	fetchList: () => Promise<T>,
): Promise<T> {
	if (accountId === null || getCurrentAccountId() !== accountId) {
		throw new StaleChatListSessionError()
	}

	const result = await fetchList()

	if (getCurrentAccountId() !== accountId) {
		throw new StaleChatListSessionError()
	}

	return result
}
