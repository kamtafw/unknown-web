// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { asPkid } from "@/types/messenger"
import { getIdentity, saveIdentity } from "./identity-store"
import * as identityStore from "./identity-store"
import { e2eeRuntime, E2eeRuntimeError } from "./runtime"
import { setupFreshE2eeDatabase } from "./storage/test-support"
import { getTrustedKey, listTrustedKeys, saveTrustedKey } from "./trust-store"
import * as trustStore from "./trust-store"

setupFreshE2eeDatabase()

afterEach(() => {
	e2eeRuntime.clear()
	vi.restoreAllMocks()
})

const accountA = asPkid(101)
const accountB = asPkid(202)
const recipient1 = asPkid(501)
const recipient2 = asPkid(502)

function keypair(seed: number) {
	return {
		privateKey: new Uint8Array(32).fill(seed),
		publicKey: new Uint8Array(32).fill(seed + 1),
		updatedAt: 1_700_000_000_000 + seed,
	}
}
function key(seed: number): Uint8Array {
	return new Uint8Array(32).fill(seed)
}

/** A promise the test controls the settlement of, to force `activate()`
 * calls to resolve in a chosen order. */
function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (err: unknown) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve, reject }
}

describe("initial state", () => {
	it("getState is null before anything is activated", () => {
		expect(e2eeRuntime.getState()).toBeNull()
	})

	it("getActiveAccountId is null before anything is activated", () => {
		expect(e2eeRuntime.getActiveAccountId()).toBeNull()
	})
})

describe("activate — no persisted state", () => {
	it("still activates the account, with identity: null and an empty trust map", async () => {
		await e2eeRuntime.activate(accountA)
		const state = e2eeRuntime.getState()
		expect(state).not.toBeNull()
		expect(state!.accountId).toBe(accountA)
		expect(state!.identity).toBeNull()
		expect(state!.trustedKeys.size).toBe(0)
	})

	it("getActiveAccountId reflects the activated account", async () => {
		await e2eeRuntime.activate(accountA)
		expect(e2eeRuntime.getActiveAccountId()).toBe(accountA)
	})
})

describe("activate — persisted identity and trust exist", () => {
	it("loads the identity into memory", async () => {
		await saveIdentity(accountA, keypair(1))
		await e2eeRuntime.activate(accountA)

		const state = e2eeRuntime.getState()
		expect(state!.identity).not.toBeNull()
		expect(Array.from(state!.identity!.privateKey)).toEqual(Array.from(keypair(1).privateKey))
		expect(Array.from(state!.identity!.publicKey)).toEqual(Array.from(keypair(1).publicKey))
	})

	it("loads every trusted key for the account into memory, keyed by recipient", async () => {
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveTrustedKey(accountA, recipient2, key(2))
		await e2eeRuntime.activate(accountA)

		const state = e2eeRuntime.getState()
		expect(state!.trustedKeys.size).toBe(2)
		expect(Array.from(state!.trustedKeys.get(recipient1)!)).toEqual(Array.from(key(1)))
		expect(Array.from(state!.trustedKeys.get(recipient2)!)).toEqual(Array.from(key(2)))
	})

	it("loads both identity and trust together", async () => {
		await saveIdentity(accountA, keypair(3))
		await saveTrustedKey(accountA, recipient1, key(5))
		await e2eeRuntime.activate(accountA)

		const state = e2eeRuntime.getState()
		expect(state!.identity).not.toBeNull()
		expect(state!.trustedKeys.size).toBe(1)
	})
})

describe("account isolation via activate", () => {
	it("activating B never loads A's identity or trusted keys, even when A was activated first", async () => {
		await saveIdentity(accountA, keypair(1))
		await saveTrustedKey(accountA, recipient1, key(1))
		await saveIdentity(accountB, keypair(2))
		await saveTrustedKey(accountB, recipient2, key(2))

		await e2eeRuntime.activate(accountA)
		await e2eeRuntime.activate(accountB) // no intervening clear() — activate fully replaces state

		const state = e2eeRuntime.getState()
		expect(state!.accountId).toBe(accountB)
		expect(Array.from(state!.identity!.privateKey)).toEqual(Array.from(keypair(2).privateKey))
		expect(state!.trustedKeys.size).toBe(1)
		expect(state!.trustedKeys.has(recipient2)).toBe(true)
		expect(state!.trustedKeys.has(recipient1)).toBe(false) // A's recipient must not leak into B
	})

	it("activating an account with no identity after one that HAD an identity does not leave a stale identity in memory", async () => {
		await saveIdentity(accountA, keypair(1))
		await e2eeRuntime.activate(accountA)
		expect(e2eeRuntime.getState()!.identity).not.toBeNull()

		await e2eeRuntime.activate(accountB) // B has nothing persisted
		expect(e2eeRuntime.getState()!.identity).toBeNull()
	})
})

