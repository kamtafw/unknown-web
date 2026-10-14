import { describe, expect, it } from "vitest"
import { fetchForChatListSession, StaleChatListSessionError } from "./chat-list-session"

describe("fetchForChatListSession", () => {
	it("rejects an in-flight account A list response after logout and account B login", async () => {
		let activeAccountId: number | null = 101
		let resolveRequest!: (value: { users: string[] }) => void
		const request = new Promise<{ users: string[] }>((resolve) => {
			resolveRequest = resolve
		})

		const pending = fetchForChatListSession(
			101,
			() => activeAccountId,
			() => request,
		)

		// The HTTP request was started by A, but its response arrives only
		// after logout and a new authenticated session for B.
		activeAccountId = null
		activeAccountId = 202
		resolveRequest({ users: ["account A conversation"] })

		await expect(pending).rejects.toBeInstanceOf(StaleChatListSessionError)
	})

	it("does not start a request if the captured account is already stale", async () => {
		let calls = 0
		await expect(
			fetchForChatListSession(101, () => 202, async () => {
				calls++
				return "must not resolve"
			}),
		).rejects.toBeInstanceOf(StaleChatListSessionError)
		expect(calls).toBe(0)
	})

	it("returns results when the account remains unchanged", async () => {
		await expect(fetchForChatListSession(101, () => 101, async () => "account A")).resolves.toBe("account A")
	})
})
