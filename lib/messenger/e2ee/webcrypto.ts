/**
 * Web Crypto-backed primitives: PBKDF2-HMAC-SHA256 and SHA-256.
 *
 * Both are async, and both need a secure context (HTTPS or localhost) —
 * `crypto.subtle` is undefined otherwise, which surfaces as
 * `crypto_unavailable`.
 */

import { KDF_OUTPUT_LENGTH } from "./constants"
import { bytesToHex } from "./encoding"
import { E2eeCryptoError } from "./errors"

const MAX_UINT32 = 0xffff_ffff

function getSubtle(): SubtleCrypto {
	const subtle = globalThis.crypto?.subtle
	if (!subtle) {
		throw new E2eeCryptoError(
			"crypto_unavailable",
			"crypto.subtle is unavailable (a secure context is required)",
		)
	}
	return subtle
}

export interface Pbkdf2Params {
	/** e.g. the UTF-8 bytes of the six-digit PIN. Must be non-empty. */
	password: Uint8Array
	/** Must be non-empty. The backup protocol uses 16 bytes. */
	salt: Uint8Array
	/** Positive 32-bit integer. Protocol bounds are enforced by the caller (E1). */
	iterations: number
}

/**
 * PBKDF2-HMAC-SHA256 → 32 bytes (the secretbox wrapping key).
 *
 * Empty password/salt are rejected rather than left to platform-specific
 * behaviour. Inputs are copied, so later mutation by the caller cannot affect
 * an in-flight derivation.
 */
export async function pbkdf2HmacSha256({
	password,
	salt,
	iterations,
}: Pbkdf2Params): Promise<Uint8Array> {
	if (!Number.isInteger(iterations) || iterations < 1 || iterations > MAX_UINT32) {
		throw new E2eeCryptoError("invalid_iterations", "Iterations must be a positive 32-bit integer")
	}
	if (password.length === 0 || salt.length === 0) {
		throw new E2eeCryptoError("invalid_argument", "Password and salt must be non-empty")
	}

	const subtle = getSubtle()
	try {
		const material = await subtle.importKey("raw", new Uint8Array(password), "PBKDF2", false, [
			"deriveBits",
		])
		const bits = await subtle.deriveBits(
			{ name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations },
			material,
			KDF_OUTPUT_LENGTH * 8,
		)
		return new Uint8Array(bits)
	} catch {
		throw new E2eeCryptoError("crypto_failure", "PBKDF2 derivation failed")
	}
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
	const subtle = getSubtle()
	try {
		return new Uint8Array(await subtle.digest("SHA-256", new Uint8Array(data)))
	} catch {
		throw new E2eeCryptoError("crypto_failure", "SHA-256 failed")
	}
}

/** Lowercase hexadecimal SHA-256, 64 characters. */
export async function sha256Hex(data: Uint8Array): Promise<string> {
	return bytesToHex(await sha256(data))
}
