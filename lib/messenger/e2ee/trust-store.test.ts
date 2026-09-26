// @vitest-environment node
import { describe, expect, it } from "vitest"
import { asPkid } from "@/types/messenger"
import {
	getTrustedKey,
	listTrustedKeys,
	pinIfAbsent,
	removeAllTrustedKeys,
	removeTrustedKey,
	saveTrustedKey,
} from "./trust-store"
import {
	TRUSTED_KEYS_BY_ACCOUNT_INDEX,
	TRUSTED_KEYS_STORE,
	getE2eeDatabase,
	resetE2eeDatabaseForTests,
} from "./storage/database"
import { setupFreshE2eeDatabase } from "./storage/test-support"

setupFreshE2eeDatabase()

const accountA = asPkid(101)
const accountB = asPkid(202)
const recipient1 = asPkid(501)
const recipient2 = asPkid(502)

function key(seed: number): Uint8Array {
	return new Uint8Array(32).fill(seed)
}

describe("getTrustedKey", () => {
	it("returns null when nothing is pinned", async () => {
		expect(await getTrustedKey(accountA, recipient1)).toBeNull()
	})

	it("returns exactly what was saved", async () => {
		await saveTrustedKey(accountA, recipient1, key(7), 1_700_000_000_000)
		const read = await getTrustedKey(accountA, recipient1)
		expect(read).not.toBeNull()
		expect(Array.from(read!.publicKey)).toEqual(Array.from(key(7)))
		expect(read!.pinnedAt).toBe(1_700_000_000_000)
	})

	it("defaults pinnedAt to roughly now when not supplied", async () => {
		const before = Date.now()
		await saveTrustedKey(accountA, recipient1, key(1))
		const after = Date.now()
		const read = await getTrustedKey(accountA, recipient1)
		expect(read!.pinnedAt).toBeGreaterThanOrEqual(before)
		expect(read!.pinnedAt).toBeLessThanOrEqual(after)
	})
})

describe("saveTrustedKey (unconditional upsert)", () => {
	it("REPLACES an existing key — this is the plain write, not the pin-on-first-use policy", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient1, key(2))
		const read = await getTrustedKey(accountA, recipient1)
		expect(Array.from(read!.publicKey)).toEqual(Array.from(key(2)))
	})

	it("does not disturb a different recipient under the same account", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))
		expect(Array.from((await getTrustedKey(accountA, recipient1))!.publicKey)).toEqual(
			Array.from(key(1)),
		)
		expect(Array.from((await getTrustedKey(accountA, recipient2))!.publicKey)).toEqual(
			Array.from(key(2)),
		)
	})
})

describe("pinIfAbsent (insert-only, the trust-on-first-use primitive)", () => {
	it("pins and reports pinned:true when nothing was there before", async () => {
		const result = await pinIfAbsent(accountA, recipient1, key(1))
		expect(result).toEqual({ pinned: true, existing: null })
		expect(Array.from((await getTrustedKey(accountA, recipient1))!.publicKey)).toEqual(
			Array.from(key(1)),
		)
	})

	it("NEVER overwrites an existing key, and reports pinned:false with the existing value", async () => {
		await pinIfAbsent(accountA, recipient1, key(1))
		const second = await pinIfAbsent(accountA, recipient1, key(2))

		expect(second.pinned).toBe(false)
		expect(Array.from(second.existing!.publicKey)).toEqual(Array.from(key(1)))

		// Storage itself must still hold the FIRST key, not the second attempt.
		const stored = await getTrustedKey(accountA, recipient1)
		expect(Array.from(stored!.publicKey)).toEqual(Array.from(key(1)))
	})

	it("is atomic under concurrent calls for the same (account, recipient): exactly one write wins", async () => {
		// Fires many pinIfAbsent calls for the same pair "simultaneously"
		// (each starts its own readwrite transaction). IndexedDB serializes
		// readwrite transactions on the same store, so this proves the
		// get-then-put sequence inside pinIfAbsent can't race with itself.
		const attempts = Array.from({ length: 8 }, (_, i) => key(i + 1))
		const results = await Promise.all(attempts.map((k) => pinIfAbsent(accountA, recipient1, k)))

		expect(results.filter((r) => r.pinned)).toHaveLength(1)
		expect(results.filter((r) => !r.pinned)).toHaveLength(7)

		// The persisted key must be exactly the one that "won".
		const winner = results.find((r) => r.pinned)
		const stored = await getTrustedKey(accountA, recipient1)
		const winnerKey = attempts[results.indexOf(winner!)]
		expect(Array.from(stored!.publicKey)).toEqual(Array.from(winnerKey))
	})

	it("different recipients under the same account each get their own independent pin", async () => {
		const r1 = await pinIfAbsent(accountA, recipient1, key(1))
		const r2 = await pinIfAbsent(accountA, recipient2, key(2))
		expect(r1.pinned).toBe(true)
		expect(r2.pinned).toBe(true)
	})
})