describe("clear — in-memory only", () => {
	it("wipes the in-memory state back to null", async () => {
		await e2eeRuntime.activate(accountA)
		e2eeRuntime.clear()
		expect(e2eeRuntime.getState()).toBeNull()
		expect(e2eeRuntime.getActiveAccountId()).toBeNull()
	})

	it("is a harmless no-op when nothing was active", () => {
		expect(() => e2eeRuntime.clear()).not.toThrow()
		expect(e2eeRuntime.getState()).toBeNull()
	})

	it("does NOT touch persisted storage — identity is still readable directly afterwards", async () => {
		await saveIdentity(accountA, keypair(4))
		await e2eeRuntime.activate(accountA)
		e2eeRuntime.clear()

		// Read the STORE directly (bypassing the runtime) to prove persistence
		// survived clear() — this is task 13's requirement.
		const stillThere = await getIdentity(accountA)
		expect(stillThere).not.toBeNull()
		expect(Array.from(stillThere!.privateKey)).toEqual(Array.from(keypair(4).privateKey))
	})

	it("does NOT touch persisted trusted keys either", async () => {
		await saveTrustedKey(accountA, recipient1, key(2))
		await e2eeRuntime.activate(accountA)
		e2eeRuntime.clear()

		const stillThere = await getTrustedKey(accountA, recipient1)
		expect(stillThere).not.toBeNull()
	})

	it("the SAME account can be re-activated after clear and gets its state back (logout, log back in)", async () => {
		await saveIdentity(accountA, keypair(6))
		await e2eeRuntime.activate(accountA)
		e2eeRuntime.clear()

		expect(e2eeRuntime.getState()).toBeNull() // confirm the clear actually took effect first

		await e2eeRuntime.activate(accountA)
		const state = e2eeRuntime.getState()
		expect(state!.accountId).toBe(accountA)
		expect(Array.from(state!.identity!.privateKey)).toEqual(Array.from(keypair(6).privateKey))
	})
})

describe("reload-style rehydration", () => {
	it("clear() followed by activate() for the same account reproduces the pre-clear state from storage alone", async () => {
		// A real page reload constructs a brand-new `e2eeRuntime` instance
		// (activeAccountId: null, activeIdentity: null) whose FIRST call is
		// `activate(accountId)` reading from IndexedDB. clear() -> activate()
		// on the existing singleton starts from that identical null state and
		// takes the identical code path, so it is a faithful simulation.
		await saveIdentity(accountA, keypair(7))
		await saveTrustedKey(accountA, recipient1, key(3))
		await e2eeRuntime.activate(accountA)
		const before = e2eeRuntime.getState()!

		e2eeRuntime.clear()
		await e2eeRuntime.activate(accountA)
		const after = e2eeRuntime.getState()!

		expect(Array.from(after.identity!.privateKey)).toEqual(Array.from(before.identity!.privateKey))
		expect(Array.from(after.trustedKeys.get(recipient1)!)).toEqual(
			Array.from(before.trustedKeys.get(recipient1)!),
		)
	})
})

describe("activate — storage failure degrades gracefully", () => {
	it("still activates the account (identity: null) instead of rejecting, when getIdentity throws", async () => {
		vi.spyOn(identityStore, "getIdentity").mockRejectedValueOnce(new Error("boom"))
		await expect(e2eeRuntime.activate(accountA)).resolves.toBeUndefined()

		const state = e2eeRuntime.getState()
		expect(state).not.toBeNull()
		expect(state!.accountId).toBe(accountA)
		expect(state!.identity).toBeNull()
		expect(state!.trustedKeys.size).toBe(0)
	})

	it("still activates the account when listTrustedKeys throws", async () => {
		await saveIdentity(accountA, keypair(1))
		vi.spyOn(trustStore, "listTrustedKeys").mockRejectedValueOnce(new Error("boom"))

		await expect(e2eeRuntime.activate(accountA)).resolves.toBeUndefined()
		const state = e2eeRuntime.getState()
		// Promise.all rejects as a whole on either failure, so a trust-store
		// failure also means the identity that WAS loadable is not applied
		// this cycle — the account is still activated with nothing loaded,
		// which is the same safe "no restored identity yet" degraded state.
		expect(state!.accountId).toBe(accountA)
		expect(state!.identity).toBeNull()
	})
})

describe("out-of-order activate() resolution (generation guard)", () => {
	it("a slow activate(A) that resolves AFTER a fast activate(B) must not overwrite B's state", async () => {
		const slow = deferred<Awaited<ReturnType<typeof getIdentity>>>()
		vi.spyOn(identityStore, "getIdentity").mockImplementationOnce(() => slow.promise as never)

		const slowActivate = e2eeRuntime.activate(accountA) // starts, awaits the deferred
		await e2eeRuntime.activate(accountB) // resolves immediately (real DB read, nothing persisted)

		expect(e2eeRuntime.getState()!.accountId).toBe(accountB)

		slow.resolve(keypair(1)) // let the stale A activation finish late
		await slowActivate

		// B must still be active — the late A result must have been discarded.
		expect(e2eeRuntime.getState()!.accountId).toBe(accountB)
	})

	it("a slow activate(A) that resolves AFTER clear() must not un-clear the runtime", async () => {
		const slow = deferred<Awaited<ReturnType<typeof getIdentity>>>()
		vi.spyOn(identityStore, "getIdentity").mockImplementationOnce(() => slow.promise as never)

		const slowActivate = e2eeRuntime.activate(accountA)
		e2eeRuntime.clear() // logout while the read is still in flight

		expect(e2eeRuntime.getState()).toBeNull()

		slow.resolve(keypair(1))
		await slowActivate

		expect(e2eeRuntime.getState()).toBeNull() // must still be cleared
	})
})

