// @vitest-environment node
import { asPkid } from "@/types/messenger"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { recoverIdentityFromBackup } from "./backup-recovery"
import { BACKUP_VECTOR, hexToBytes } from "./e2ee-test-vectors"
import { base64ToBytesOfLength, utf8ToBytes } from "./encoding"
import { getIdentity, removeIdentity } from "./identity-store"
import { boxPublicKeyFromSecretKey, secretboxSeal } from "./nacl"
import { e2eeRuntime } from "./runtime"
import { setupFreshE2eeDatabase } from "./storage/test-support"
import { pbkdf2HmacSha256 } from "./webcrypto"
import * as webcryptoModule from "./webcrypto"

setupFreshE2eeDatabase()

const accountId = asPkid(777)
const otherAccountId = asPkid(888)
const validPin = "123456"

function deferred<T>() {
	let resolve!: (value: T) => void
	const promise = new Promise<T>((res) => {
		resolve = res
	})
	return { promise, resolve }
}
const validBackup = {
	identityPublicKey: base64ToBytesOfLength(BACKUP_VECTOR.identityPublicKeyBase64, 32),
	ciphertext: base64ToBytesOfLength(BACKUP_VECTOR.ciphertextBase64, 48),
	nonce: base64ToBytesOfLength(BACKUP_VECTOR.nonceBase64, 24),
	kdf: {
		salt: base64ToBytesOfLength(BACKUP_VECTOR.saltBase64, 16),
		iterations: BACKUP_VECTOR.iterations,
	},
}

beforeEach(async () => {
	// Ensure each test begins with an empty identity store for both accounts.
	// Runtime activation alone can rehydrate persisted data left by a prior test.
	await removeIdentity(accountId)
	await removeIdentity(otherAccountId)
	await e2eeRuntime.activate(accountId)
})

afterEach(() => {
	vi.restoreAllMocks()
	e2eeRuntime.clear()
})

