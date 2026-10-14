import { describe, expect, it } from "vitest"
import { fetchForChatListSession, StaleChatListSessionError, type ChatListSession } from "./chat-list-session"

describe("fetchForChatListSession", () => {
	it("rejects an in-flight account A list response after logout and account B login", async () => {
		let activeSession: ChatListSession = { accountId: 101, generation: 1 }
		let resolveRequest!: (value: { users: string[] }) => void
		const request = new Promise<{ users: string[] }>((resolve) => {
			resolveRequest = resolve
		})

		const pending = fetchForChatListSession(
			{ accountId: 101, generation: 1 },
			() => activeSession,
			() => request,
		)

		activeSession = { accountId: null, generation: 2 }
		activeSession = { accountId: 202, generation: 3 }
		resolveRequest({ users: ["account A conversation"] })

		await expect(pending).rejects.toBeInstanceOf(StaleChatListSessionError)
	})

	it("rejects a response after logout and relogin to the same account", async () => {
		let activeSession: ChatListSession = { accountId: 101, generation: 1 }
		let resolveRequest!: (value: string) => void
		const request = new Promise<string>((resolve) => {
			resolveRequest = resolve
		})

		const pending = fetchForChatListSession(
			{ accountId: 101, generation: 1 },
			() => activeSession,
			() => request,
		)

		activeSession = { accountId: null, generation: 2 }
		activeSession = { accountId: 101, generation: 3 }
		resolveRequest("old session response")

		await expect(pending).rejects.toBeInstanceOf(StaleChatListSessionError)
	})

	it("does not start a request if the captured session is already stale", async () => {
		let calls = 0
		await expect(
			fetchForChatListSession({ accountId: 101, generation: 1 }, () => ({ accountId: 202, generation: 2 }), async () => {
				calls++
				return "must not resolve"
			}),
		).rejects.toBeInstanceOf(StaleChatListSessionError)
		expect(calls).toBe(0)
	})

	it("returns results when the account session remains unchanged", async () => {
		const session = { accountId: 101, generation: 1 }
		await expect(fetchForChatListSession(session, () => session, async () => "account A")).resolves.toBe("account A")
	})
})
