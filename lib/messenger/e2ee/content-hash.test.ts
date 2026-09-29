// @vitest-environment node
import { createHash } from "node:crypto"
import { describe, expect, it } from "vitest"
import { buildContentHashInput, computeContentHash } from "./content-hash"
import { E2eeCryptoError } from "./errors"
import { CONTENT_HASH_VECTORS } from "./e2ee-test-vectors"

async function codeOfAsync(promise: Promise<unknown>): Promise<string | undefined> {
	try {
		await promise
	} catch (err) {
		return err instanceof E2eeCryptoError ? err.code : `non-e2ee:${String(err)}`
	}
	return undefined
}

const sha256HexOf = (text: string) => createHash("sha256").update(text, "utf8").digest("hex")

describe("buildContentHashInput", () => {
	it("is exactly the specified expression", () => {
		const input = CONTENT_HASH_VECTORS.envelope
		const spec = [input.ciphertext, input.nonce, input.senderPublicKey]
			.map((v) => `${v.length}:${v}`)
			.join("|")
		expect(buildContentHashInput(input)).toBe(spec)
	})

	it("matches the pinned canonical strings", () => {
		expect(buildContentHashInput(CONTENT_HASH_VECTORS.envelope)).toBe(
			CONTENT_HASH_VECTORS.envelopeCanonical,
		)
		expect(buildContentHashInput(CONTENT_HASH_VECTORS.short.input)).toBe(
			CONTENT_HASH_VECTORS.short.canonical,
		)
		expect(buildContentHashInput(CONTENT_HASH_VECTORS.empty.input)).toBe(
			CONTENT_HASH_VECTORS.empty.canonical,
		)
	})

	it("prefixes each value with its string length, joined by '|', in order ciphertext|nonce|sender", () => {
		expect(buildContentHashInput({ ciphertext: "A", nonce: "BB", senderPublicKey: "CCC" })).toBe(
			"1:A|2:BB|3:CCC",
		)
	})

	it("measures JavaScript string length (UTF-16 code units), not characters or bytes", () => {
		// "é" = 1 code unit (2 UTF-8 bytes); "😀" = 2 code units (1 code point, 4 bytes).
		expect(buildContentHashInput({ ciphertext: "é", nonce: "😀", senderPublicKey: "x" })).toBe(
			"1:é|2:😀|1:x",
		)
	})

	it("rejects non-string fields", () => {
		for (const bad of [undefined, null, 1, {}, new Uint8Array(3)]) {
			expect(() =>
				buildContentHashInput({
					ciphertext: bad as unknown as string,
					nonce: "n",
					senderPublicKey: "s",
				}),
			).toThrowError(E2eeCryptoError)
		}
	})
})

describe("computeContentHash", () => {
	it("matches the pinned hash for a realistic envelope (hashlib)", async () => {
		expect(await computeContentHash(CONTENT_HASH_VECTORS.envelope)).toBe(
			CONTENT_HASH_VECTORS.envelopeHash,
		)
	})

	it("matches the pinned hash for a short input (hashlib)", async () => {
		expect(await computeContentHash(CONTENT_HASH_VECTORS.short.input)).toBe(
			CONTENT_HASH_VECTORS.short.hash,
		)
	})

	it("matches the pinned hash for empty fields (hashlib)", async () => {
		expect(await computeContentHash(CONTENT_HASH_VECTORS.empty.input)).toBe(
			CONTENT_HASH_VECTORS.empty.hash,
		)
	})

	it("is the SHA-256 of the canonical string (independent oracle)", async () => {
		const input = { ciphertext: "AAAA", nonce: "BBBB", senderPublicKey: "CCCC" }
		expect(await computeContentHash(input)).toBe(sha256HexOf(buildContentHashInput(input)))
	})

	it("agrees with the oracle for UTF-16-length edge cases", async () => {
		const input = { ciphertext: "é", nonce: "😀", senderPublicKey: "x" }
		expect(await computeContentHash(input)).toBe(sha256HexOf("1:é|2:😀|1:x"))
	})

	it("is 64 lowercase hex characters", async () => {
		expect(await computeContentHash(CONTENT_HASH_VECTORS.envelope)).toMatch(/^[0-9a-f]{64}$/)
	})

	it("changes when any single field changes", async () => {
		const base = CONTENT_HASH_VECTORS.envelope
		const baseHash = await computeContentHash(base)
		expect(
			await computeContentHash({ ...base, ciphertext: base.ciphertext.replace("K", "L") }),
		).not.toBe(baseHash)
		expect(await computeContentHash({ ...base, nonce: base.nonce.replace("A", "B") })).not.toBe(
			baseHash,
		)
		expect(
			await computeContentHash({
				...base,
				senderPublicKey: base.senderPublicKey.replace("S", "T"),
			}),
		).not.toBe(baseHash)
	})

	it("depends on field ORDER", async () => {
		const { ciphertext, nonce, senderPublicKey } = {
			ciphertext: "aaa",
			nonce: "bb",
			senderPublicKey: "c",
		}
		expect(await computeContentHash({ ciphertext, nonce, senderPublicKey })).not.toBe(
			await computeContentHash({ ciphertext: nonce, nonce: ciphertext, senderPublicKey }),
		)
	})

	it("length prefixes prevent field-boundary ambiguity", async () => {
		// A bare "|" join would give "a|b|c|d" for both of these.
		const one = { ciphertext: "a|b", nonce: "c", senderPublicKey: "d" }
		const two = { ciphertext: "a", nonce: "b|c", senderPublicKey: "d" }
		expect(await computeContentHash(one)).not.toBe(await computeContentHash(two))
	})

	it("rejects non-string fields", async () => {
		expect(
			await codeOfAsync(
				computeContentHash({
					ciphertext: 5 as unknown as string,
					nonce: "n",
					senderPublicKey: "s",
				}),
			),
		).toBe("invalid_argument")
	})

	it("fails closed on strings that cannot be UTF-8 encoded (lone surrogate)", async () => {
		expect(
			await codeOfAsync(
				computeContentHash({ ciphertext: "\ud800", nonce: "n", senderPublicKey: "s" }),
			),
		).toBe("invalid_utf8")
	})

	it("hashes the strings verbatim — it does not validate or normalise Base64", async () => {
		const input = { ciphertext: "not base64 !!", nonce: "n", senderPublicKey: "s" }
		expect(await computeContentHash(input)).toBe(sha256HexOf("13:not base64 !!|1:n|1:s"))
	})
})
