/**
 * Minimal generic IndexedDB promise wrapper.
 *
 * This file knows nothing about Messenger, accounts, or E2EE — it is a small
 * reusable adapter over the callback-based IndexedDB API. No dependency is
 * added for this deliberately: the surface actually needed (open with
 * upgrade, get/put/delete on a store, cursor a non-unique index) is small
 * enough that a wrapper is cheaper than an audited third-party lib, and
 * keeping it here means the ONE place that talks to raw `IDBRequest`/
 * `IDBTransaction` objects is this file.
 *
 * `database.ts` (schema) and the two stores build on this; nothing else in
 * the app should import it directly.
 */

import { E2eeStorageError } from "./errors"

export function isIndexedDbAvailable(): boolean {
	return typeof indexedDB !== "undefined"
}

function requireIndexedDb(): IDBFactory {
	if (!isIndexedDbAvailable()) {
		throw new E2eeStorageError(
			"storage_unavailable",
			"indexedDB is not available in this environment",
		)
	}
	return indexedDB
}

export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => {
			reject(
				new E2eeStorageError(
					"storage_failure",
					`IndexedDB request failed: ${request.error?.name ?? "unknown error"}`,
				),
			)
		}
	})
}

/** Resolves once every request on the transaction has committed; rejects on
 * abort or error. Use this (not the last request's `onsuccess`) to know a
 * multi-step read-then-write is durably committed. */
export function promisifyTransaction(tx: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve()
		tx.onerror = () => {
			reject(
				new E2eeStorageError(
					"storage_failure",
					`IndexedDB transaction failed: ${tx.error?.name ?? "unknown error"}`,
				),
			)
		}
		tx.onabort = () => {
			reject(
				new E2eeStorageError(
					"storage_failure",
					`IndexedDB transaction aborted: ${tx.error?.name ?? "unknown error"}`,
				),
			)
		}
	})
}

export interface OpenDatabaseOptions {
	name: string
	version: number
	/** Called inside the `upgradeneeded` handler. Create/upgrade object stores
	 * and indexes here; nothing else. */
	upgrade: (db: IDBDatabase, oldVersion: number) => void
}

/**
 * Opens (or upgrades) a database. Throws `storage_unavailable` synchronously
 * if `indexedDB` doesn't exist — callers on the server (SSR) or in an
 * environment without IndexedDB get a typed error, not a crash.
 */
export function openDatabase({
	name,
	version,
	upgrade,
}: OpenDatabaseOptions): Promise<IDBDatabase> {
	const idb = requireIndexedDb()

	return new Promise((resolve, reject) => {
		const request = idb.open(name, version)

		request.onupgradeneeded = (event) => {
			upgrade(request.result, event.oldVersion)
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => {
			reject(
				new E2eeStorageError(
					"storage_failure",
					`Failed to open database "${name}": ${request.error?.name ?? "unknown error"}`,
				),
			)
		}
		request.onblocked = () => {
			reject(
				new E2eeStorageError(
					"storage_failure",
					`Opening database "${name}" is blocked by another open connection`,
				),
			)
		}
	})
}
