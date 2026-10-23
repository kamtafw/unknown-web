import type { Pkid } from "@/types/messenger"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { getLatestLocalMessageCopy } from "./local-message-store"
import { resolveLocalChatPreview } from "./local-preview"

vi.mock("./local-message-store", () => ({
	getLatestLocalMessageCopy: vi.fn(),
}))

const getLatestMock = vi.mocked(getLatestLocalMessageCopy)
const accountId = 35 as Pkid
const peerId = 41 as Pkid
const latestTime = "2026-10-12T07:12:21.948Z"

describe("resolveLocalChatPreview", () => {
	beforeEach(() => vi.resetAllMocks())

	it("uses a local plaintext copy only when it matches the latest list timestamp", async () => {
		getLatestMock.mockResolvedValue({
			accountId,
			messageId: 7,
			peerId,
			envelopeHash: "hash",
			plaintext: "Hello",
			messageType: "text",
			createdAt: Date.parse(latestTime),
			updatedAt: Date.now(),
		})
		await expect(
			resolveLocalChatPreview(accountId, peerId, "ciphertext", latestTime, "text"),
		).resolves.toBe("Hello")
	})

	it("requires an exact local message ID when the list provides one", async () => {
		getLatestMock.mockResolvedValue({
			accountId,
			messageId: 7,
			peerId,
			envelopeHash: "hash",
			plaintext: "Possibly stale",
			messageType: "text",
			createdAt: Date.parse(latestTime),
			updatedAt: Date.now(),
		})
		await expect(
			resolveLocalChatPreview(accountId, peerId, "ciphertext", latestTime, "text", 8),
		).resolves.toBe("Encrypted message")
		await expect(
			resolveLocalChatPreview(accountId, peerId, "ciphertext", latestTime, "text", 7),
		).resolves.toBe("Possibly stale")
	})

	it("does not use an older local copy as the latest preview", async () => {
		getLatestMock.mockResolvedValue({
			accountId,
			messageId: 6,
			peerId,
			envelopeHash: "old-hash",
			plaintext: "Old plaintext",
			messageType: "text",
			createdAt: Date.parse(latestTime) - 1000,
			updatedAt: Date.now(),
		})
		await expect(
			resolveLocalChatPreview(accountId, peerId, "ciphertext", latestTime, "text"),
		).resolves.toBe("Encrypted message")
	})

	it("never returns the server preview when no local copy exists", async () => {
		getLatestMock.mockResolvedValue(null)
		await expect(
			resolveLocalChatPreview(accountId, peerId, "ciphertext-looking-string", latestTime, "text"),
		).resolves.toBe("Encrypted message")
	})

	it("uses a safe type-specific fallback when no local copy exists", async () => {
		getLatestMock.mockResolvedValue(null)
		await expect(resolveLocalChatPreview(accountId, peerId, "", latestTime, "image")).resolves.toBe(
			"Image",
		)
		await expect(
			resolveLocalChatPreview(accountId, peerId, "opaque", latestTime, "voice"),
		).resolves.toBe("Voice message")
	})

	it("uses a safe fallback when message type is present but preview and timestamp are blank", async () => {
		getLatestMock.mockResolvedValue(null)
		await expect(resolveLocalChatPreview(accountId, peerId, "", null, "text")).resolves.toBe(
			"Encrypted message",
		)
		await expect(resolveLocalChatPreview(accountId, peerId, null, null, "image")).resolves.toBe(
			"Image",
		)
	})

	it("returns no-message empty state when there is no preview or latest-message timestamp", async () => {
		getLatestMock.mockResolvedValue(null)
		await expect(resolveLocalChatPreview(accountId, peerId, null, null, null)).resolves.toBe("")
	})
})
