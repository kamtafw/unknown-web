// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
	base64ToBytes,
	base64ToBytesOfLength,
	bytesToBase64,
	bytesToHex,
	bytesToUtf8,
	utf8ToBytes,
} from "./encoding"
import { E2eeCryptoError } from "./errors"

const ascii = (s: string) => new TextEncoder().encode(s)

/** Deterministic pseudo-random bytes (LCG) so failures are reproducible. */
function deterministicBytes(length: number, seed: number): Uint8Array {
	const out = new Uint8Array(length)
	let state = seed >>> 0
	for (let i = 0; i < length; i++) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0
		out[i] = state >>> 24
	}
	return out
}

function codeOf(fn: () => unknown): string | undefined {
	try {
		fn()
	} catch (err) {
		return err instanceof E2eeCryptoError ? err.code : `non-e2ee:${String(err)}`
	}
	return undefined
}

describe("base64", () => {
	describe("RFC 4648 §10 test vectors", () => {
		const vectors: Array<[string, string]> = [
			["", ""],
			["f", "Zg=="],
			["fo", "Zm8="],
			["foo", "Zm9v"],
			["foob", "Zm9vYg=="],
			["fooba", "Zm9vYmE="],
			["foobar", "Zm9vYmFy"],
		]

		it.each(vectors)("encodes %j as %j", (plain, encoded) => {
			expect(bytesToBase64(ascii(plain))).toBe(encoded)
		})

		it.each(vectors)("decodes %j back to %j", (plain, encoded) => {
			expect(Array.from(base64ToBytes(encoded))).toEqual(Array.from(ascii(plain)))
		})
	})

	it("round-trips every byte value", () => {
		const all = Uint8Array.from({ length: 256 }, (_, i) => i)
		expect(Array.from(base64ToBytes(bytesToBase64(all)))).toEqual(Array.from(all))
	})

	it("agrees with Node's Buffer for lengths 0..200 (independent oracle)", () => {
		for (let length = 0; length <= 200; length++) {
			const bytes = deterministicBytes(length, length + 1)
			const expected = Buffer.from(bytes).toString("base64")
			expect(bytesToBase64(bytes)).toBe(expected)
			expect(Array.from(base64ToBytes(expected))).toEqual(Array.from(bytes))
		}
	})

	describe("rejects everything that is not strict standard padded Base64", () => {
		const invalid: Array<[string, string]> = [
			["missing padding", "Zg"],
			["missing padding (3 chars)", "Zm8"],
			["length not a multiple of 4", "Zm9vY"],
			["too little padding", "Zg="],
			["too much padding", "Zg==="],
			["padding in the middle", "Zg==Zg=="],
			["only padding", "===="],
			["padding-first", "=Zg="],
			["single char + padding", "Z==="],
			["URL-safe '-'", "Zm-v"],
			["URL-safe '_'", "Zm_v"],
			["URL-safe pair", "-_-_"],
			["trailing newline", "Zm9v\n"],
			["CRLF", "Zg==\r\n"],
			["leading space", " Zm9v"],
			["trailing space", "Zm9v "],
			["embedded space", "Zm 9v"],
			["non-ASCII char", "Zm9é"],
			["full-width char", "Ｚm9v"],
			["NUL byte", "Zm9\u0000"],
			['non-canonical ("Zh==": unused bits set)', "Zh=="],
			['non-canonical ("Zm9=": unused bits set)', "Zm9="],
			['non-canonical ("Zg9=")', "Zg9="],
		]

		it.each(invalid)("%s", (_label, value) => {
			expect(codeOf(() => base64ToBytes(value))).toBe("invalid_base64")
		})

		it("rejects non-string input", () => {
			for (const value of [undefined, null, 42, {}, [], new Uint8Array(4)]) {
				expect(codeOf(() => base64ToBytes(value as unknown as string))).toBe("invalid_base64")
			}
		})

		it("accepts the canonical siblings of the non-canonical cases", () => {
			expect(Array.from(base64ToBytes("Zg=="))).toEqual([0x66])
			expect(Array.from(base64ToBytes("Zm8="))).toEqual([0x66, 0x6f])
		})
	})

	it("never echoes the offending input in the error message", () => {
		const secret = "SECRET-KEY-MATERIAL-!!"
		try {
			base64ToBytes(secret)
			throw new Error("expected base64ToBytes to throw")
		} catch (err) {
			expect(err).toBeInstanceOf(E2eeCryptoError)
			expect((err as Error).message).not.toContain("SECRET")
		}
	})

	describe("base64ToBytesOfLength (decoded length, not string length)", () => {
		it("accepts the exact decoded length", () => {
			const key = deterministicBytes(32, 7)
			expect(base64ToBytesOfLength(bytesToBase64(key), 32)).toEqual(key)
		})

		it.each([
			["shorter", 31, 32],
			["longer", 33, 32],
			["empty", 0, 32],
		])("rejects %s values", (_label, actual, expected) => {
			const value = bytesToBase64(deterministicBytes(actual, 9))
			expect(codeOf(() => base64ToBytesOfLength(value, expected))).toBe("invalid_length")
		})

		it("a 44-character string is not automatically 32 bytes", () => {
			// 33 bytes → 44 chars WITHOUT padding: the right string length, the wrong byte length.
			const value = bytesToBase64(deterministicBytes(33, 3))
			expect(value).toHaveLength(44)
			expect(codeOf(() => base64ToBytesOfLength(value, 32))).toBe("invalid_length")
		})

		it("still enforces strict Base64 before checking length", () => {
			expect(codeOf(() => base64ToBytesOfLength("not base64", 32))).toBe("invalid_base64")
		})
	})
})

