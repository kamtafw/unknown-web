// @vitest-environment node
import { createHash, pbkdf2Sync } from "node:crypto"
import { afterEach, describe, expect, it, vi } from "vitest"
import { KDF_OUTPUT_LENGTH, SHA256_DIGEST_LENGTH } from "./constants"
import { base64ToBytes, bytesToHex, utf8ToBytes } from "./encoding"
import { E2eeCryptoError } from "./errors"
import {
	BACKUP_VECTOR,
	PBKDF2_VECTORS,
	SHA256_MILLION_A,
	SHA256_VECTORS,
	hexToBytes,
} from "./e2ee-test-vectors"
import { pbkdf2HmacSha256, sha256, sha256Hex } from "./webcrypto"

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

async function codeOfAsync(promise: Promise<unknown>): Promise<string | undefined> {
	try {
		await promise
	} catch (err) {
		return err instanceof E2eeCryptoError ? err.code : `non-e2ee:${String(err)}`
	}
	return undefined
}

describe("pbkdf2HmacSha256", () => {
	describe("known vectors (OpenSSL via Python hashlib; RFC 7914 values)", () => {
		it.each(PBKDF2_VECTORS)(
			"password=$password salt=$salt iterations=$iterations",
			async ({ password, salt, iterations, output }) => {
				const derived = await pbkdf2HmacSha256({
					password: utf8ToBytes(password),
					salt: utf8ToBytes(salt),
					iterations,
				})
				expect(bytesToHex(derived)).toBe(output)
			},
		)
	})

	it("matches the protocol-minimum 600 000-iteration vector for a six-digit PIN", async () => {
		const derived = await pbkdf2HmacSha256({
			password: utf8ToBytes(BACKUP_VECTOR.pin),
			salt: base64ToBytes(BACKUP_VECTOR.saltBase64),
			iterations: BACKUP_VECTOR.iterations,
		})
		expect(bytesToHex(derived)).toBe(BACKUP_VECTOR.wrappingKeyHex)
	})

	it("agrees with Node's pbkdf2Sync for a 16-byte salt (independent oracle)", async () => {
		const password = utf8ToBytes("048291")
		const salt = hexToBytes("00112233445566778899aabbccddeeff")
		const expected = pbkdf2Sync(Buffer.from(password), Buffer.from(salt), 5_000, 32, "sha256")
		const derived = await pbkdf2HmacSha256({ password, salt, iterations: 5_000 })
		expect(bytesToHex(derived)).toBe(expected.toString("hex"))
	})

	it("always returns 32 bytes", async () => {
		const derived = await pbkdf2HmacSha256({
			password: utf8ToBytes("123456"),
			salt: new Uint8Array(16).fill(1),
			iterations: 10,
		})
		expect(derived).toHaveLength(KDF_OUTPUT_LENGTH)
	})

	it("is deterministic, and sensitive to password, salt and iterations", async () => {
		const base = {
			password: utf8ToBytes("123456"),
			salt: new Uint8Array(16).fill(1),
			iterations: 100,
		}
		const a = bytesToHex(await pbkdf2HmacSha256(base))
		expect(bytesToHex(await pbkdf2HmacSha256(base))).toBe(a)
		expect(
			bytesToHex(await pbkdf2HmacSha256({ ...base, password: utf8ToBytes("123457") })),
		).not.toBe(a)
		expect(
			bytesToHex(await pbkdf2HmacSha256({ ...base, salt: new Uint8Array(16).fill(2) })),
		).not.toBe(a)
		expect(bytesToHex(await pbkdf2HmacSha256({ ...base, iterations: 101 }))).not.toBe(a)
	})

	it("does not mutate its inputs", async () => {
		const password = utf8ToBytes("123456")
		const salt = new Uint8Array(16).fill(9)
		const passwordBefore = Array.from(password)
		const saltBefore = Array.from(salt)
		await pbkdf2HmacSha256({ password, salt, iterations: 10 })
		expect(Array.from(password)).toEqual(passwordBefore)
		expect(Array.from(salt)).toEqual(saltBefore)
	})

	it("honours views into larger buffers (only the view's bytes are used)", async () => {
		const backing = new Uint8Array([9, 9, ...utf8ToBytes("123456"), 9, 9])
		const salt = new Uint8Array(16).fill(1)
		const fromView = await pbkdf2HmacSha256({
			password: backing.subarray(2, 8),
			salt,
			iterations: 10,
		})
		const fromCopy = await pbkdf2HmacSha256({
			password: utf8ToBytes("123456"),
			salt,
			iterations: 10,
		})
		expect(bytesToHex(fromView)).toBe(bytesToHex(fromCopy))
	})

	describe("input validation", () => {
		const password = utf8ToBytes("123456")
		const salt = new Uint8Array(16).fill(1)

		it.each([
			0,
			-1,
			1.5,
			Number.NaN,
			Number.POSITIVE_INFINITY,
			2 ** 32,
			"600000" as unknown as number,
		])("rejects iterations=%j", async (iterations) => {
			expect(await codeOfAsync(pbkdf2HmacSha256({ password, salt, iterations }))).toBe(
				"invalid_iterations",
			)
		})

		it("accepts the smallest valid iteration count", async () => {
			await expect(pbkdf2HmacSha256({ password, salt, iterations: 1 })).resolves.toHaveLength(32)
		})

		it("rejects an empty password", async () => {
			expect(
				await codeOfAsync(pbkdf2HmacSha256({ password: new Uint8Array(0), salt, iterations: 1 })),
			).toBe("invalid_argument")
		})

		it("rejects an empty salt", async () => {
			expect(
				await codeOfAsync(pbkdf2HmacSha256({ password, salt: new Uint8Array(0), iterations: 1 })),
			).toBe("invalid_argument")
		})

		it("does not enforce the protocol's 600k–2M range (that is E1's job)", async () => {
			await expect(pbkdf2HmacSha256({ password, salt, iterations: 599_999 })).resolves.toBeDefined()
		})
	})

	describe("platform failures", () => {
		it("reports crypto_unavailable when crypto.subtle is missing", async () => {
			vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) })
			expect(
				await codeOfAsync(
					pbkdf2HmacSha256({
						password: utf8ToBytes("123456"),
						salt: new Uint8Array(16).fill(1),
						iterations: 1,
					}),
				),
			).toBe("crypto_unavailable")
		})

		it("wraps a rejecting platform call without leaking its message", async () => {
			vi.spyOn(crypto.subtle, "importKey").mockRejectedValueOnce(
				new Error("platform detail 123456"),
			)
			try {
				await pbkdf2HmacSha256({
					password: utf8ToBytes("123456"),
					salt: new Uint8Array(16).fill(1),
					iterations: 1,
				})
				throw new Error("expected rejection")
			} catch (err) {
				expect(err).toBeInstanceOf(E2eeCryptoError)
				expect((err as E2eeCryptoError).code).toBe("crypto_failure")
				expect((err as Error).message).not.toContain("123456")
			}
		})
	})
})

