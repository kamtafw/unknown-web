import type { Pkid, Uuid } from "@/types/messenger"
import { describe, expect, it } from "vitest"
import { chatKeys } from "./query-keys"

describe("direct-message history query keys", () => {
	const peerUuid = "peer-account-uuid" as Uuid
	const accountA = 101 as Pkid
	const accountB = 202 as Pkid

	it("isolates the same conversation by authenticated account", () => {
		expect(chatKeys.history(peerUuid, accountA)).not.toEqual(chatKeys.history(peerUuid, accountB))
	})

	it("keeps the unscoped history key as a prefix for broad invalidation", () => {
		const prefix = chatKeys.history(peerUuid)
		expect(chatKeys.history(peerUuid, accountA).slice(0, prefix.length)).toEqual(prefix)
	})
})