describe("utf-8", () => {
	const cases: Array<[string, string, number[]]> = [
		["empty", "", []],
		["ASCII", "abc", [0x61, 0x62, 0x63]],
		["2-byte", "é", [0xc3, 0xa9]],
		["3-byte", "€", [0xe2, 0x82, 0xac]],
		["4-byte (astral)", "😀", [0xf0, 0x9f, 0x98, 0x80]],
	]

	it.each(cases)("encodes and decodes %s", (_label, text, bytes) => {
		expect(Array.from(utf8ToBytes(text))).toEqual(bytes)
		expect(bytesToUtf8(Uint8Array.from(bytes))).toBe(text)
	})

	it("round-trips mixed scripts, emoji and control characters", () => {
		const text = "Hello, Bob! héllo 👋 日本語 \u0000\n\t end"
		expect(bytesToUtf8(utf8ToBytes(text))).toBe(text)
	})

	it("preserves a leading BOM instead of stripping it", () => {
		const withBom = "\ufeffabc"
		expect(Array.from(utf8ToBytes(withBom)).slice(0, 3)).toEqual([0xef, 0xbb, 0xbf])
		expect(bytesToUtf8(utf8ToBytes(withBom))).toBe(withBom)
	})

	describe("encoding rejects lone surrogates instead of rewriting them to U+FFFD", () => {
		it.each([
			["lone high", "\ud800"],
			["lone low", "\udc00"],
			["high at end", "ab\ud83d"],
			["low at start", "\ude00ab"],
			["high followed by non-low", "\ud83dabc"],
			["reversed pair", "\ude00\ud83d"],
		])("%s", (_label, text) => {
			expect(codeOf(() => utf8ToBytes(text))).toBe("invalid_utf8")
		})

		it("accepts a well-formed surrogate pair", () => {
			expect(bytesToUtf8(utf8ToBytes("a😀b"))).toBe("a😀b")
		})
	})

	describe("decoding rejects invalid UTF-8 instead of substituting U+FFFD", () => {
		it.each([
			["invalid lead byte", [0xff]],
			["stray continuation byte", [0x80]],
			["overlong encoding of NUL", [0xc0, 0x80]],
			["truncated 3-byte sequence", [0xe2, 0x82]],
			["truncated 4-byte sequence", [0xf0, 0x9f, 0x98]],
			["encoded surrogate (CESU-8)", [0xed, 0xa0, 0x80]],
			["code point above U+10FFFF", [0xf4, 0x90, 0x80, 0x80]],
			["valid text then garbage", [0x61, 0x62, 0xfe]],
		])("%s", (_label, bytes) => {
			expect(codeOf(() => bytesToUtf8(Uint8Array.from(bytes)))).toBe("invalid_utf8")
		})
	})

	it("rejects non-string input to utf8ToBytes", () => {
		expect(codeOf(() => utf8ToBytes(123 as unknown as string))).toBe("invalid_argument")
	})
})

describe("bytesToHex", () => {
	it("is lowercase and zero-padded", () => {
		expect(bytesToHex(Uint8Array.from([0x00, 0x0f, 0x10, 0xab, 0xff]))).toBe("000f10abff")
	})

	it("handles empty input", () => {
		expect(bytesToHex(new Uint8Array(0))).toBe("")
	})

	it("agrees with Node's Buffer for all byte values", () => {
		const all = Uint8Array.from({ length: 256 }, (_, i) => i)
		expect(bytesToHex(all)).toBe(Buffer.from(all).toString("hex"))
	})
})
