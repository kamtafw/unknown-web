// @vitest-environment node
import nacl from "tweetnacl"
import { describe, expect, it } from "vitest"
import {
	BOX_NONCE_LENGTH,
	BOX_OVERHEAD_LENGTH,
	BOX_PUBLIC_KEY_LENGTH,
	BOX_SECRET_KEY_LENGTH,
	SECRETBOX_KEY_LENGTH,
	SECRETBOX_NONCE_LENGTH,
	SECRETBOX_OVERHEAD_LENGTH,
} from "./constants"
import { bytesToHex, bytesToUtf8, utf8ToBytes } from "./encoding"
import { E2eeCryptoError } from "./errors"
import {
	BOX_VECTOR,
	LOW_ORDER_PUBLIC_KEYS,
	SECRETBOX_VECTOR,
	hexToBytes,
} from "./e2ee-test-vectors"
import {
	boxOpen,
	boxPublicKeyFromSecretKey,
	boxSeal,
	constantTimeEqual,
	secretboxOpen,
	secretboxSeal,
} from "./nacl"

function codeOf(fn: () => unknown): string | undefined {
	try {
		fn()
	} catch (err) {
		return err instanceof E2eeCryptoError ? err.code : `non-e2ee:${String(err)}`
	}
	return undefined
}

const { aliceSecretKey, alicePublicKey, bobSecretKey, bobPublicKey, nonce } = BOX_VECTOR
const plaintextBytes = utf8ToBytes(BOX_VECTOR.plaintext)

describe("constants match the library", () => {
	it("box and secretbox sizes", () => {
		expect(BOX_PUBLIC_KEY_LENGTH).toBe(nacl.box.publicKeyLength)
		expect(BOX_SECRET_KEY_LENGTH).toBe(nacl.box.secretKeyLength)
		expect(BOX_NONCE_LENGTH).toBe(nacl.box.nonceLength)
		expect(BOX_OVERHEAD_LENGTH).toBe(nacl.box.overheadLength)
		expect(SECRETBOX_KEY_LENGTH).toBe(nacl.secretbox.keyLength)
		expect(SECRETBOX_NONCE_LENGTH).toBe(nacl.secretbox.nonceLength)
		expect(SECRETBOX_OVERHEAD_LENGTH).toBe(nacl.secretbox.overheadLength)
	})
})

describe("boxPublicKeyFromSecretKey", () => {
	it("derives the libsodium public keys", () => {
		expect(bytesToHex(boxPublicKeyFromSecretKey(aliceSecretKey))).toBe(bytesToHex(alicePublicKey))
		expect(bytesToHex(boxPublicKeyFromSecretKey(bobSecretKey))).toBe(bytesToHex(bobPublicKey))
	})

	it("returns 32 bytes and is deterministic", () => {
		const a = boxPublicKeyFromSecretKey(aliceSecretKey)
		expect(a).toHaveLength(32)
		expect(bytesToHex(boxPublicKeyFromSecretKey(aliceSecretKey))).toBe(bytesToHex(a))
	})

	it("derives different public keys from different secret keys", () => {
		expect(bytesToHex(boxPublicKeyFromSecretKey(aliceSecretKey))).not.toBe(
			bytesToHex(boxPublicKeyFromSecretKey(bobSecretKey)),
		)
	})

	it("accepts ANY 32 bytes (X25519 clamps) — so callers must compare against the registered key", () => {
		expect(boxPublicKeyFromSecretKey(new Uint8Array(32))).toHaveLength(32)
		expect(boxPublicKeyFromSecretKey(new Uint8Array(32).fill(0xff))).toHaveLength(32)
	})

	it.each([0, 31, 33, 64])("rejects a %i-byte secret key", (length) => {
		expect(codeOf(() => boxPublicKeyFromSecretKey(new Uint8Array(length)))).toBe("invalid_length")
	})
})

