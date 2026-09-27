/**
 * Strict byte encodings.
 *
 * Base64 here is STANDARD RFC 4648 §4 — `A–Za–z0–9+/`, mandatory `=` padding,
 * canonical (unused trailing bits must be zero) — and nothing else. No
 * Base64URL, no whitespace, no missing padding. This is intentionally stricter
 * than `atob` / `Buffer`, which both accept malformed input, because the
 * protocol requires malformed Base64 to fail BEFORE any key derivation or
 * decryption (E2EE-KEY-BACKUP-WEB-IMPLEMENTATION-1.md §2.1).
 *
 * UTF-8 is strict in both directions: no lone surrogates going in, no invalid
 * sequences (and no silent U+FFFD replacement) coming out.
 */

import { E2eeCryptoError } from "./errors"

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
const PAD_CHAR_CODE = 0x3d // "="

/** ASCII char code → 6-bit value, or -1. Anything ≥ 128 is invalid. */
const BASE64_LOOKUP = new Int8Array(128).fill(-1)
for (let i = 0; i < BASE64_ALPHABET.length; i++) {
	BASE64_LOOKUP[BASE64_ALPHABET.charCodeAt(i)] = i
}

function sextet(charCode: number): number {
	return charCode < 128 ? BASE64_LOOKUP[charCode] : -1
}

function invalidBase64(): E2eeCryptoError {
	return new E2eeCryptoError("invalid_base64", "Value is not strict standard padded Base64")
}

export function bytesToBase64(bytes: Uint8Array): string {
	let out = ""
	const len = bytes.length
	let i = 0

	for (; i + 2 < len; i += 3) {
		const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
		out +=
			BASE64_ALPHABET[(n >> 18) & 63] +
			BASE64_ALPHABET[(n >> 12) & 63] +
			BASE64_ALPHABET[(n >> 6) & 63] +
			BASE64_ALPHABET[n & 63]
	}

	const remaining = len - i
	if (remaining === 1) {
		const n = bytes[i] << 16
		out += BASE64_ALPHABET[(n >> 18) & 63] + BASE64_ALPHABET[(n >> 12) & 63] + "=="
	} else if (remaining === 2) {
		const n = (bytes[i] << 16) | (bytes[i + 1] << 8)
		out +=
			BASE64_ALPHABET[(n >> 18) & 63] +
			BASE64_ALPHABET[(n >> 12) & 63] +
			BASE64_ALPHABET[(n >> 6) & 63] +
			"="
	}

	return out
}

/**
 * Decodes strict standard padded Base64. Throws `invalid_base64` for anything
 * else — including non-canonical encodings such as `"Zh=="` (non-zero unused
 * bits), which a lenient decoder would silently map to the same bytes as
 * `"Zg=="`.
 */
export function base64ToBytes(value: string): Uint8Array {
	if (typeof value !== "string" || value.length % 4 !== 0) throw invalidBase64()

	const len = value.length
	if (len === 0) return new Uint8Array(0)

	let padding = 0
	if (value.charCodeAt(len - 1) === PAD_CHAR_CODE) {
		padding = value.charCodeAt(len - 2) === PAD_CHAR_CODE ? 2 : 1
	}

	// Every character before the padding must be in the alphabet; a "=" (or
	// anything else) anywhere earlier fails the lookup.
	const dataLen = len - padding
	const out = new Uint8Array((len / 4) * 3 - padding)
	let o = 0

	for (let i = 0; i < dataLen; i += 4) {
		const inGroup = dataLen - i >= 4 ? 4 : dataLen - i // 4, or 3 / 2 for the padded last group

		const a = sextet(value.charCodeAt(i))
		const b = sextet(value.charCodeAt(i + 1))
		const c = inGroup > 2 ? sextet(value.charCodeAt(i + 2)) : 0
		const d = inGroup > 3 ? sextet(value.charCodeAt(i + 3)) : 0
		if (a < 0 || b < 0 || c < 0 || d < 0) throw invalidBase64()

		// Canonical form: bits that do not contribute to an output byte must be 0.
		if (inGroup === 2 && (b & 0x0f) !== 0) throw invalidBase64()
		if (inGroup === 3 && (c & 0x03) !== 0) throw invalidBase64()

		const n = (a << 18) | (b << 12) | (c << 6) | d
		out[o++] = (n >> 16) & 0xff
		if (inGroup > 2) out[o++] = (n >> 8) & 0xff
		if (inGroup > 3) out[o++] = n & 0xff
	}

	return out
}

/**
 * Strict Base64 decode that also requires an exact DECODED byte length. The
 * protocol's length rules apply to raw bytes, not to the Base64 string
 * (32 bytes ⇒ 44 chars, 48 ⇒ 64, 24 ⇒ 32, 16 ⇒ 24).
 */
export function base64ToBytesOfLength(value: string, expectedLength: number): Uint8Array {
	const bytes = base64ToBytes(value)
	if (bytes.length !== expectedLength) {
		throw new E2eeCryptoError("invalid_length", `Decoded value must be ${expectedLength} bytes`)
	}
	return bytes
}

/** Lone surrogates would be silently rewritten to U+FFFD by TextEncoder. */
function assertWellFormedUtf16(text: string): void {
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i)
		if (code >= 0xd800 && code <= 0xdbff) {
			const next = text.charCodeAt(i + 1) // NaN at end of string → falls through to throw
			if (next >= 0xdc00 && next <= 0xdfff) {
				i++
				continue
			}
			throw new E2eeCryptoError("invalid_utf8", "String contains a lone surrogate")
		}
		if (code >= 0xdc00 && code <= 0xdfff) {
			throw new E2eeCryptoError("invalid_utf8", "String contains a lone surrogate")
		}
	}
}

export function utf8ToBytes(text: string): Uint8Array {
	if (typeof text !== "string") {
		throw new E2eeCryptoError("invalid_argument", "Expected a string")
	}
	assertWellFormedUtf16(text)
	return new TextEncoder().encode(text)
}

/**
 * Throws `invalid_utf8` instead of substituting U+FFFD. A leading BOM is
 * preserved (`ignoreBOM: true` means "do not strip it") so decode(encode(x))
 * is always x.
 */
export function bytesToUtf8(bytes: Uint8Array): string {
	try {
		return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)
	} catch {
		throw new E2eeCryptoError("invalid_utf8", "Bytes are not valid UTF-8")
	}
}

/** Lowercase, zero-padded hexadecimal. */
export function bytesToHex(bytes: Uint8Array): string {
	let out = ""
	for (let i = 0; i < bytes.length; i++) {
		out += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16)
	}
	return out
}