describe("recoverIdentityFromBackup", () => {
	it("refuses to recover when the runtime has been cleared by logout", async () => {
		e2eeRuntime.clear()
		await expect(recoverIdentityFromBackup(accountId, validBackup, validPin)).resolves.toBeNull()
		expect(await getIdentity(accountId)).toBeNull()
	})

	it("discards recovery if the active account changes during key derivation", async () => {
		const derivedKey = deferred<Uint8Array>()
		let markStarted!: () => void
		const started = new Promise<void>((resolve) => {
			markStarted = resolve
		})
		vi.spyOn(webcryptoModule, "pbkdf2HmacSha256").mockImplementationOnce(async () => {
			markStarted()
			return derivedKey.promise
		})

		const recovery = recoverIdentityFromBackup(accountId, validBackup, validPin)
		await started
		await e2eeRuntime.activate(otherAccountId)
		derivedKey.resolve(new Uint8Array(32).fill(7))

		await expect(recovery).resolves.toBeNull()
		expect(await getIdentity(accountId)).toBeNull()
		expect(e2eeRuntime.getState()?.accountId).toBe(otherAccountId)
		expect(e2eeRuntime.getState()?.identity).toBeNull()
	})
	it("restores the identity for a valid PIN and valid backup", async () => {
		const recovered = await recoverIdentityFromBackup(accountId, validBackup, validPin)
		expect(recovered).not.toBeNull()
		expect(Array.from(recovered!.privateKey)).toEqual(
			Array.from(hexToBytes(BACKUP_VECTOR.identitySecretKeyHex)),
		)
		expect(Array.from(recovered!.publicKey)).toEqual(
			Array.from(boxPublicKeyFromSecretKey(recovered!.privateKey)),
		)
	})

	it("allows only one of two concurrent recoveries to install an identity", async () => {
		const originalDerive = webcryptoModule.pbkdf2HmacSha256
		const bothDerivationsStarted = deferred<void>()
		const releaseDerivations = deferred<void>()
		let derivationCount = 0

		vi.spyOn(webcryptoModule, "pbkdf2HmacSha256").mockImplementation(async (options) => {
			derivationCount += 1
			if (derivationCount === 2) bothDerivationsStarted.resolve()
			await releaseDerivations.promise
			return originalDerive(options)
		})

		const firstAttempt = recoverIdentityFromBackup(accountId, validBackup, validPin)
		const secondAttempt = recoverIdentityFromBackup(accountId, validBackup, validPin)
		await bothDerivationsStarted.promise
		releaseDerivations.resolve()

		const results = await Promise.all([firstAttempt, secondAttempt])
		expect(results.filter((identity) => identity !== null)).toHaveLength(1)

		const persisted = await getIdentity(accountId)
		expect(persisted).not.toBeNull()
		expect(Array.from(persisted!.privateKey)).toEqual(
			Array.from(hexToBytes(BACKUP_VECTOR.identitySecretKeyHex)),
		)
		expect(e2eeRuntime.getState()?.identity).not.toBeNull()
	})

	it("rejects invalid PIN format", async () => {
		await expect(recoverIdentityFromBackup(accountId, validBackup, "12345")).resolves.toBeNull()
	})

	it("rejects a wrong PIN", async () => {
		await expect(recoverIdentityFromBackup(accountId, validBackup, "654321")).resolves.toBeNull()
	})

	it("rejects corrupted ciphertext", async () => {
		await expect(
			recoverIdentityFromBackup(
				accountId,
				{ ...validBackup, ciphertext: new Uint8Array(48).fill(0xff) },
				validPin,
			),
		).resolves.toBeNull()
	})

	it("rejects an invalid decrypted key length", async () => {
		const wrappingKey = await pbkdf2HmacSha256({
			password: utf8ToBytes(validPin),
			salt: validBackup.kdf.salt,
			iterations: validBackup.kdf.iterations,
		})
		const shortCiphertext = secretboxSeal({
			plaintext: new Uint8Array(31).fill(0x11),
			nonce: validBackup.nonce,
			key: wrappingKey,
		})

		await expect(
			recoverIdentityFromBackup(
				accountId,
				{ ...validBackup, ciphertext: shortCiphertext },
				validPin,
			),
		).resolves.toBeNull()
	})

	it("rejects a derived public key mismatch", async () => {
		await expect(
			recoverIdentityFromBackup(
				accountId,
				{
					...validBackup,
					identityPublicKey: new Uint8Array(32).fill(0x09),
				},
				validPin,
			),
		).resolves.toBeNull()
	})

	it("does not overwrite an existing identity after a failed recovery", async () => {
		const existing = {
			privateKey: new Uint8Array(32).fill(0x0a),
			publicKey: new Uint8Array(32).fill(0x0b),
			updatedAt: 1,
		}
		await e2eeRuntime.installIdentity(accountId, existing)
		await recoverIdentityFromBackup(
			accountId,
			{ ...validBackup, identityPublicKey: new Uint8Array(32).fill(0x09) },
			validPin,
		)
		const stored = await getIdentity(accountId)
		expect(Array.from(stored!.privateKey)).toEqual(Array.from(existing.privateKey))
		expect(Array.from(stored!.publicKey)).toEqual(Array.from(existing.publicKey))
	})

	it("persists the recovered identity through the E0.2 runtime storage abstraction", async () => {
		await e2eeRuntime.activate(accountId)
		const recovered = await recoverIdentityFromBackup(accountId, validBackup, validPin)
		expect(recovered).not.toBeNull()
		expect(e2eeRuntime.getState()).not.toBeNull()
		expect(Array.from(e2eeRuntime.getState()!.identity!.privateKey)).toEqual(
			Array.from(recovered!.privateKey),
		)
		const persisted = await getIdentity(accountId)
		expect(Array.from(persisted!.privateKey)).toEqual(Array.from(recovered!.privateKey))
	})

})