describe("account isolation", () => {
	it("the same recipient id under two accounts is pinned independently", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountB, recipient1, key(2))

		expect(Array.from((await getTrustedKey(accountA, recipient1))!.publicKey)).toEqual(
			Array.from(key(1)),
		)
		expect(Array.from((await getTrustedKey(accountB, recipient1))!.publicKey)).toEqual(
			Array.from(key(2)),
		)
	})

	it("pinIfAbsent for account B is unaffected by an existing pin under account A", async () => {
		await pinIfAbsent(accountA, recipient1, key(1))
		const result = await pinIfAbsent(accountB, recipient1, key(2))
		expect(result.pinned).toBe(true)
	})

	it("listTrustedKeys(A) never includes B's rows, and vice versa", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))
		await saveTrustedKey(accountB, recipient1, key(3))

		const forA = await listTrustedKeys(accountA)
		const forB = await listTrustedKeys(accountB)

		expect([...forA.keys()].sort()).toEqual([recipient1, recipient2].sort())
		expect([...forB.keys()]).toEqual([recipient1])
		expect(Array.from(forB.get(recipient1)!.publicKey)).toEqual(Array.from(key(3)))
	})

	it("the raw database never stores a row identifiable as belonging to the wrong account", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountB, recipient2, key(2))

		const db = await getE2eeDatabase()
		const tx = db.transaction(TRUSTED_KEYS_STORE, "readonly")
		const rows = await new Promise<Array<{ accountId: number; recipientId: number }>>(
			(resolve, reject) => {
				const request = tx.objectStore(TRUSTED_KEYS_STORE).getAll()
				request.onsuccess = () => resolve(request.result)
				request.onerror = () => reject(request.error)
			},
		)

		expect(rows).toHaveLength(2)
		expect(rows.find((r) => r.accountId === accountA)?.recipientId).toBe(recipient1)
		expect(rows.find((r) => r.accountId === accountB)?.recipientId).toBe(recipient2)
	})

	it("removeAllTrustedKeys(A) leaves B's keys intact", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))
		await saveTrustedKey(accountB, recipient1, key(3))

		await removeAllTrustedKeys(accountA)

		expect(await listTrustedKeys(accountA)).toEqual(new Map())
		const forB = await listTrustedKeys(accountB)
		expect(forB.size).toBe(1)
		expect(Array.from(forB.get(recipient1)!.publicKey)).toEqual(Array.from(key(3)))
	})
})

describe("removeTrustedKey", () => {
	it("is a no-op when nothing was pinned", async () => {
		await expect(removeTrustedKey(accountA, recipient1)).resolves.toBeUndefined()
	})

	it("removes only the targeted (account, recipient) pair", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))

		await removeTrustedKey(accountA, recipient1)

		expect(await getTrustedKey(accountA, recipient1)).toBeNull()
		expect(await getTrustedKey(accountA, recipient2)).not.toBeNull()
	})

	it("after removal, a subsequent pinIfAbsent can pin again (TOFU restarts)", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await removeTrustedKey(accountA, recipient1)
		const result = await pinIfAbsent(accountA, recipient1, key(2))
		expect(result.pinned).toBe(true)
	})
})

describe("listTrustedKeys", () => {
	it("is an empty Map when nothing is pinned for the account", async () => {
		expect(await listTrustedKeys(accountA)).toEqual(new Map())
	})

	it("index scan finds every row for the account across many recipients", async () => {
		const recipients = Array.from({ length: 12 }, (_, i) => asPkid(600 + i))
		for (const [i, r] of recipients.entries()) await saveTrustedKey(accountA, r, key(i + 1))

		const all = await listTrustedKeys(accountA)
		expect(all.size).toBe(12)
		for (const [i, r] of recipients.entries()) {
			expect(Array.from(all.get(r)!.publicKey)).toEqual(Array.from(key(i + 1)))
		}
	})

	it("the byAccount index actually has one entry per row (sanity check on the schema itself)", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))

		const db = await getE2eeDatabase()
		const tx = db.transaction(TRUSTED_KEYS_STORE, "readonly")
		const count = await new Promise<number>((resolve, reject) => {
			const request = tx
				.objectStore(TRUSTED_KEYS_STORE)
				.index(TRUSTED_KEYS_BY_ACCOUNT_INDEX)
				.count(accountA)
			request.onsuccess = () => resolve(request.result)
			request.onerror = () => reject(request.error)
		})
		expect(count).toBe(2)
	})
})

describe("removeAllTrustedKeys", () => {
	it("is a no-op when the account has no trusted keys", async () => {
		await expect(removeAllTrustedKeys(accountA)).resolves.toBeUndefined()
	})

	it("removes every row for the account, including a larger set (cursor pagination path)", async () => {
		const recipients = Array.from({ length: 25 }, (_, i) => asPkid(700 + i))
		for (const [i, r] of recipients.entries()) await saveTrustedKey(accountA, r, key(i + 1))

		await removeAllTrustedKeys(accountA)

		expect(await listTrustedKeys(accountA)).toEqual(new Map())
		const db = await getE2eeDatabase()
		const tx = db.transaction(TRUSTED_KEYS_STORE, "readonly")
		const count = await new Promise<number>((resolve, reject) => {
			const request = tx.objectStore(TRUSTED_KEYS_STORE).count()
			request.onsuccess = () => resolve(request.result)
			request.onerror = () => reject(request.error)
		})
		expect(count).toBe(0)
	})
})

describe("reload-style rehydration", () => {
	it("a pinned key survives closing and reopening the connection", async () => {
		await saveTrustedKey(accountA, recipient1, key(3))

		const db = await getE2eeDatabase()
		db.close()
		resetE2eeDatabaseForTests()

		const read = await getTrustedKey(accountA, recipient1)
		expect(Array.from(read!.publicKey)).toEqual(Array.from(key(3)))
	})
})
