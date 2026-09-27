// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { BOX_NONCE_LENGTH, SECRETBOX_NONCE_LENGTH } from "./constants"
import { bytesToHex } from "./encoding"
import { E2eeCryptoError } from "./errors"
import { generateNonce, randomBytes } from "./random"

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("randomBytes", () => {
	it.each([0, 1, 16, 32, 1024])("returns exactly %i bytes", (length) => {
		expect(randomBytes(length)).toHaveLength(length)
	})

	it("returns a Uint8Array", () => {
		expect(randomBytes(8)).toBeInstanceOf(Uint8Array)
	})

	it("is not all zeros", () => {
		// P(32 random bytes all zero) = 2^-256.
		expect(randomBytes(32).some((b) => b !== 0)).toBe(true)
	})

	it("returns different output on each call", () => {
		expect(bytesToHex(randomBytes(32))).not.toBe(bytesToHex(randomBytes(32)))
	})

	it("works above the 65 536-byte getRandomValues limit by chunking", () => {
		const bytes = randomBytes(70_000)
		expect(bytes).toHaveLength(70_000)
		// The tail (past the first chunk) must have been filled too.
		expect(bytes.subarray(65_536).some((b) => b !== 0)).toBe(true)
	})

	it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "8" as unknown as number])(
		"rejects invalid length %j",
		(length) => {
			expect(() => randomBytes(length)).toThrowError(E2eeCryptoError)
		},
	)

	it("fails with crypto_unavailable instead of falling back to Math.random", () => {
		vi.stubGlobal("crypto", undefined)
		const spy = vi.spyOn(Math, "random")
		try {
			randomBytes(8)
			throw new Error("expected randomBytes to throw")
		} catch (err) {
			expect(err).toBeInstanceOf(E2eeCryptoError)
			expect((err as E2eeCryptoError).code).toBe("crypto_unavailable")
		}
		expect(spy).not.toHaveBeenCalled()
		spy.mockRestore()
	})
})

describe("generateNonce", () => {
	it("is 24 bytes", () => {
		expect(generateNonce()).toHaveLength(24)
	})

	it("matches both NaCl nonce lengths", () => {
		expect(generateNonce()).toHaveLength(BOX_NONCE_LENGTH)
		expect(generateNonce()).toHaveLength(SECRETBOX_NONCE_LENGTH)
	})

	it("is fresh every time (no repeats across 2 000 nonces)", () => {
		const seen = new Set<string>()
		for (let i = 0; i < 2_000; i++) seen.add(bytesToHex(generateNonce()))
		expect(seen.size).toBe(2_000)
	})
})
