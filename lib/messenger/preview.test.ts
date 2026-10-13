import { describe, expect, it } from "vitest"
import { resolveEncryptedPreviewFallback } from "./preview"

describe("resolveEncryptedPreviewFallback", () => {
	it("returns no fallback when the list row has no latest message", () => {
		expect(resolveEncryptedPreviewFallback(false, "text")).toBeNull()
		expect(resolveEncryptedPreviewFallback(false, "image")).toBeNull()
	})

	it.each([
		["image", "Image"],
		["media", "Image"],
		["video", "Video"],
		["audio", "Voice message"],
		["voice", "Voice message"],
		["document", "Document"],
		["location", "Location"],
		["contact", "Contact"],
		["poll", "Poll"],
		["call", "Call"],
		["share", "Shared post"],
		["sticker", "Sticker"],
		["text", "Encrypted message"],
		["unknown-future-type", "Encrypted message"],
	])("uses a safe fallback for %s messages", (type, expected) => {
		expect(resolveEncryptedPreviewFallback(true, type)).toBe(expected)
	})
})
