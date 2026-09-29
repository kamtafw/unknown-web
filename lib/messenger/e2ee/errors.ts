/**
 * Error surface for the crypto primitives.
 *
 * Two deliberately different failure channels:
 *
 *  - Authentication / decryption failure (wrong key, tampered data) is NOT an
 *    exception: `boxOpen` / `secretboxOpen` return `null`, matching NaCl.
 *  - Everything else — malformed input, wrong lengths, missing platform
 *    support — throws `E2eeCryptoError`.
 *
 * Callers (the later E2EE boundary) map both channels onto one generic
 * fail-closed state; nothing here is meant to be shown to the user.
 *
 * Messages are fixed strings built from protocol constants ONLY. They must
 * never interpolate caller-supplied data (keys, plaintext, ciphertext, PIN):
 * errors end up in logs and error reporters.
 */

export type E2eeCryptoErrorCode =
	/** `crypto.getRandomValues` / `crypto.subtle` missing (e.g. insecure context). */
	| "crypto_unavailable"
	/** The platform crypto call itself rejected. */
	| "crypto_failure"
	/** Wrong type or otherwise unusable argument. */
	| "invalid_argument"
	/** Key, nonce, salt or ciphertext has the wrong number of raw bytes. */
	| "invalid_length"
	/** Not strict, canonical, standard-alphabet, padded RFC 4648 Base64. */
	| "invalid_base64"
	/** Bytes are not valid UTF-8, or a string contains lone surrogates. */
	| "invalid_utf8"
	/** PBKDF2 iteration count is not a positive 32-bit integer. */
	| "invalid_iterations"
	/** Degenerate public key (low-order point): shared secret would be all zero. */
	| "invalid_key"

export class E2eeCryptoError extends Error {
	readonly code: E2eeCryptoErrorCode

	constructor(code: E2eeCryptoErrorCode, message: string) {
		super(message)
		this.name = "E2eeCryptoError"
		this.code = code
	}
}
