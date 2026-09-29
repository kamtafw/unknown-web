/**
 * Account-scoped persistence for pinned recipient identity public keys
 * (trust-on-first-use state).
 *
 * Like `identity-store.ts`, this is MECHANICAL storage. It does not decide
 * trust POLICY — in particular it does NOT enforce "never silently replace
 * an existing trusted key" (e2ee_implementation_brief.md §5.1). That
 * decision belongs to the send/receive boundary (E3/E4), which has the
 * context (a freshly authenticated bundle, a user-facing confirmation flow)
 * to decide whether a changed key should be accepted. `saveTrustedKey` here
 * is a plain upsert; `pinIfAbsent` below is the one exception — a atomic
 * insert-only helper so that policy can be implemented correctly without
 * every caller re-deriving get-then-put race safety by hand.
 *
 * Isolation: every operation is keyed by `[accountId, recipientId]` (a
 * compound IndexedDB key) or scoped through the `byAccount` index. There is
 * no query shape here that reads across accounts and narrows afterwards.
 */

import { type Pkid, asPkid } from "@/types/messenger"
import {
	TRUSTED_KEYS_BY_ACCOUNT_INDEX,
	TRUSTED_KEYS_STORE,
	getE2eeDatabase,
	type StoredTrustedKeyRow,
} from "./storage/database"
import { promisifyRequest, promisifyTransaction } from "./storage/indexeddb"

export interface StoredTrustedKey {
	publicKey: Uint8Array
	/** `Date.now()` at the time this key was pinned — diagnostic only. */
	pinnedAt: number
}

function toStoredTrustedKey(row: StoredTrustedKeyRow): StoredTrustedKey {
	return { publicKey: row.publicKey, pinnedAt: row.pinnedAt }
}

/** `null` if no key has been pinned for this (account, recipient) pair. */
export async function getTrustedKey(
	accountId: Pkid,
	recipientId: Pkid,
): Promise<StoredTrustedKey | null> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readonly")
	const row = await promisifyRequest<StoredTrustedKeyRow | undefined>(
		tx.objectStore(TRUSTED_KEYS_STORE).get([accountId, recipientId]),
	)
	return row ? toStoredTrustedKey(row) : null
}

/** Unconditional upsert. See the file header — callers implementing the
 * "changed key fails closed" policy should prefer `pinIfAbsent`, or read
 * `getTrustedKey` first and make an explicit, deliberate decision to call
 * this to replace a key (e.g. after a confirmed key-change flow). */
export async function saveTrustedKey(
	accountId: Pkid,
	recipientId: Pkid,
	publicKey: Uint8Array,
	pinnedAt: number = Date.now(),
): Promise<void> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readwrite")
	tx.objectStore(TRUSTED_KEYS_STORE).put({
		accountId,
		recipientId,
		publicKey,
		pinnedAt,
	} satisfies StoredTrustedKeyRow)
	await promisifyTransaction(tx)
}

export interface PinIfAbsentResult {
	/** `true` if `publicKey` was newly written; `false` if a key was already
	 * pinned (in which case `existing` is that key — possibly different from
	 * `publicKey` — and nothing was written). */
	pinned: boolean
	existing: StoredTrustedKey | null
}

/**
 * Atomic "pin on first use": within a single readwrite transaction, reads
 * the current value and writes `publicKey` ONLY if nothing is pinned yet.
 * Never overwrites an existing key. This is the primitive E3/E4 should use
 * for "first successful observation pins the key" (brief §5.1) — the
 * transaction closes the get-then-put race a caller doing those two steps
 * separately would have.
 */
export async function pinIfAbsent(
	accountId: Pkid,
	recipientId: Pkid,
	publicKey: Uint8Array,
	pinnedAt: number = Date.now(),
): Promise<PinIfAbsentResult> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readwrite")
	const store = tx.objectStore(TRUSTED_KEYS_STORE)

	const existingRow = await promisifyRequest<StoredTrustedKeyRow | undefined>(
		store.get([accountId, recipientId]),
	)

	if (existingRow) {
		await promisifyTransaction(tx)
		return { pinned: false, existing: toStoredTrustedKey(existingRow) }
	}

	store.put({ accountId, recipientId, publicKey, pinnedAt } satisfies StoredTrustedKeyRow)
	await promisifyTransaction(tx)
	return { pinned: true, existing: null }
}

/** NOT wired to any UI in this milestone — see the note on
 * `identity-store.ts`'s `removeIdentity`. Exists for a future explicit
 * "forget this contact's key" feature and for test/audit cleanup. */
export async function removeTrustedKey(accountId: Pkid, recipientId: Pkid): Promise<void> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readwrite")
	tx.objectStore(TRUSTED_KEYS_STORE).delete([accountId, recipientId])
	await promisifyTransaction(tx)
}

/** Every trusted key pinned for one account, as a `Map` keyed by recipient.
 * Used by `runtime.ts` to warm the in-memory trust map on `activate()`. */
export async function listTrustedKeys(accountId: Pkid): Promise<Map<Pkid, StoredTrustedKey>> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readonly")
	const rows = await promisifyRequest<StoredTrustedKeyRow[]>(
		tx.objectStore(TRUSTED_KEYS_STORE).index(TRUSTED_KEYS_BY_ACCOUNT_INDEX).getAll(accountId),
	)

	const result = new Map<Pkid, StoredTrustedKey>()
	for (const row of rows) result.set(asPkid(row.recipientId), toStoredTrustedKey(row))
	return result
}

/** Deletes every trusted key for one account. See the removal note above —
 * not wired to any UI here. */
export async function removeAllTrustedKeys(accountId: Pkid): Promise<void> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(TRUSTED_KEYS_STORE, "readwrite")
	const store = tx.objectStore(TRUSTED_KEYS_STORE)
	const index = store.index(TRUSTED_KEYS_BY_ACCOUNT_INDEX)

	await new Promise<void>((resolve, reject) => {
		const request = index.openCursor(IDBKeyRange.only(accountId))
		request.onsuccess = () => {
			const cursor = request.result
			if (cursor) {
				cursor.delete()
				cursor.continue()
			} else {
				resolve()
			}
		}
		request.onerror = () => reject(request.error)
	})

	await promisifyTransaction(tx)
}