describe("boxSeal / boxOpen", () => {
	it("matches the libsodium ciphertext (alice → bob)", () => {
		const ciphertext = boxSeal({
			plaintext: plaintextBytes,
			nonce,
			peerPublicKey: bobPublicKey,
			ownSecretKey: aliceSecretKey,
		})
		expect(bytesToHex(ciphertext)).toBe(bytesToHex(BOX_VECTOR.ciphertext))
	})

	it("opens the libsodium ciphertext as the recipient (peer = sender, own = recipient)", () => {
		const opened = boxOpen({
			ciphertext: BOX_VECTOR.ciphertext,
			nonce,
			peerPublicKey: alicePublicKey,
			ownSecretKey: bobSecretKey,
		})
		expect(opened).not.toBeNull()
		expect(bytesToUtf8(opened as Uint8Array)).toBe(BOX_VECTOR.plaintext)
	})

	it("is symmetric: the SENDER can open its own ciphertext with (recipient public key, own secret key)", () => {
		// Documents the property behind open item OI-3: NaCl box derives the same
		// shared key from either side. This is a fact about the primitive, not a
		// decision about product behaviour.
		const opened = boxOpen({
			ciphertext: BOX_VECTOR.ciphertext,
			nonce,
			peerPublicKey: bobPublicKey,
			ownSecretKey: aliceSecretKey,
		})
		expect(bytesToUtf8(opened as Uint8Array)).toBe(BOX_VECTOR.plaintext)
	})

	it("ciphertext length is plaintext length + 16", () => {
		expect(BOX_VECTOR.ciphertext).toHaveLength(plaintextBytes.length + BOX_OVERHEAD_LENGTH)
	})

	it("handles an empty plaintext (authenticator only) — libsodium vector", () => {
		const sealed = boxSeal({
			plaintext: new Uint8Array(0),
			nonce,
			peerPublicKey: bobPublicKey,
			ownSecretKey: aliceSecretKey,
		})
		expect(bytesToHex(sealed)).toBe(bytesToHex(BOX_VECTOR.emptyCiphertext))
		const opened = boxOpen({
			ciphertext: sealed,
			nonce,
			peerPublicKey: alicePublicKey,
			ownSecretKey: bobSecretKey,
		})
		expect(opened).toHaveLength(0)
	})

	it("round-trips arbitrary binary, including 0x00 and 0xff", () => {
		const data = Uint8Array.from({ length: 300 }, (_, i) => (i * 7) & 0xff)
		const sealed = boxSeal({
			plaintext: data,
			nonce,
			peerPublicKey: bobPublicKey,
			ownSecretKey: aliceSecretKey,
		})
		const opened = boxOpen({
			ciphertext: sealed,
			nonce,
			peerPublicKey: alicePublicKey,
			ownSecretKey: bobSecretKey,
		})
		expect(Array.from(opened as Uint8Array)).toEqual(Array.from(data))
	})

	it("does not mutate the plaintext or the ciphertext", () => {
		const plain = Uint8Array.from(plaintextBytes)
		const cipher = Uint8Array.from(BOX_VECTOR.ciphertext)
		boxSeal({ plaintext: plain, nonce, peerPublicKey: bobPublicKey, ownSecretKey: aliceSecretKey })
		boxOpen({
			ciphertext: cipher,
			nonce,
			peerPublicKey: alicePublicKey,
			ownSecretKey: bobSecretKey,
		})
		expect(Array.from(plain)).toEqual(Array.from(plaintextBytes))
		expect(Array.from(cipher)).toEqual(Array.from(BOX_VECTOR.ciphertext))
	})

	describe("authentication failures return null (never throw, never garbage)", () => {
		const open = (overrides: Partial<Parameters<typeof boxOpen>[0]> = {}) =>
			boxOpen({
				ciphertext: BOX_VECTOR.ciphertext,
				nonce,
				peerPublicKey: alicePublicKey,
				ownSecretKey: bobSecretKey,
				...overrides,
			})

		it("baseline opens", () => {
			expect(open()).not.toBeNull()
		})

		it("any single flipped bit in the ciphertext (every byte position)", () => {
			for (let i = 0; i < BOX_VECTOR.ciphertext.length; i++) {
				const tampered = Uint8Array.from(BOX_VECTOR.ciphertext)
				tampered[i] ^= 0x01
				expect(open({ ciphertext: tampered }), `byte ${i}`).toBeNull()
			}
		})

		it("a modified nonce", () => {
			const other = Uint8Array.from(nonce)
			other[23] ^= 0x01
			expect(open({ nonce: other })).toBeNull()
		})

		it("a wrong sender public key", () => {
			expect(open({ peerPublicKey: bobPublicKey })).toBeNull()
		})

		it("a wrong recipient secret key", () => {
			expect(open({ ownSecretKey: aliceSecretKey })).toBeNull()
		})

		it("a truncated ciphertext (still ≥ 16 bytes)", () => {
			expect(open({ ciphertext: BOX_VECTOR.ciphertext.subarray(0, 20) })).toBeNull()
		})

		it("an appended byte", () => {
			expect(open({ ciphertext: Uint8Array.from([...BOX_VECTOR.ciphertext, 0]) })).toBeNull()
		})

		it("exactly 16 zero bytes (an authenticator that cannot verify)", () => {
			expect(open({ ciphertext: new Uint8Array(16) })).toBeNull()
		})
	})

	describe("malformed input throws E2eeCryptoError", () => {
		it.each([0, 1, 15])(
			"rejects a %i-byte ciphertext as shorter than the authenticator",
			(length) => {
				expect(
					codeOf(() =>
						boxOpen({
							ciphertext: new Uint8Array(length),
							nonce,
							peerPublicKey: alicePublicKey,
							ownSecretKey: bobSecretKey,
						}),
					),
				).toBe("invalid_length")
			},
		)

		it.each([0, 23, 25, 32])("rejects a %i-byte nonce", (length) => {
			const bad = new Uint8Array(length)
			expect(
				codeOf(() =>
					boxSeal({
						plaintext: plaintextBytes,
						nonce: bad,
						peerPublicKey: bobPublicKey,
						ownSecretKey: aliceSecretKey,
					}),
				),
			).toBe("invalid_length")
			expect(
				codeOf(() =>
					boxOpen({
						ciphertext: BOX_VECTOR.ciphertext,
						nonce: bad,
						peerPublicKey: alicePublicKey,
						ownSecretKey: bobSecretKey,
					}),
				),
			).toBe("invalid_length")
		})

		it.each([0, 31, 33])("rejects a %i-byte public key", (length) => {
			const bad = new Uint8Array(length)
			expect(
				codeOf(() =>
					boxSeal({
						plaintext: plaintextBytes,
						nonce,
						peerPublicKey: bad,
						ownSecretKey: aliceSecretKey,
					}),
				),
			).toBe("invalid_length")
			expect(
				codeOf(() =>
					boxOpen({
						ciphertext: BOX_VECTOR.ciphertext,
						nonce,
						peerPublicKey: bad,
						ownSecretKey: bobSecretKey,
					}),
				),
			).toBe("invalid_length")
		})

		it.each([0, 31, 33])("rejects a %i-byte secret key", (length) => {
			const bad = new Uint8Array(length)
			expect(
				codeOf(() =>
					boxSeal({
						plaintext: plaintextBytes,
						nonce,
						peerPublicKey: bobPublicKey,
						ownSecretKey: bad,
					}),
				),
			).toBe("invalid_length")
			expect(
				codeOf(() =>
					boxOpen({
						ciphertext: BOX_VECTOR.ciphertext,
						nonce,
						peerPublicKey: alicePublicKey,
						ownSecretKey: bad,
					}),
				),
			).toBe("invalid_length")
		})
	})

	describe("low-order public keys are refused (all-zero shared secret)", () => {
		it.each(Object.entries(LOW_ORDER_PUBLIC_KEYS))("%s", (_name, hex) => {
			const degenerate = hexToBytes(hex)
			expect(
				codeOf(() =>
					boxSeal({
						plaintext: plaintextBytes,
						nonce,
						peerPublicKey: degenerate,
						ownSecretKey: aliceSecretKey,
					}),
				),
			).toBe("invalid_key")
			expect(
				codeOf(() =>
					boxOpen({
						ciphertext: BOX_VECTOR.ciphertext,
						nonce,
						peerPublicKey: degenerate,
						ownSecretKey: bobSecretKey,
					}),
				),
			).toBe("invalid_key")
		})

		it("without the check, tweetnacl would happily encrypt under the constant key", () => {
			// Guards the reason the check exists: this is what a raw library call does.
			const sealed = nacl.box(plaintextBytes, nonce, new Uint8Array(32), aliceSecretKey)
			const opened = nacl.box.open(sealed, nonce, new Uint8Array(32), bobSecretKey)
			expect(opened).not.toBeNull()
		})
	})
})

