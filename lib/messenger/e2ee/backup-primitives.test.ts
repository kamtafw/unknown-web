// @vitest-environment node
/**
 * Composition check ONLY: proves the E0.1 primitives, used together, reproduce
 * the backup protocol's cryptography and sizes against an independent fixture.
 *
 * This is NOT the recovery flow. There is no backup validation, PIN handling,
 * account check or identity installation here — those are E1 / E2.
 */
import { describe, expect, it } from "vitest"
import {
	BACKUP_CIPHERTEXT_LENGTH,
	BACKUP_KDF_SALT_LENGTH,
	SECRETBOX_NONCE_LENGTH,
} from "./constants"
import { base64ToBytesOfLength, bytesToHex, utf8ToBytes } from "./encoding"
import { BACKUP_VECTOR, hexToBytes } from "./e2ee-test-vectors"
import { boxPublicKeyFromSecretKey, constantTimeEqual, secretboxOpen } from "./nacl"
import { pbkdf2HmacSha256 } from "./webcrypto"

const salt = base64ToBytesOfLength(BACKUP_VECTOR.saltBase64, BACKUP_KDF_SALT_LENGTH)
const nonce = base64ToBytesOfLength(BACKUP_VECTOR.nonceBase64, SECRETBOX_NONCE_LENGTH)
const ciphertext = base64ToBytesOfLength(BACKUP_VECTOR.ciphertextBase64, BACKUP_CIPHERTEXT_LENGTH)
const registeredPublicKey = base64ToBytesOfLength(BACKUP_VECTOR.identityPublicKeyBase64, 32)

async function unwrap(pin: string) {
	const wrappingKey = await pbkdf2HmacSha256({
		password: utf8ToBytes(pin),
		salt,
		iterations: BACKUP_VECTOR.iterations,
	})
	return secretboxOpen({ ciphertext, nonce, key: wrappingKey })
}

describe("backup-shaped fixture (independent libsodium/OpenSSL vector)", () => {
	it("decodes to the protocol's raw byte lengths (16 / 24 / 48 / 32)", () => {
		expect(salt).toHaveLength(16)
		expect(nonce).toHaveLength(24)
		expect(ciphertext).toHaveLength(48)
		expect(registeredPublicKey).toHaveLength(32)
	})

	it("the correct PIN unwraps the identity secret key, whose public key matches", async () => {
		const secretKey = await unwrap(BACKUP_VECTOR.pin)

		expect(secretKey).not.toBeNull()
		expect(bytesToHex(secretKey as Uint8Array)).toBe(BACKUP_VECTOR.identitySecretKeyHex)
		expect(secretKey).toHaveLength(32)

		const derivedPublicKey = boxPublicKeyFromSecretKey(secretKey as Uint8Array)
		expect(constantTimeEqual(derivedPublicKey, registeredPublicKey)).toBe(true)
	})

	it("a wrong PIN fails authentication (null), it does not produce a wrong key", async () => {
		expect(await unwrap("123457")).toBeNull()
	})

	it("a public key derived from a DIFFERENT secret key does not match the registered one", () => {
		const other = boxPublicKeyFromSecretKey(hexToBytes("11".repeat(32)))
		expect(constantTimeEqual(other, registeredPublicKey)).toBe(false)
	})
})
