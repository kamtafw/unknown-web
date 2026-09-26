/**
 * The ONLY module in the app allowed to import `tweetnacl` (enforced by an
 * ESLint `no-restricted-imports` rule). Everything else in Messenger uses
 * these wrappers, so the library can be swapped or audited in one place.
 *
 * What this file deliberately does NOT offer:
 *  - key-pair GENERATION. Web never creates an account identity (mobile owns
 *    it); the only key operation is deriving a public key from an existing
 *    secret key.
 *  - UTF-8 handling. These operate on bytes; text ⇄ bytes is `encoding.ts`.
 *
 * Failure semantics (see errors.ts): malformed inputs throw `E2eeCryptoError`;
 * an authentication failure from an `open` returns `null`.
 */

import nacl from "tweetnacl"
import {
	BOX_NONCE_LENGTH,
	BOX_OVERHEAD_LENGTH,
	BOX_PUBLIC_KEY_LENGTH,
	BOX_SECRET_KEY_LENGTH,
	SECRETBOX_KEY_LENGTH,
	SECRETBOX_NONCE_LENGTH,
	SECRETBOX_OVERHEAD_LENGTH,
} from "./constants"
import { E2eeCryptoError } from "./errors"

function assertLength(bytes: Uint8Array, expected: number, what: string): void {
	if (bytes.length !== expected) {
		throw new E2eeCryptoError("invalid_length", `${what} must be ${expected} bytes`)
	}
}

/**
 * Rejects low-order public keys. For those, X25519 yields an all-zero shared
 * secret, so the "encryption key" would be the same constant for everyone.
 * libsodium refuses this case; tweetnacl does not. Legitimate keys are never
 * affected, so this cannot break interop.
 */
function assertNonDegenerateSharedSecret(peerPublicKey: Uint8Array, ownSecretKey: Uint8Array) {
	const shared = nacl.scalarMult(ownSecretKey, peerPublicKey)
	let acc = 0
	for (let i = 0; i < shared.length; i++) acc |= shared[i]
	if (acc === 0) {
		throw new E2eeCryptoError("invalid_key", "Public key is a low-order point")
	}
}

// --- box (Curve25519-XSalsa20-Poly1305) -------------------------------------

/**
 * Argument naming is direction-neutral on purpose. The shared key is the same
 * whichever side derives it:
 *
 *  - encrypting a DM:  peerPublicKey = recipient,  ownSecretKey = sender
 *  - opening a DM:     peerPublicKey = sender,     ownSecretKey = recipient
 *  - (a sender opening its own message: peerPublicKey = recipient,
 *     ownSecretKey = sender — see the symmetry test in nacl.test.ts)
 */
export interface BoxSealParams {
	plaintext: Uint8Array
	nonce: Uint8Array
	peerPublicKey: Uint8Array
	ownSecretKey: Uint8Array
}

export interface BoxOpenParams {
	ciphertext: Uint8Array
	nonce: Uint8Array
	peerPublicKey: Uint8Array
	ownSecretKey: Uint8Array
}

function assertBoxInputs(nonce: Uint8Array, peerPublicKey: Uint8Array, ownSecretKey: Uint8Array) {
	assertLength(nonce, BOX_NONCE_LENGTH, "Nonce")
	assertLength(peerPublicKey, BOX_PUBLIC_KEY_LENGTH, "Public key")
	assertLength(ownSecretKey, BOX_SECRET_KEY_LENGTH, "Secret key")
	assertNonDegenerateSharedSecret(peerPublicKey, ownSecretKey)
}

/** `nacl_box_curve25519xsalsa20poly1305`. Output = plaintext length + 16. */
export function boxSeal({
	plaintext,
	nonce,
	peerPublicKey,
	ownSecretKey,
}: BoxSealParams): Uint8Array {
	assertBoxInputs(nonce, peerPublicKey, ownSecretKey)
	return nacl.box(plaintext, nonce, peerPublicKey, ownSecretKey)
}

/**
 * Returns the plaintext, or `null` if authentication/decryption failed (wrong
 * key or nonce, or modified ciphertext). Throws only for malformed input,
 * including a ciphertext shorter than the 16-byte authenticator.
 */
export function boxOpen({
	ciphertext,
	nonce,
	peerPublicKey,
	ownSecretKey,
}: BoxOpenParams): Uint8Array | null {
	assertBoxInputs(nonce, peerPublicKey, ownSecretKey)
	if (ciphertext.length < BOX_OVERHEAD_LENGTH) {
		throw new E2eeCryptoError("invalid_length", "Ciphertext is shorter than the authenticator")
	}
	return nacl.box.open(ciphertext, nonce, peerPublicKey, ownSecretKey)
}

/**
 * Derives the Curve25519 public key for a secret key.
 *
 * Note: X25519 accepts ANY 32 bytes as a secret key (it clamps), so this never
 * "fails" for a wrong key. That is why recovery must compare the derived
 * public key against the backup's `identity_public_key` before trusting it.
 */
export function boxPublicKeyFromSecretKey(secretKey: Uint8Array): Uint8Array {
	assertLength(secretKey, BOX_SECRET_KEY_LENGTH, "Secret key")
	return nacl.box.keyPair.fromSecretKey(secretKey).publicKey
}

// --- secretbox (XSalsa20-Poly1305) ------------------------------------------

export interface SecretboxSealParams {
	plaintext: Uint8Array
	nonce: Uint8Array
	key: Uint8Array
}

export interface SecretboxOpenParams {
	ciphertext: Uint8Array
	nonce: Uint8Array
	key: Uint8Array
}

function assertSecretboxInputs(nonce: Uint8Array, key: Uint8Array) {
	assertLength(nonce, SECRETBOX_NONCE_LENGTH, "Nonce")
	assertLength(key, SECRETBOX_KEY_LENGTH, "Key")
}

/** `nacl_secretbox_xsalsa20poly1305` (backup wrapping). Output = plaintext + 16. */
export function secretboxSeal({ plaintext, nonce, key }: SecretboxSealParams): Uint8Array {
	assertSecretboxInputs(nonce, key)
	return nacl.secretbox(plaintext, nonce, key)
}

/** Plaintext, or `null` on authentication failure. Throws only for malformed input. */
export function secretboxOpen({ ciphertext, nonce, key }: SecretboxOpenParams): Uint8Array | null {
	assertSecretboxInputs(nonce, key)
	if (ciphertext.length < SECRETBOX_OVERHEAD_LENGTH) {
		throw new E2eeCryptoError("invalid_length", "Ciphertext is shorter than the authenticator")
	}
	return nacl.secretbox.open(ciphertext, nonce, key)
}

// --- comparison ---------------------------------------------------------------

/**
 * Compares two byte arrays without an early exit on the first differing byte.
 * Length is not secret, so a length mismatch returns immediately. (tweetnacl's
 * `verify` returns `false` for two empty arrays, which is the wrong answer for
 * a general comparator, hence the explicit empty case.)
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false
	if (a.length === 0) return true
	return nacl.verify(a, b)
}
