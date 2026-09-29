/**
 * Error surface for the E2EE storage layer (IndexedDB).
 *
 * Deliberately separate from `../errors.ts` (`E2eeCryptoError`), which is
 * scoped to the crypto primitives — see that file's own header. Storage
 * failures are a different concern (platform/environment, not protocol
 * correctness) and should never be confused with a crypto validation
 * failure.
 *
 * As with the crypto errors, messages are fixed strings and never echo
 * caller-supplied data (account ids are numeric and fine to include; key
 * material never is).
 */

export type E2eeStorageErrorCode =
	/** `indexedDB` is not defined (SSR) or the platform refused to open a
	 * database (e.g. private browsing in some engines, storage disabled). */
	| "storage_unavailable"
	/** The underlying IndexedDB request failed for a reason other than
	 * unavailability (quota, corruption, a blocked upgrade, etc). */
	| "storage_failure"

export class E2eeStorageError extends Error {
	readonly code: E2eeStorageErrorCode

	constructor(code: E2eeStorageErrorCode, message: string) {
		super(message)
		this.name = "E2eeStorageError"
		this.code = code
	}
}
