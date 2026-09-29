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
 *   6. Only then persist the verified identity through `e2eeRuntime`.
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

/** Returns `null` on any generic recovery failure. Never exposes the failure
 * details for the user or logs the secret material used during the attempt. */
export async function recoverIdentityFromBackup(
	accountId: Pkid,
	backup: ValidatedBackupV1,
	pin: string,
): Promise<StoredIdentity | null> {
	if (!VALID_PIN_PATTERN.test(pin)) return null

	const existing = await getIdentity(accountId)
	if (existing !== null) return null

	const activeAccountId = e2eeRuntime.getActiveAccountId()
	if (activeAccountId !== null && activeAccountId !== accountId) return null

	try {
		const wrappingKey = await pbkdf2HmacSha256({
			password: utf8ToBytes(pin),
			salt: backup.kdf.salt,
			iterations: backup.kdf.iterations,
		})

		const privateKey = secretboxOpen({
			ciphertext: backup.ciphertext,
			nonce: backup.nonce,
			key: wrappingKey,
		})
		if (privateKey === null || privateKey.length !== BOX_SECRET_KEY_LENGTH) return null

		const publicKey = boxPublicKeyFromSecretKey(privateKey)
		if (!constantTimeEqual(publicKey, backup.identityPublicKey)) return null

		const currentActiveAccountId = e2eeRuntime.getActiveAccountId()
		if (currentActiveAccountId !== null && currentActiveAccountId !== accountId) return null
		if (e2eeRuntime.getState()?.identity) return null

		const identity: StoredIdentity = {
			privateKey,
			publicKey,
			updatedAt: Date.now(),
		}

		await e2eeRuntime.installIdentity(accountId, identity)
		return identity
	} catch {
		return null
	}
}