describe("secretboxSeal / secretboxOpen", () => {
	const { key, nonce: sbNonce, plaintext, ciphertext } = SECRETBOX_VECTOR

	it("matches the libsodium ciphertext", () => {
		expect(bytesToHex(secretboxSeal({ plaintext, nonce: sbNonce, key }))).toBe(
			bytesToHex(ciphertext),
		)
	})

	it("opens the libsodium ciphertext", () => {
		const opened = secretboxOpen({ ciphertext, nonce: sbNonce, key })
		expect(bytesToHex(opened as Uint8Array)).toBe(bytesToHex(plaintext))
	})

	it("ciphertext length is plaintext length + 16", () => {
		expect(ciphertext).toHaveLength(plaintext.length + SECRETBOX_OVERHEAD_LENGTH)
	})

	it("a 32-byte secret wraps to exactly 48 bytes (the backup ciphertext size)", () => {
		const sealed = secretboxSeal({ plaintext: new Uint8Array(32).fill(7), nonce: sbNonce, key })
		expect(sealed).toHaveLength(48)
	})

	it("handles an empty plaintext", () => {
		const sealed = secretboxSeal({ plaintext: new Uint8Array(0), nonce: sbNonce, key })
		expect(sealed).toHaveLength(16)
		expect(secretboxOpen({ ciphertext: sealed, nonce: sbNonce, key })).toHaveLength(0)
	})

	describe("authentication failures return null", () => {
		it("any single flipped bit in the ciphertext (every byte position)", () => {
			for (let i = 0; i < ciphertext.length; i++) {
				const tampered = Uint8Array.from(ciphertext)
				tampered[i] ^= 0x80
				expect(secretboxOpen({ ciphertext: tampered, nonce: sbNonce, key }), `byte ${i}`).toBeNull()
			}
		})

		it("a wrong key", () => {
			const wrong = Uint8Array.from(key)
			wrong[0] ^= 0x01
			expect(secretboxOpen({ ciphertext, nonce: sbNonce, key: wrong })).toBeNull()
		})

		it("a wrong nonce", () => {
			const wrong = Uint8Array.from(sbNonce)
			wrong[0] ^= 0x01
			expect(secretboxOpen({ ciphertext, nonce: wrong, key })).toBeNull()
		})

		it("exactly 16 zero bytes", () => {
			expect(secretboxOpen({ ciphertext: new Uint8Array(16), nonce: sbNonce, key })).toBeNull()
		})
	})

	describe("malformed input throws E2eeCryptoError", () => {
		it.each([0, 15])("rejects a %i-byte ciphertext", (length) => {
			expect(
				codeOf(() => secretboxOpen({ ciphertext: new Uint8Array(length), nonce: sbNonce, key })),
			).toBe("invalid_length")
		})

		it.each([0, 23, 25])("rejects a %i-byte nonce", (length) => {
			const bad = new Uint8Array(length)
			expect(codeOf(() => secretboxSeal({ plaintext, nonce: bad, key }))).toBe("invalid_length")
			expect(codeOf(() => secretboxOpen({ ciphertext, nonce: bad, key }))).toBe("invalid_length")
		})

		it.each([0, 31, 33])("rejects a %i-byte key", (length) => {
			const bad = new Uint8Array(length)
			expect(codeOf(() => secretboxSeal({ plaintext, nonce: sbNonce, key: bad }))).toBe(
				"invalid_length",
			)
			expect(codeOf(() => secretboxOpen({ ciphertext, nonce: sbNonce, key: bad }))).toBe(
				"invalid_length",
			)
		})
	})
})

