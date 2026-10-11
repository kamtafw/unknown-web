/**
 * E2 — restore a verified identity from a mobile-created, validated backup.
 *
 * This file accepts only a `ValidatedBackupV1` object produced by the E1
 * validator. That boundary is deliberate: the raw HTTP payload is never
 * treated as trustworthy, and this local recovery path must never guess or
 * repair a malformed backup.
 *
 * Flow:
 *   1. Validate the six-digit PIN format.
 *   2. Derive the wrapping key from the backup's PBKDF2 parameters.
 *   3. Open the secretbox ciphertext with the backup nonce.
 *   4. Require exactly 32 bytes of plaintext, treat any remainder as failure.
 *   5. Derive the public key from the secret key and compare it to the backup's
 *      `identity_public_key` with constant-time comparison.
 *   6. Only then persist the verified identity through a runtime-generation-
 *      guarded install that is cancelled by logout or account switching.
 *
 * On any failure, return `null` and do not log the PIN, private key,
 * wrapping key, decrypted backup, or any secret material.
 */

import { type Pkid } from "@/types/messenger"
import { type ValidatedBackupV1 } from "./backup-validation"
import { BOX_SECRET_KEY_LENGTH } from "./constants"
import { utf8ToBytes } from "./encoding"
import { getIdentity, type StoredIdentity } from "./identity-store"
import { boxPublicKeyFromSecretKey, constantTimeEqual, secretboxOpen } from "./nacl"
import { e2eeRuntime } from "./runtime"
import { pbkdf2HmacSha256 } from "./webcrypto"

const VALID_PIN_PATTERN = /^[0-9]{6}$/

/**
 * Temporary, stage-only diagnostics for the recovery regression.
 * Never log identifiers, PINs, backup bytes, keys, or exception messages.
 * Remove after the failing stage is identified.
 */
function recoveryDiagnostic(stage: string, outcome: string): void {
	if (process.env.NODE_ENV !== "production") {
		console.warn(`[messenger][e2ee][recovery-diagnostic] stage=${stage} outcome=${outcome}`)
	}
}

/** Returns `null` on any generic recovery failure. Diagnostics are stage-only. */
export async function recoverIdentityFromBackup(
	accountId: Pkid,
	backup: ValidatedBackupV1,
	pin: string,
): Promise<StoredIdentity | null> {
	let stage = "pin-validation"
	if (!VALID_PIN_PATTERN.test(pin)) {
		recoveryDiagnostic(stage, "rejected")
		return null
	}

	// Recovery must start inside the intended account's active runtime. A null
	// runtime is not permission to continue after logout.
	stage = "initial-account-guard"
	const generationToken = e2eeRuntime.getGenerationToken()
	if (!e2eeRuntime.isCurrentAccount(accountId, generationToken)) {
		recoveryDiagnostic(stage, "rejected")
		return null
	}

	try {
		stage = "read-existing-identity"
		const existing = await getIdentity(accountId)
		stage = "post-identity-read-account-guard"
		if (!e2eeRuntime.isCurrentAccount(accountId, generationToken)) {
			recoveryDiagnostic(stage, "stale")
			return null
		}
		if (existing !== null) {
			recoveryDiagnostic("existing-identity-check", "identity-already-present")
			return null
		}

		stage = "pbkdf2-derive"
		const wrappingKey = await pbkdf2HmacSha256({
			password: utf8ToBytes(pin),
			salt: backup.kdf.salt,
			iterations: backup.kdf.iterations,
		})
		stage = "post-pbkdf2-account-guard"
		if (!e2eeRuntime.isCurrentAccount(accountId, generationToken)) {
			wrappingKey.fill(0)
			recoveryDiagnostic(stage, "stale")
			return null
		}

		stage = "secretbox-open"
		const privateKey = secretboxOpen({
			ciphertext: backup.ciphertext,
			nonce: backup.nonce,
			key: wrappingKey,
		})
		wrappingKey.fill(0)
		if (privateKey === null) {
			recoveryDiagnostic(stage, "authentication-failed")
			return null
		}
		stage = "decrypted-key-length"
		if (privateKey.length !== BOX_SECRET_KEY_LENGTH) {
			privateKey.fill(0)
			recoveryDiagnostic(stage, "rejected")
			return null
		}

		stage = "derive-public-key"
		const publicKey = boxPublicKeyFromSecretKey(privateKey)
		stage = "verify-public-key"
		if (!constantTimeEqual(publicKey, backup.identityPublicKey)) {
			privateKey.fill(0)
			recoveryDiagnostic(stage, "mismatch")
			return null
		}

		stage = "pre-install-account-guard"
		if (!e2eeRuntime.isCurrentAccount(accountId, generationToken)) {
			privateKey.fill(0)
			recoveryDiagnostic(stage, "stale")
			return null
		}
		stage = "pre-install-runtime-state"
		const state = e2eeRuntime.getState()
		if (!state || state.accountId !== accountId || state.identity !== null) {
			privateKey.fill(0)
			recoveryDiagnostic(stage, "rejected")
			return null
		}

		const identity: StoredIdentity = {
			privateKey,
			publicKey,
			updatedAt: Date.now(),
		}

		stage = "install-recovered-identity"
		const installed = await e2eeRuntime.installRecoveredIdentity(
			accountId,
			identity,
			generationToken,
		)
		if (!installed) {
			privateKey.fill(0)
			publicKey.fill(0)
			recoveryDiagnostic(stage, "rejected-or-stale")
			return null
		}
		recoveryDiagnostic("complete", "success")
		return identity
	} catch (error) {
		// Only emit the stage and exception class. Error messages can contain
		// implementation details and are intentionally excluded.
		const errorType = error instanceof Error ? error.name : "non-error-throwable"
		recoveryDiagnostic(stage, `threw-${errorType}`)
		return null
	}
}
