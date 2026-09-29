// @vitest-environment node
import { describe, expect, it } from "vitest"
import { asPkid } from "@/types/messenger"
import { getIdentity, listIdentityAccountIds, removeIdentity, saveIdentity } from "./identity-store"
import { getE2eeDatabase, IDENTITIES_STORE } from "./storage/database"
import { setupFreshE2eeDatabase } from "./storage/test-support"

setupFreshE2eeDatabase()

const accountA = asPkid(101)
const accountB = asPkid(202)

function keypair(seed: number) {
	return {
		privateKey: new Uint8Array(32).fill(seed),
		publicKey: new Uint8Array(32).fill(seed + 1),
		updatedAt: 1_700_000_000_000 + seed,
	}
}

describe("getIdentity", () => {
	it("returns null when nothing has been saved for this account", async () => {
		expect(await getIdentity(accountA)).toBeNull()
	})

	it("returns exactly what was saved", async () => {
		const identity = keypair(1)
		await saveIdentity(accountA, identity)

		const read = await getIdentity(accountA)
		expect(read).not.toBeNull()
		expect(Array.from(read!.privateKey)).toEqual(Array.from(identity.privateKey))
		expect(Array.from(read!.publicKey)).toEqual(Array.from(identity.publicKey))
		expect(read!.updatedAt).toBe(identity.updatedAt)
	})

	it("round-trips a Uint8Array as a real Uint8Array, not a plain array/object", async () => {
		await saveIdentity(accountA, keypair(2))
		const read = await getIdentity(accountA)
		expect(read!.privateKey).toBeInstanceOf(Uint8Array)
		expect(read!.publicKey).toBeInstanceOf(Uint8Array)
		expect(read!.privateKey).toHaveLength(32)
	})

	it("round-trips arbitrary byte values, including 0x00 and 0xff", async () => {
		const privateKey = Uint8Array.from({ length: 32 }, (_, i) => (i % 2 === 0 ? 0x00 : 0xff))
		await saveIdentity(accountA, { privateKey, publicKey: new Uint8Array(32), updatedAt: 1 })
		const read = await getIdentity(accountA)
		expect(Array.from(read!.privateKey)).toEqual(Array.from(privateKey))
	})
})

describe("saveIdentity", () => {
	it("overwrites rather than accumulating multiple rows for the same account", async () => {
		await saveIdentity(accountA, keypair(1))
		await saveIdentity(accountA, keypair(2))

		const read = await getIdentity(accountA)
		expect(Array.from(read!.privateKey)).toEqual(Array.from(keypair(2).privateKey))

		const ids = await listIdentityAccountIds()
		expect(ids.filter((id) => id === accountA)).toHaveLength(1)
	})

	it("does not mutate the caller's Uint8Array views afterwards affecting the stored copy", async () => {
		// IndexedDB structured-clone COPIES; mutating the original after save
		// must not retroactively change what's stored.
		const privateKey = new Uint8Array(32).fill(1)
		const publicKey = new Uint8Array(32).fill(2)
		await saveIdentity(accountA, { privateKey, publicKey, updatedAt: 1 })
		privateKey.fill(9)
		publicKey.fill(9)

		const read = await getIdentity(accountA)
		expect(read!.privateKey.every((b) => b === 1)).toBe(true)
		expect(read!.publicKey.every((b) => b === 2)).toBe(true)
	})
})

describe("account isolation", () => {
	it("account B has no identity even though account A does", async () => {
		await saveIdentity(accountA, keypair(1))
		expect(await getIdentity(accountB)).toBeNull()
	})

	it("both accounts can hold DIFFERENT identities simultaneously without cross-contamination", async () => {
		const a = keypair(10)
		const b = keypair(20)
		await saveIdentity(accountA, a)
		await saveIdentity(accountB, b)

		const readA = await getIdentity(accountA)
		const readB = await getIdentity(accountB)
		expect(Array.from(readA!.privateKey)).toEqual(Array.from(a.privateKey))
		expect(Array.from(readB!.privateKey)).toEqual(Array.from(b.privateKey))
		expect(Array.from(readA!.privateKey)).not.toEqual(Array.from(readB!.privateKey))
	})

	it("the raw database has one row per account, never a cross-account row", async () => {
		await saveIdentity(accountA, keypair(1))
		await saveIdentity(accountB, keypair(2))

		const db = await getE2eeDatabase()
		const tx = db.transaction(IDENTITIES_STORE, "readonly")
		const all = await new Promise<Array<{ accountId: number }>>((resolve, reject) => {
			const request = tx.objectStore(IDENTITIES_STORE).getAll()
			request.onsuccess = () => resolve(request.result)
			request.onerror = () => reject(request.error)
		})

		expect(all.map((row) => row.accountId).sort()).toEqual([accountA, accountB].sort())
	})

	it("removing account A's identity leaves account B's untouched", async () => {
		await saveIdentity(accountA, keypair(1))
		await saveIdentity(accountB, keypair(2))
		await removeIdentity(accountA)

		expect(await getIdentity(accountA)).toBeNull()
		expect(await getIdentity(accountB)).not.toBeNull()
	})
})

describe("removeIdentity", () => {
	it("is a no-op (does not throw) when nothing was stored", async () => {
		await expect(removeIdentity(accountA)).resolves.toBeUndefined()
	})

	it("after removal, getIdentity returns null again", async () => {
		await saveIdentity(accountA, keypair(1))
		await removeIdentity(accountA)
		expect(await getIdentity(accountA)).toBeNull()
	})
})

describe("listIdentityAccountIds", () => {
	it("is empty when nothing has been saved", async () => {
		expect(await listIdentityAccountIds()).toEqual([])
	})

	it("lists every account that has a saved identity, and only those", async () => {
		await saveIdentity(accountA, keypair(1))
		await saveIdentity(accountB, keypair(2))

		const ids = await listIdentityAccountIds()
		expect([...ids].sort((a, b) => a - b)).toEqual([accountA, accountB].sort((a, b) => a - b))
	})
})

describe("reload-style rehydration (fresh connection to the same on-disk database)", () => {
	it("an identity saved through one connection is visible through a brand-new connection", async () => {
		await saveIdentity(accountA, keypair(5))

		// Simulate "page reload": close the cached connection WITHOUT deleting
		// the database, forcing the next call to open a fresh IDBDatabase
		// handle against the same persisted data — the same thing that
		// happens to a real IndexedDB database across a browser page reload.
		const db = await getE2eeDatabase()
		db.close()
		// Force our module's cache to forget it too, without deleting data —
		// mirrors what a real page reload does to in-memory module state.
		const { resetE2eeDatabaseForTests } = await import("./storage/database")
		resetE2eeDatabaseForTests()

		const read = await getIdentity(accountA)
		expect(read).not.toBeNull()
		expect(Array.from(read!.privateKey)).toEqual(Array.from(keypair(5).privateKey))
	})
})