describe("constantTimeEqual", () => {
	const a = hexToBytes("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff")

	it("is true for equal contents (distinct buffers)", () => {
		expect(constantTimeEqual(a, Uint8Array.from(a))).toBe(true)
	})

	it("is true for the same buffer", () => {
		expect(constantTimeEqual(a, a)).toBe(true)
	})

	it("is false when only the first byte differs", () => {
		const b = Uint8Array.from(a)
		b[0] ^= 0x01
		expect(constantTimeEqual(a, b)).toBe(false)
	})

	it("is false when only the last byte differs", () => {
		const b = Uint8Array.from(a)
		b[b.length - 1] ^= 0x80
		expect(constantTimeEqual(a, b)).toBe(false)
	})

	it("is false when a middle bit differs", () => {
		const b = Uint8Array.from(a)
		b[16] ^= 0x10
		expect(constantTimeEqual(a, b)).toBe(false)
	})

	it("is false for different lengths, even when one is a prefix of the other", () => {
		expect(constantTimeEqual(a, a.subarray(0, 31))).toBe(false)
		expect(constantTimeEqual(a.subarray(0, 31), a)).toBe(false)
		expect(constantTimeEqual(a, Uint8Array.from([...a, 0]))).toBe(false)
	})

	it("treats two empty arrays as equal and empty vs non-empty as different", () => {
		expect(constantTimeEqual(new Uint8Array(0), new Uint8Array(0))).toBe(true)
		expect(constantTimeEqual(new Uint8Array(0), Uint8Array.from([0]))).toBe(false)
	})

	it("compares views by content, not by backing buffer", () => {
		const backing = Uint8Array.from([9, ...a, 9])
		expect(constantTimeEqual(backing.subarray(1, 33), a)).toBe(true)
	})

	it("does not mutate its arguments", () => {
		const left = Uint8Array.from(a)
		const right = Uint8Array.from(a)
		constantTimeEqual(left, right)
		expect(Array.from(left)).toEqual(Array.from(a))
		expect(Array.from(right)).toEqual(Array.from(a))
	})
})
