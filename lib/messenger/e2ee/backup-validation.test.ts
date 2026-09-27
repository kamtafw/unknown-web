import { describe, expect, it } from "vitest"
import { classifyBackup } from "./index"
import { BACKUP_VECTOR } from "./e2ee-test-vectors"

const validBackup = {
	format_version: 1,
	recovery_method: "six_digit_pin",
	encryption_algorithm: "nacl_secretbox_xsalsa20poly1305",
	identity_public_key: BACKUP_VECTOR.identityPublicKeyBase64,
	ciphertext: BACKUP_VECTOR.ciphertextBase64,
	nonce: BACKUP_VECTOR.nonceBase64,
	kdf: {
		algorithm: "pbkdf2",
		prf: "hmac_sha256",
		salt: BACKUP_VECTOR.saltBase64,
		iterations: 600_000,
		output_length: 32,
	},
	updated_at: "2026-09-27T00:00:00Z",
} as const

describe("key backup validation", () => {
	it("accepts a valid v1 backup", () => {
		const result = classifyBackup(validBackup)
		expect(result.status).toBe("valid")
		if (result.status !== "valid") throw new Error("expected valid backup")
		expect(result.backup.identityPublicKey).toHaveLength(32)
		expect(result.backup.ciphertext).toHaveLength(48)
		expect(result.backup.nonce).toHaveLength(24)
		expect(result.backup.kdf.salt).toHaveLength(16)
		expect(result.backup.kdf.iterations).toBe(600_000)
	})

	it("rejects unsupported backup variants", () => {
		const result = classifyBackup({
			...validBackup,
			format_version: 2,
		})
		expect(result.status).toBe("unsupported")
	})

	it("rejects malformed base64 and wrong lengths", () => {
		const result = classifyBackup({
			...validBackup,
			identity_public_key: "AQID",
		})
		expect(result.status).toBe("malformed")
	})

	it("rejects malformed kdf settings", () => {
		const result = classifyBackup({
			...validBackup,
			kdf: {
				...validBackup.kdf,
				iterations: 100,
			},
		})
		expect(result.status).toBe("malformed")
	})

	it("rejects unexpected fields", () => {
		const result = classifyBackup({
			...validBackup,
			legacy_field: "not allowed",
		})
		expect(result.status).toBe("malformed")
	})
})
