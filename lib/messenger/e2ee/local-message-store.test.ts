// @vitest-environment node
import { asPkid } from "@/types/messenger"
import { describe, expect, it } from "vitest"
import { saveIdentity } from "./identity-store"
import {
	getLatestLocalMessageCopy,
	getLocalMessageCopy,
	removeLocalMessageCopies,
	saveLocalMessageCopy,
} from "./local-message-store"
import { getE2eeDatabase, LOCAL_MESSAGE_COPIES_STORE } from "./storage/database"
import { setupFreshE2eeDatabase } from "./storage/test-support"

setupFreshE2eeDatabase()

const accountA = asPkid(101)
const accountB = asPkid(202)
const peerA = asPkid(301)

async function installIdentity(accountId: typeof accountA, seed: number) {
	await saveIdentity(accountId, {
		privateKey: new Uint8Array(32).fill(seed),
		publicKey: new Uint8Array(32).fill(seed + 1),
		updatedAt: 1_700_000_000_000 + seed,
	})
}

async function saveCopy(accountId: typeof accountA, messageId: number, plaintext: string) {
	await saveLocalMessageCopy({
		accountId,
		messageId,
		peerId: peerA,
		envelopeHash: `envelope-${messageId}`,
		plaintext,
		messageType: "text",
		createdAt: new Date(Date.parse("2026-10-14T08:00:00.000Z") + messageId * 1000).toISOString(),
	})
}

describe("account-scoped local encrypted message copies", () => {
	it("stores ciphertext rather than plaintext and decrypts only for the owning account", async () => {
		await installIdentity(accountA, 11)
		await installIdentity(accountB, 21)
		await saveCopy(accountA, 1, "A private message body")

		const db = await getE2eeDatabase()
		const tx = db.transaction(LOCAL_MESSAGE_COPIES_STORE, "readonly")
		const row = await new Promise<Record<string, unknown>>((resolve, reject) => {
			const request = tx.objectStore(LOCAL_MESSAGE_COPIES_STORE).get([accountA, 1])
			request.onsuccess = () => resolve(request.result as Record<string, unknown>)
			request.onerror = () => reject(request.error)
		})

		expect(row).toBeDefined()
		expect(row).not.toHaveProperty("plaintext")
		expect(row.ciphertext).toBeInstanceOf(Uint8Array)
		expect(new TextDecoder().decode(row.ciphertext as Uint8Array)).not.toContain(
			"A private message body",
		)
		await expect(getLocalMessageCopy(accountA, 1)).resolves.toMatchObject({
			accountId: accountA,
			plaintext: "A private message body",
		})
		await expect(getLocalMessageCopy(accountB, 1)).resolves.toBeNull()
	})

	it("scopes latest-copy lookup and deletion to the requested account", async () => {
		await installIdentity(accountA, 31)
		await installIdentity(accountB, 41)
		await saveCopy(accountA, 10, "Account A copy")
		await saveCopy(accountB, 10, "Account B copy")

		await expect(getLatestLocalMessageCopy(accountA, peerA)).resolves.toMatchObject({
			plaintext: "Account A copy",
		})
		await expect(getLatestLocalMessageCopy(accountB, peerA)).resolves.toMatchObject({
			plaintext: "Account B copy",
		})

		await removeLocalMessageCopies(accountA)
		await expect(getLatestLocalMessageCopy(accountA, peerA)).resolves.toBeNull()
		await expect(getLatestLocalMessageCopy(accountB, peerA)).resolves.toMatchObject({
			plaintext: "Account B copy",
		})
	})
})
