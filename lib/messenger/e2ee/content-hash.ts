/**
 * The v1 `e2ee_content_hash` — a fingerprint of the ENVELOPE, not a MAC.
 *
 * It is NOT a substitute for NaCl authentication: a matching hash proves
 * nothing if `boxOpen` returned `null`. It exists so a locally cached
 * plaintext can be bound to the exact envelope it came from.
 *
 * Input is the three fields exactly as they appear on the wire (standard
 * Base64 STRINGS, not decoded bytes), in this order:
 *
 *   [ciphertext, nonce, senderPublicKey].map((v) => `${v.length}:${v}`).join("|")
 *
 * `v.length` is the JavaScript string length (UTF-16 code units). For valid
 * Base64 that equals the character count; it is only observable for garbage
 * input. The canonical string is UTF-8 encoded, SHA-256 hashed, and rendered as
 * lowercase hexadecimal.
 *
 * No Base64 validation happens here on purpose: the hash must be computed over
 * what was actually transmitted. Envelope validation is a separate step.
 */

import { utf8ToBytes } from "./encoding"
import { E2eeCryptoError } from "./errors"
import { sha256Hex } from "./webcrypto"

export interface ContentHashInput {
	/** Standard-Base64 ciphertext, as transmitted. */
	ciphertext: string
	/** Standard-Base64 24-byte nonce, as transmitted. */
	nonce: string
	/** Standard-Base64 sender identity public key, as transmitted. */
	senderPublicKey: string
}

/** The pre-hash canonical string. Exposed so tests can pin the exact format. */
export function buildContentHashInput({
	ciphertext,
	nonce,
	senderPublicKey,
}: ContentHashInput): string {
	const parts: unknown[] = [ciphertext, nonce, senderPublicKey]
	if (parts.some((part) => typeof part !== "string")) {
		throw new E2eeCryptoError("invalid_argument", "Content hash inputs must be strings")
	}
	return (parts as string[]).map((v) => `${v.length}:${v}`).join("|")
}

export async function computeContentHash(input: ContentHashInput): Promise<string> {
	return sha256Hex(utf8ToBytes(buildContentHashInput(input)))
}