describe("sha256 / sha256Hex", () => {
	it.each(SHA256_VECTORS)("known vector for %j", async ({ input, output }) => {
		expect(await sha256Hex(utf8ToBytes(input))).toBe(output)
	})

	it("matches the NIST one-million-'a' vector", async () => {
		expect(await sha256Hex(new Uint8Array(1_000_000).fill(0x61))).toBe(SHA256_MILLION_A)
	})

	it("returns 32 raw bytes from sha256 and 64 lowercase hex chars from sha256Hex", async () => {
		const data = utf8ToBytes("abc")
		expect(await sha256(data)).toHaveLength(SHA256_DIGEST_LENGTH)
		const hex = await sha256Hex(data)
		expect(hex).toMatch(/^[0-9a-f]{64}$/)
	})

	it("agrees with Node's createHash on multi-byte input (independent oracle)", async () => {
		const text = "héllo 👋 日本語"
		expect(await sha256Hex(utf8ToBytes(text))).toBe(
			createHash("sha256").update(text, "utf8").digest("hex"),
		)
	})

	it("hashes only the bytes of a view, not its backing buffer", async () => {
		const backing = new Uint8Array([1, 2, ...utf8ToBytes("abc"), 3, 4])
		expect(await sha256Hex(backing.subarray(2, 5))).toBe(SHA256_VECTORS[1].output)
	})

	it("reports crypto_unavailable when crypto.subtle is missing", async () => {
		vi.stubGlobal("crypto", {})
		expect(await codeOfAsync(sha256(utf8ToBytes("abc")))).toBe("crypto_unavailable")
	})
})