describe("installIdentity", () => {
	it("persists the identity via the store", async () => {
		await e2eeRuntime.installIdentity(accountA, keypair(1))
		const stored = await getIdentity(accountA)
		expect(Array.from(stored!.privateKey)).toEqual(Array.from(keypair(1).privateKey))
	})

	it("updates in-memory state when the target account is the active one", async () => {
		await e2eeRuntime.activate(accountA) // active, no identity yet
		await e2eeRuntime.installIdentity(accountA, keypair(2))

		expect(Array.from(e2eeRuntime.getState()!.identity!.privateKey)).toEqual(
			Array.from(keypair(2).privateKey),
		)
	})

	it("does NOT touch in-memory state when a DIFFERENT account is active", async () => {
		await e2eeRuntime.activate(accountB) // B is active
		await e2eeRuntime.installIdentity(accountA, keypair(3)) // install for A

		expect(e2eeRuntime.getState()!.accountId).toBe(accountB)
		expect(e2eeRuntime.getState()!.identity).toBeNull() // B's memory unaffected

		const storedForA = await getIdentity(accountA) // but A's storage did get it
		expect(storedForA).not.toBeNull()
	})

	it("works with no account active at all (pure persistence, no memory side effect)", async () => {
		await expect(e2eeRuntime.installIdentity(accountA, keypair(4))).resolves.toBeUndefined()
		expect(e2eeRuntime.getState()).toBeNull()
	})
})

describe("pinTrustedKey", () => {
	it("throws E2eeRuntimeError('no_active_account') when nothing is active", async () => {
		await expect(e2eeRuntime.pinTrustedKey(recipient1, key(1))).rejects.toMatchObject({
			name: "E2eeRuntimeError",
			code: "no_active_account",
		})
		await expect(e2eeRuntime.pinTrustedKey(recipient1, key(1))).rejects.toBeInstanceOf(
			E2eeRuntimeError,
		)
	})

	it("pins for the active account, in memory and in storage", async () => {
		await e2eeRuntime.activate(accountA)
		const result = await e2eeRuntime.pinTrustedKey(recipient1, key(1))

		expect(result.pinned).toBe(true)
		expect(Array.from(e2eeRuntime.getState()!.trustedKeys.get(recipient1)!)).toEqual(
			Array.from(key(1)),
		)
		const stored = await getTrustedKey(accountA, recipient1)
		expect(Array.from(stored!.publicKey)).toEqual(Array.from(key(1)))
	})

	it("never overwrites an existing pin — a second call for the same recipient is a no-op", async () => {
		await e2eeRuntime.activate(accountA)
		await e2eeRuntime.pinTrustedKey(recipient1, key(1))
		const second = await e2eeRuntime.pinTrustedKey(recipient1, key(9))

		expect(second.pinned).toBe(false)
		expect(Array.from(second.existing!.publicKey)).toEqual(Array.from(key(1)))
		// In-memory copy must also still be the FIRST key, not the second attempt.
		expect(Array.from(e2eeRuntime.getState()!.trustedKeys.get(recipient1)!)).toEqual(
			Array.from(key(1)),
		)
	})

	it("pins land under the currently-active account, isolated from other accounts", async () => {
		await e2eeRuntime.activate(accountA)
		await e2eeRuntime.pinTrustedKey(recipient1, key(1))

		const forB = await listTrustedKeys(accountB)
		expect(forB.size).toBe(0)
	})

	it("a pin started under A that resolves AFTER the runtime switches to B does not pollute B's in-memory map", async () => {
		const slow = deferred<Awaited<ReturnType<typeof trustStore.pinIfAbsent>>>()
		vi.spyOn(trustStore, "pinIfAbsent").mockImplementationOnce(() => slow.promise as never)

		await e2eeRuntime.activate(accountA)
		const slowPin = e2eeRuntime.pinTrustedKey(recipient1, key(1)) // in flight, scoped to A

		e2eeRuntime.clear()
		await e2eeRuntime.activate(accountB) // now B is active

		slow.resolve({ pinned: true, existing: null }) // the A-scoped write "completes" late
		await slowPin

		// B's in-memory trust map must not contain a key that was pinned for A.
		expect(e2eeRuntime.getState()!.trustedKeys.has(recipient1)).toBe(false)
	})
})
