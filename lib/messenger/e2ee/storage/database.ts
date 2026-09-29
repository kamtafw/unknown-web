/**
 * Database schema for E2EE account-scoped state.
 *
 * Two object stores:
 *
 *  - `identities`    — one row per account, keyed by `accountId` alone.
 *  - `trustedKeys`   — one row per (account, recipient) pair, keyed by the
 *                       COMPOUND key `[accountId, recipientId]`, with a
 *                       non-unique index on `accountId` for "all trusted
 *                       keys for this account" reads.
 *
 * Account isolation is enforced STRUCTURALLY by these keys, not by
 * filtering after a broader read: `get(accountId)` and
 * `get([accountId, recipientId])` cannot return a different account's row —
 * there is no query shape in this module that reads across accounts and
 * narrows afterwards. `identity-store.test.ts` /
 * `trust-store.test.ts` assert this directly against the raw database.
 */

import { openDatabase } from "./indexeddb"

export const E2EE_DATABASE_NAME = "appscombo-messenger-e2ee"
export const E2EE_DATABASE_VERSION = 2

export const LOCAL_MESSAGE_COPIES_STORE = "localMessageCopies"
export const LOCAL_MESSAGE_COPIES_BY_ACCOUNT_PEER_INDEX = "byAccountPeer"

export const IDENTITIES_STORE = "identities"
export const TRUSTED_KEYS_STORE = "trustedKeys"
export const TRUSTED_KEYS_BY_ACCOUNT_INDEX = "byAccount"

/** Row shape as actually stored — plain `number` account/recipient ids
 * (IndexedDB keys are runtime values; the `Pkid` brand is a compile-time-only
 * construct applied at the identity-store/trust-store boundary). */
export interface StoredIdentityRow {
	accountId: number
	privateKey: Uint8Array
	publicKey: Uint8Array
	updatedAt: number
}

export interface StoredTrustedKeyRow {
	accountId: number
	recipientId: number
	publicKey: Uint8Array
	pinnedAt: number
}

export interface StoredLocalMessageCopyRow {
	accountId: number
	messageId: number
	peerId: number

	/**
	 * SHA-256 fingerprint of the exact server envelope:
	 * ciphertext + nonce + sender public key.
	 */
	envelopeHash: string

	/**
	 * Plaintext is never stored directly.
	 * It is encrypted with the account's restored identity private key.
	 */
	ciphertext: Uint8Array
	nonce: Uint8Array

	messageType: string
	createdAt: number
	updatedAt: number
}

function upgrade(db: IDBDatabase, oldVersion: number): void {
	if (oldVersion < 1) {
		db.createObjectStore(IDENTITIES_STORE, { keyPath: "accountId" })

		const trustedKeys = db.createObjectStore(TRUSTED_KEYS_STORE, {
			keyPath: ["accountId", "recipientId"],
		})
		trustedKeys.createIndex(TRUSTED_KEYS_BY_ACCOUNT_INDEX, "accountId", { unique: false })
	}

	if (oldVersion < 2) {
		const localMessageCopies = db.createObjectStore(LOCAL_MESSAGE_COPIES_STORE, {
			keyPath: ["accountId", "messageId"],
		})

		localMessageCopies.createIndex(
			LOCAL_MESSAGE_COPIES_BY_ACCOUNT_PEER_INDEX,
			["accountId", "peerId"],
			{ unique: false },
		)
	}
}

/** One open connection per browser tab, reused across calls. */
let cachedDatabase: Promise<IDBDatabase> | null = null

export function getE2eeDatabase(): Promise<IDBDatabase> {
	if (!cachedDatabase) {
		cachedDatabase = openDatabase({
			name: E2EE_DATABASE_NAME,
			version: E2EE_DATABASE_VERSION,
			upgrade,
		}).catch((err: unknown) => {
			// Don't cache a rejected promise — a transient failure (e.g. a
			// blocked upgrade from another tab) shouldn't wedge every future
			// call into the same rejection.
			cachedDatabase = null
			throw err
		})
	}
	return cachedDatabase
}

/**
 * TEST ONLY — not re-exported from `lib/messenger/e2ee/index.ts`. Closes and
 * drops the cached connection so the next `getE2eeDatabase()` call reopens
 * against whatever `indexedDB` currently points to (a fresh fake-indexeddb
 * instance between test files, for example).
 */
export function resetE2eeDatabaseForTests(): void {
	if (cachedDatabase) {
		void cachedDatabase.then((db) => db.close()).catch(() => undefined)
	}
	cachedDatabase = null
}
