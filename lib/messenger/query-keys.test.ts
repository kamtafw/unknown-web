<<<<<<< HEAD
import { describe, expect, it } from "vitest"
import type { Pkid, Uuid } from "@/types/messenger"
=======
import type { Pkid, Uuid } from "@/types/messenger"
import { describe, expect, it } from "vitest"
>>>>>>> 843d8dae80065628be944cc7076945906d94641a
import { chatKeys } from "./query-keys"

describe("direct-message history query keys", () => {
	const peerUuid = "peer-account-uuid" as Uuid
	const accountA = 101 as Pkid
	const accountB = 202 as Pkid

	it("isolates the same conversation by authenticated account", () => {
<<<<<<< HEAD
		expect(chatKeys.history(peerUuid, accountA)).not.toEqual(
			chatKeys.history(peerUuid, accountB),
		)
=======
		expect(chatKeys.history(peerUuid, accountA)).not.toEqual(chatKeys.history(peerUuid, accountB))
>>>>>>> 843d8dae80065628be944cc7076945906d94641a
	})

	it("keeps the unscoped history key as a prefix for broad invalidation", () => {
		const prefix = chatKeys.history(peerUuid)
		expect(chatKeys.history(peerUuid, accountA).slice(0, prefix.length)).toEqual(prefix)
	})
})
