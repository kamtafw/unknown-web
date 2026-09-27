/**
 * In-memory E2EE runtime for the CURRENT account.
 *
 * This is the one place a restored private key lives outside IndexedDB. It
 * is a plain in-memory cache warmed from `identity-store.ts` /
 * `trust-store.ts` — the persistent copies remain the source of truth.
 *
 * Lifecycle (fixed for v1 — see e2ee_implementation_brief.md and the E0.2
 * milestone decision):
 *
 *   Page reload            → persisted state survives; `activate()` re-reads
 *                             it into memory. No PIN required.
 *   Logout / account switch → `clear()` wipes this in-memory state only.
 *                             IndexedDB is untouched.
 *   Same account logs in
 *   again                   → `activate()` rehydrates from IndexedDB again.
 *
 * `clear()` is the ONLY thing ordinary logout/account-switch should ever
 * call. Deleting persisted identity/trust state is a distinct, not-yet-built
 * capability (`identity-store.removeIdentity`, `trust-store.
 * removeTrustedKey`) that this milestone deliberately does not wire to any
 * UI or lifecycle event — see the E0.2 task list.
 *
 * React ownership: this class has no React import and does not subscribe to
 * anything itself. A small bootstrap component (mirroring
 * `messenger-socket-bootstrap.tsx`) watches the active account and calls
 * `activate` / `clear` in response — see
 * `components/messenger/messenger-e2ee-bootstrap.tsx`.
 */

import { type Pkid } from "@/types/messenger"
import { getIdentity, saveIdentity, type StoredIdentity } from "./identity-store"
import { listTrustedKeys, pinIfAbsent, type PinIfAbsentResult } from "./trust-store"

export type E2eeRuntimeErrorCode = "no_active_account"

export class E2eeRuntimeError extends Error {
	readonly code: E2eeRuntimeErrorCode

	constructor(code: E2eeRuntimeErrorCode, message: string) {
		super(message)
		this.name = "E2eeRuntimeError"
		this.code = code
	}
}

export interface E2eeRuntimeState {
	accountId: Pkid
	/** `null` until E2 installs a verified identity for this account. */
	identity: StoredIdentity | null
	trustedKeys: ReadonlyMap<Pkid, Uint8Array>
}

function warnActivateFailure(err: unknown): void {
	if (process.env.NODE_ENV !== "production") {
		console.warn(
			"[messenger][e2ee] failed to load persisted identity/trust state; " +
				"continuing with no restored identity for this session.",
			err,
		)
	}
}

class E2eeRuntime {
	private activeAccountId: Pkid | null = null
	private activeIdentity: StoredIdentity | null = null
	private trustedKeys: Map<Pkid, Uint8Array> = new Map()

	/** Bumped by every `activate()`/`clear()` call. An in-flight `activate()`
	 * checks this before committing its result, so a slow call that has been
	 * superseded by a newer `activate()` (account switched again) or a
	 * `clear()` (logout) can never clobber state that came after it. */
	private generation = 0

	getState(): E2eeRuntimeState | null {
		if (this.activeAccountId === null) return null
		return {
			accountId: this.activeAccountId,
			identity: this.activeIdentity,
			trustedKeys: this.trustedKeys,
		}
	}

	getActiveAccountId(): Pkid | null {
		return this.activeAccountId
	}

	/**
	 * Loads the persisted identity and trusted keys for `accountId` into
	 * memory and makes it the active account.
	 *
	 * Never rejects. A storage read failure (e.g. IndexedDB unavailable)
	 * still activates the account, just with no identity and no trusted
	 * keys loaded — the same state a genuinely not-yet-recovered account
	 * would be in, which every consumer already has to handle (E1/E2
	 * prompts for recovery).
	 *
	 * Calling `activate` for the account that is ALREADY active re-reads
	 * storage and refreshes memory — harmless, and useful right after
	 * `installIdentity`/`pinTrustedKey` if a caller wants to confirm memory
	 * matches what's persisted.
	 */
	async activate(accountId: Pkid): Promise<void> {
		const generation = ++this.generation

		let identity: StoredIdentity | null = null
		let trusted: Map<Pkid, { publicKey: Uint8Array }> = new Map()
		try {
			;[identity, trusted] = await Promise.all([getIdentity(accountId), listTrustedKeys(accountId)])
		} catch (err) {
			warnActivateFailure(err)
		}

		if (generation !== this.generation) return // superseded by a later activate()/clear()

		this.activeAccountId = accountId
		this.activeIdentity = identity
		this.trustedKeys = new Map(
			Array.from(trusted, ([recipientId, key]) => [recipientId, key.publicKey]),
		)
	}

	/** Wipes IN-MEMORY state only. Never touches IndexedDB. Safe to call
	 * unconditionally (e.g. on every render of the lifecycle bootstrap's
	 * cleanup) — a no-op when nothing is active. */
	clear(): void {
		this.generation++
		this.activeAccountId = null
		this.activeIdentity = null
		this.trustedKeys = new Map()
	}

	/**
	 * Persists `identity` for `accountId` and, if that account is (still) the
	 * active one once the write completes, updates the in-memory copy too —
	 * so a caller never has to remember to call `activate` again just to see
	 * its own write reflected.
	 *
	 * This does not verify the keypair. E2's recovery flow must do that
	 * verification BEFORE calling this — see `identity-store.saveIdentity`.
	 */
	async installIdentity(accountId: Pkid, identity: StoredIdentity): Promise<void> {
		await saveIdentity(accountId, identity)
		if (this.activeAccountId === accountId) {
			this.activeIdentity = identity
		}
	}

	/**
	 * Pins `publicKey` for `recipientId` under the CURRENTLY active account,
	 * insert-only (never replaces an existing pinned key — see
	 * `trust-store.pinIfAbsent`). Throws `no_active_account` if nothing is
	 * active; callers must `activate()` first.
	 */
	async pinTrustedKey(recipientId: Pkid, publicKey: Uint8Array): Promise<PinIfAbsentResult> {
		const accountId = this.activeAccountId
		if (accountId === null) {
			throw new E2eeRuntimeError(
				"no_active_account",
				"Cannot pin a trusted key: no account is active",
			)
		}

		const result = await pinIfAbsent(accountId, recipientId, publicKey)
		// Re-check after the await: the active account may have changed while
		// this write was in flight. The STORAGE write above is always correct
		// (it was scoped to the accountId captured before the await); this
		// guard only decides whether it's still safe to also update the
		// in-memory map without polluting a different, now-active account.
		if (result.pinned && this.activeAccountId === accountId) {
			this.trustedKeys.set(recipientId, publicKey)
		}
		return result
	}
}

/** Single instance for the whole browser session, matching the existing
 * `messengerSocket` singleton pattern (`lib/messenger/socket-manager.ts`). */
export const e2eeRuntime = new E2eeRuntime()
