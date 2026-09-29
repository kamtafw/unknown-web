/**
 * Secure random bytes.
 *
 * Uses the platform CSPRNG (`crypto.getRandomValues`) directly rather than
 * tweetnacl's PRNG shim, so randomness has one owner and one failure mode.
 * Never falls back to `Math.random`.
 */

import { BOX_NONCE_LENGTH } from "./constants"
import { E2eeCryptoError } from "./errors"

/** `getRandomValues` throws QuotaExceededError above 65 536 bytes per call. */
const MAX_BYTES_PER_CALL = 65_536

export function randomBytes(length: number): Uint8Array {
	if (!Number.isSafeInteger(length) || length < 0) {
		throw new E2eeCryptoError("invalid_argument", "Length must be a non-negative integer")
	}

	const webCrypto = globalThis.crypto
	if (!webCrypto || typeof webCrypto.getRandomValues !== "function") {
		throw new E2eeCryptoError("crypto_unavailable", "crypto.getRandomValues is unavailable")
	}

	const out = new Uint8Array(length)
	for (let offset = 0; offset < length; offset += MAX_BYTES_PER_CALL) {
		webCrypto.getRandomValues(out.subarray(offset, Math.min(offset + MAX_BYTES_PER_CALL, length)))
	}
	return out
}

/**
 * A fresh 24-byte nonce for ONE encryption. NaCl nonce length is 24 bytes for
 * both `box` and `secretbox`. Generate a new one per encryption; never cache
 * or reuse it for a different plaintext.
 */
export function generateNonce(): Uint8Array {
	return randomBytes(BOX_NONCE_LENGTH)
}
