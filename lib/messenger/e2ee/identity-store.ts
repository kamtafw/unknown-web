/**
 * Account-scoped persistence for the restored E2EE identity (the NaCl box
 * keypair recovered from the mobile-created backup — see E1/E2).
 *
 * This module is MECHANICAL storage only: it does not validate a keypair,
 * derive a public key, or decide whether an identity is trustworthy. The
 * recovery flow verifies the keypair, then uses the runtime's guarded install
 * path, which calls `saveIdentity` with cancellation tied to account lifecycle.
 *
 * Isolation: every operation is keyed by `accountId`. `getIdentity(A)` can
 * only ever read the row stored at key `A` — there is no "get all, then
 * filter" path here for a single account to leak into another's read.
 */

import { type Pkid, asPkid } from "@/types/messenger"
import { IDENTITIES_STORE, getE2eeDatabase, type StoredIdentityRow } from "./storage/database"
import { promisifyRequest, promisifyTransaction } from "./storage/indexeddb"

export interface StoredIdentity {
	privateKey: Uint8Array
	publicKey: Uint8Array
	/** `Date.now()` at the time this identity was saved — diagnostic only,
	 * never used for any protocol decision. */
	updatedAt: number
}

function toStoredIdentity(row: StoredIdentityRow): StoredIdentity {
	return { privateKey: row.privateKey, publicKey: row.publicKey, updatedAt: row.updatedAt }
}

/** Returns `null` if no identity has been installed for this account yet —
 * NOT an error. A missing identity is the normal state before E2 recovery. */
export async function getIdentity(accountId: Pkid): Promise<StoredIdentity | null> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(IDENTITIES_STORE, "readonly")
	const row = await promisifyRequest<StoredIdentityRow | undefined>(
		tx.objectStore(IDENTITIES_STORE).get(accountId),
	)
	return row ? toStoredIdentity(row) : null
}

/**
 * Overwrites whatever identity (if any) is stored for this account. Callers
 * are responsible for verifying the keypair BEFORE calling this — the
 * recovery path does that in `backup-recovery.ts`. This function does not
 * re-derive or re-check anything; it persists exactly what it's given. When
 * supplied, the AbortSignal cancels the transaction if the account lifecycle
 * supersedes the recovery attempt.
 */
export async function saveIdentity(
	accountId: Pkid,
	identity: StoredIdentity,
	signal?: AbortSignal,
): Promise<void> {
	if (signal?.aborted) throw new Error("Identity installation aborted")

	const db = await getE2eeDatabase()
	if (signal?.aborted) throw new Error("Identity installation aborted")

	const tx = db.transaction(IDENTITIES_STORE, "readwrite")
	const abortTransaction = () => {
		try {
			tx.abort()
		} catch {
			// The transaction may already have completed or aborted.
		}
	}
	signal?.addEventListener("abort", abortTransaction, { once: true })

	try {
		if (signal?.aborted) {
			abortTransaction()
		} else {
			tx.objectStore(IDENTITIES_STORE).put({
				accountId,
				privateKey: identity.privateKey,
				publicKey: identity.publicKey,
				updatedAt: identity.updatedAt,
			} satisfies StoredIdentityRow)
		}
		await promisifyTransaction(tx)
		if (signal?.aborted) throw new Error("Identity installation aborted")
	} finally {
		signal?.removeEventListener("abort", abortTransaction)
	}
}

/**
 * Atomically installs an identity only when this account has no identity.
 *
 * IndexedDB's readwrite transaction serializes competing writers, and
 * ObjectStore.add() enforces insert-only semantics at the storage boundary.
 * This is the only write path recovery should use: a prior getIdentity()
 * check alone cannot prevent two concurrent recoveries from overwriting one
 * another.
 *
 * Returns false when another operation has already installed an identity.
 * The optional signal aborts an in-flight transaction on logout/account switch.
 */
export async function installIdentityIfAbsent(
	accountId: Pkid,
	identity: StoredIdentity,
	signal?: AbortSignal,
): Promise<boolean> {
	if (signal?.aborted) throw new Error("Identity installation aborted")

	const db = await getE2eeDatabase()
	if (signal?.aborted) throw new Error("Identity installation aborted")

	const tx = db.transaction(IDENTITIES_STORE, "readwrite")
	const abortTransaction = () => {
		try {
			tx.abort()
		} catch {
			// The transaction may already have completed or aborted.
		}
	}
	signal?.addEventListener("abort", abortTransaction, { once: true })

	let alreadyExists = false
	try {
		if (signal?.aborted) {
			abortTransaction()
		} else {
			const request = tx.objectStore(IDENTITIES_STORE).add({
				accountId,
				privateKey: identity.privateKey,
				publicKey: identity.publicKey,
				updatedAt: identity.updatedAt,
			} satisfies StoredIdentityRow)

			request.onerror = (event) => {
				if (request.error?.name === "ConstraintError") {
					// A row already exists. Prevent this expected insert-only
					// conflict from aborting the transaction; no write occurred.
					event.preventDefault()
					event.stopPropagation()
					alreadyExists = true
				}
			}
		}
		await promisifyTransaction(tx)
		if (signal?.aborted) throw new Error("Identity installation aborted")
		return !alreadyExists
	} finally {
		signal?.removeEventListener("abort", abortTransaction)
	}
}

/**
 * Deletes the persisted identity for one account. NOT wired to any UI in
 * this milestone — ordinary logout/account-switch must NOT call this (see
 * `runtime.ts`'s `clear()`, which only touches in-memory state). Exists for
 * a future explicit "forget this device's identity" feature and for test/
 * audit cleanup.
 */
export async function removeIdentity(accountId: Pkid): Promise<void> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(IDENTITIES_STORE, "readwrite")
	tx.objectStore(IDENTITIES_STORE).delete(accountId)
	await promisifyTransaction(tx)
}

/** Every account id that currently has a persisted identity. Returns ids
 * only — never key material — safe for audit/cleanup tooling that has no
 * business reading anyone's private key. */
export async function listIdentityAccountIds(): Promise<Pkid[]> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(IDENTITIES_STORE, "readonly")
	const keys = await promisifyRequest<IDBValidKey[]>(tx.objectStore(IDENTITIES_STORE).getAllKeys())
	return keys.map((key) => asPkid(key as number))
}
