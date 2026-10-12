/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment node

import { asPkid } from "@/types/messenger"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { chatApi } from "../api"
import { createOptimisticMessage } from "../optimistic"
import {
	decryptDirectMessageEnvelope,
	decryptDirectMessageHistoryPage,
	prepareDirectMessageEnvelope,
	prepareDirectMessageSendPayload,
} from "./direct-message"
import { BOX_VECTOR, CONTENT_HASH_VECTORS } from "./e2ee-test-vectors"
import { bytesToBase64 } from "./encoding"
import { type StoredIdentity } from "./identity-store"
import { e2eeRuntime } from "./runtime"
import { setupFreshE2eeDatabase } from "./storage/test-support"
import { getTrustedKey, saveTrustedKey } from "./trust-store"

setupFreshE2eeDatabase()

beforeEach(() => {
	vi.spyOn(chatApi, "getUserEncryptionBundle").mockResolvedValue({
		identity_public_key: bytesToBase64(BOX_VECTOR.alicePublicKey),
	})
})

afterEach(() => {
	e2eeRuntime.clear()
	vi.restoreAllMocks()
})

describe("direct-message E2EE send envelope", () => {
	it("rejects a sender key that does not match the authenticated bundle without pinning it", async () => {
		const accountId = asPkid(8101), senderId = asPkid(8102)
		const recipientIdentity: StoredIdentity = { privateKey: BOX_VECTOR.bobSecretKey, publicKey: BOX_VECTOR.bobPublicKey, updatedAt: Date.now() }
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const env = await prepareDirectMessageEnvelope({ plaintext: "authenticated sender test", senderPrivateKey: BOX_VECTOR.aliceSecretKey, senderPublicKey: BOX_VECTOR.alicePublicKey, recipientPublicKey: BOX_VECTOR.bobPublicKey })
		vi.mocked(chatApi.getUserEncryptionBundle).mockResolvedValueOnce({ identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey) })
		const message = { id: 8103, sender: { pkid: senderId }, content: env.content, nonce: env.nonce, sender_ephemeral_key: env.sender_ephemeral_key, e2ee: true, e2ee_version: 1, e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305", e2ee_content_hash: env.e2ee_content_hash, metadata: null } as any
		expect(await decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message, recipientIdentity })).toBeNull()
		expect(await getTrustedKey(accountId, senderId)).toBeNull()
	})

	it("decrypts and pins only after the authenticated bundle matches the sender key", async () => {
		const accountId = asPkid(8201), senderId = asPkid(8202)
		const recipientIdentity: StoredIdentity = { privateKey: BOX_VECTOR.bobSecretKey, publicKey: BOX_VECTOR.bobPublicKey, updatedAt: Date.now() }
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const env = await prepareDirectMessageEnvelope({ plaintext: "authenticated sender test", senderPrivateKey: BOX_VECTOR.aliceSecretKey, senderPublicKey: BOX_VECTOR.alicePublicKey, recipientPublicKey: BOX_VECTOR.bobPublicKey })
		const message = { id: 8203, sender: { pkid: senderId }, content: env.content, nonce: env.nonce, sender_ephemeral_key: env.sender_ephemeral_key, e2ee: true, e2ee_version: 1, e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305", e2ee_content_hash: env.e2ee_content_hash, metadata: null } as any
		const decrypted = await decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message, recipientIdentity })
		expect(decrypted?.content).toBe("authenticated sender test")
		const trusted = await getTrustedKey(accountId, senderId)
		expect(trusted).not.toBeNull()
		expect(Array.from(trusted!.publicKey)).toEqual(Array.from(BOX_VECTOR.alicePublicKey))
	})

	it("rejects malformed bundle keys and malformed content hashes without pinning", async () => {
		const accountId = asPkid(8301), senderId = asPkid(8302)
		const recipientIdentity: StoredIdentity = { privateKey: BOX_VECTOR.bobSecretKey, publicKey: BOX_VECTOR.bobPublicKey, updatedAt: Date.now() }
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const env = await prepareDirectMessageEnvelope({ plaintext: "authenticated sender test", senderPrivateKey: BOX_VECTOR.aliceSecretKey, senderPublicKey: BOX_VECTOR.alicePublicKey, recipientPublicKey: BOX_VECTOR.bobPublicKey })
		const message = { id: 8303, sender: { pkid: senderId }, content: env.content, nonce: env.nonce, sender_ephemeral_key: env.sender_ephemeral_key, e2ee: true, e2ee_version: 1, e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305", e2ee_content_hash: env.e2ee_content_hash, metadata: null } as any
		vi.mocked(chatApi.getUserEncryptionBundle).mockResolvedValueOnce({ identity_public_key: "%%%not-base64%%%" })
		expect(await decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message, recipientIdentity })).toBeNull()
		expect(await getTrustedKey(accountId, senderId)).toBeNull()
		vi.mocked(chatApi.getUserEncryptionBundle).mockResolvedValueOnce({ identity_public_key: bytesToBase64(BOX_VECTOR.alicePublicKey) })
		expect(await decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message: { ...message, e2ee_content_hash: "not-a-sha256-hash" }, recipientIdentity })).toBeNull()
		expect(await getTrustedKey(accountId, senderId)).toBeNull()
	})

	it("does not replace an existing trusted key when the authenticated sender key changes", async () => {
		const accountId = asPkid(8401), senderId = asPkid(8402)
		const recipientIdentity: StoredIdentity = { privateKey: BOX_VECTOR.bobSecretKey, publicKey: BOX_VECTOR.bobPublicKey, updatedAt: Date.now() }
		const oldTrustedKey = new Uint8Array(32).fill(0x1a)
		await saveTrustedKey(accountId, senderId, oldTrustedKey)
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const env = await prepareDirectMessageEnvelope({ plaintext: "authenticated sender test", senderPrivateKey: BOX_VECTOR.aliceSecretKey, senderPublicKey: BOX_VECTOR.alicePublicKey, recipientPublicKey: BOX_VECTOR.bobPublicKey })
		const message = { id: 8403, sender: { pkid: senderId }, content: env.content, nonce: env.nonce, sender_ephemeral_key: env.sender_ephemeral_key, e2ee: true, e2ee_version: 1, e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305", e2ee_content_hash: env.e2ee_content_hash, metadata: null } as any
		expect(await decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message, recipientIdentity })).toBeNull()
		const stillTrusted = await getTrustedKey(accountId, senderId)
		expect(Array.from(stillTrusted!.publicKey)).toEqual(Array.from(oldTrustedKey))
	})

	it("rejects invalid sender identifiers before requesting a bundle", async () => {
		const accountId = asPkid(8501)
		const recipientIdentity: StoredIdentity = { privateKey: BOX_VECTOR.bobSecretKey, publicKey: BOX_VECTOR.bobPublicKey, updatedAt: Date.now() }
		const env = await prepareDirectMessageEnvelope({ plaintext: "authenticated sender test", senderPrivateKey: BOX_VECTOR.aliceSecretKey, senderPublicKey: BOX_VECTOR.alicePublicKey, recipientPublicKey: BOX_VECTOR.bobPublicKey })
		const message = { id: 8502, sender: { pkid: 0 }, content: env.content, nonce: env.nonce, sender_ephemeral_key: env.sender_ephemeral_key, e2ee: true, e2ee_version: 1, e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305", e2ee_content_hash: env.e2ee_content_hash, metadata: null } as any
		const bundleSpy = vi.mocked(chatApi.getUserEncryptionBundle)
		await expect(decryptDirectMessageEnvelope({ accountId, message, recipientIdentity })).resolves.toBeNull()
		expect(bundleSpy).not.toHaveBeenCalled()
	})

	it("decrypts a valid incoming direct message and normalizes the UI content", async () => {
		const accountId = asPkid(2001)
		const senderId = asPkid(42)
		const receiverId = asPkid(2001)
		const recipientIdentity = {
			privateKey: BOX_VECTOR.bobSecretKey,
			publicKey: BOX_VECTOR.bobPublicKey,
			updatedAt: Date.now(),
		}
		const encrypted = await prepareDirectMessageEnvelope({
			plaintext: BOX_VECTOR.plaintext,
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
			nonce: BOX_VECTOR.nonce,
		})
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)

		const message = {
			id: 55,
			sender: {
				id: "sender-uuid",
				pkid: senderId,
				username: "alice",
				first_name: "Alice",
				last_name: null,
				profile_photo: null,
			},
			receiver: {
				id: "receiver-uuid",
				pkid: receiverId,
				username: "bob",
				first_name: "Bob",
				last_name: null,
				profile_photo: null,
			},
			group: null,
			message_type: "text",
			content: encrypted.content,
			nonce: encrypted.nonce,
			sender_ephemeral_key: encrypted.sender_ephemeral_key,
			e2ee: true,
			e2ee_version: 1,
			e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
			e2ee_content_hash: encrypted.e2ee_content_hash,
			media: null,
			metadata: null,
			status: "sent",
			reply_to: null,
			forwarded_from: null,
			is_hidden_by_me: false,
			is_deleted_for_all: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		} as any

		const decrypted = await decryptDirectMessageEnvelope({
			accountId,
			senderPkid: senderId,
			message,
			recipientIdentity,
		})

		expect(decrypted).not.toBeNull()
		expect(decrypted!.content).toBe(BOX_VECTOR.plaintext)
		expect(
			createOptimisticMessage(
				decrypted! as never,
				{
					id: "00000000-0000-0000-0000-000000000002" as never,
					pkid: accountId,
					username: "bob",
					first_name: "Bob",
					last_name: null,
					profile_photo: null,
				} as never,
			).content,
		).toBe(BOX_VECTOR.plaintext)
	})

	it("decrypts history pages and rejects invalid incoming envelopes", async () => {
		const accountId = asPkid(3001)
		const senderId = asPkid(77)
		const recipientIdentity = {
			privateKey: BOX_VECTOR.bobSecretKey,
			publicKey: BOX_VECTOR.bobPublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const encrypted = await prepareDirectMessageEnvelope({
			plaintext: "hello from bob",
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})
		const history = {
			results: [
				{
					id: 91,
					sender: {
						id: "sender-uuid-2",
						pkid: senderId,
						username: "alice",
						first_name: "Alice",
						last_name: null,
						profile_photo: null,
					},
					receiver: {
						id: "receiver-uuid-2",
						pkid: accountId,
						username: "bob",
						first_name: "Bob",
						last_name: null,
						profile_photo: null,
					},
					group: null,
					message_type: "text",
					content: encrypted.content,
					nonce: encrypted.nonce,
					sender_ephemeral_key: encrypted.sender_ephemeral_key,
					e2ee: true,
					e2ee_version: 1,
					e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
					e2ee_content_hash: encrypted.e2ee_content_hash,
					media: null,
					metadata: null,
					status: "sent",
					reply_to: null,
					forwarded_from: null,
					is_hidden_by_me: false,
					is_deleted_for_all: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				} as any,
			],
			next: null,
			previous: null,
		}
		const decryptedPage = await decryptDirectMessageHistoryPage(accountId, history)
		const plain = decryptedPage.results[0]
		expect(plain.content).toBe("hello from bob")

		const failed = await decryptDirectMessageHistoryPage(accountId, {
			...history,
			results: [
				{ ...history.results[0], content: "%%%", nonce: "%%%", sender_ephemeral_key: "%%%" },
			],
		})
		expect(failed.results).toHaveLength(1)
		expect(failed.results[0].content).toBe("Unable to decrypt message")
	})

	it("rejects wrong sender key, corrupted ciphertext, malformed or unknown envelopes, missing identity, and invalid UTF-8", async () => {
		const accountId = asPkid(4001)
		const senderId = asPkid(88)
		const recipientIdentity = {
			privateKey: BOX_VECTOR.bobSecretKey,
			publicKey: BOX_VECTOR.bobPublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)
		const env = await prepareDirectMessageEnvelope({
			plaintext: BOX_VECTOR.plaintext,
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
			nonce: BOX_VECTOR.nonce,
		})
		const base = {
			id: 1,
			sender: {
				id: "s",
				pkid: senderId,
				username: "alice",
				first_name: "Alice",
				last_name: null,
				profile_photo: null,
			},
			receiver: {
				id: "r",
				pkid: accountId,
				username: "bob",
				first_name: "Bob",
				last_name: null,
				profile_photo: null,
			},
			group: null,
			message_type: "text",
			content: env.content,
			nonce: env.nonce,
			sender_ephemeral_key: env.sender_ephemeral_key,
			e2ee: true,
			e2ee_version: 1,
			e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
			e2ee_content_hash: env.e2ee_content_hash,
			media: null,
			metadata: null,
			status: "sent",
			reply_to: null,
			forwarded_from: null,
			is_hidden_by_me: false,
			is_deleted_for_all: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		} as any

		expect(
			await decryptDirectMessageEnvelope({
				accountId,
				senderPkid: senderId,
				message: { ...base, sender_ephemeral_key: "AAAA" },
				recipientIdentity,
			}),
		).toBeNull()
		expect(
			await decryptDirectMessageEnvelope({
				accountId,
				senderPkid: senderId,
				message: { ...base, content: "AAAA" },
				recipientIdentity,
			}),
		).toBeNull()
		expect(
			await decryptDirectMessageEnvelope({
				accountId,
				senderPkid: senderId,
				message: { ...base, e2ee_version: 2 },
				recipientIdentity,
			}),
		).toBeNull()
		expect(
			await decryptDirectMessageEnvelope({
				accountId,
				senderPkid: senderId,
				message: { ...base, e2ee_algorithm: "nope" },
				recipientIdentity,
			}),
		).toBeNull()
		expect(
			await decryptDirectMessageEnvelope({
				accountId,
				senderPkid: senderId,
				message: { ...base, sender_ephemeral_key: undefined },
				recipientIdentity,
			}),
		).toBeNull()
		e2eeRuntime.clear()
		expect(
			await decryptDirectMessageEnvelope({
				accountId: 5001 as never,
				senderPkid: senderId,
				message: { ...base, receiver: { ...base.receiver, pkid: 5001 } },
				recipientIdentity: null,
			}),
		).toBeNull()
	})

	it("successfully encrypts, sets the wire fields, and computes the correct content hash", async () => {
		const env = await prepareDirectMessageEnvelope({
			plaintext: BOX_VECTOR.plaintext,
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
			nonce: BOX_VECTOR.nonce,
		})

		expect(env.content).toBe(bytesToBase64(BOX_VECTOR.ciphertext))
		expect(env.nonce).toBe(bytesToBase64(BOX_VECTOR.nonce))
		expect(env.sender_ephemeral_key).toBe(bytesToBase64(BOX_VECTOR.alicePublicKey))
		expect(env.e2ee).toBe(true)
		expect(env.e2ee_version).toBe(1)
		expect(env.e2ee_algorithm).toBe("nacl_box_curve25519xsalsa20poly1305")
		expect(env.e2ee_content_hash).toBe(CONTENT_HASH_VECTORS.envelopeHash)
	})

	it("generates a fresh nonce for each send", async () => {
		const first = await prepareDirectMessageEnvelope({
			plaintext: "hello",
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})
		const second = await prepareDirectMessageEnvelope({
			plaintext: "hello",
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})

		expect(first.nonce).not.toBe(second.nonce)
		expect(first.content).not.toBe(second.content)
	})

	it("pins the recipient key on first observation and accepts a matching key", async () => {
		const accountId = asPkid(101)
		const recipientId = asPkid(202)
		const identity: StoredIdentity = {
			privateKey: BOX_VECTOR.aliceSecretKey,
			publicKey: BOX_VECTOR.alicePublicKey,
			updatedAt: Date.now(),
		}

		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, identity)

		const result = await prepareDirectMessageSendPayload({
			accountId,
			recipientId,
			plaintext: "hello",
			senderIdentity: identity,
			bundle: { identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey) },
		})

		expect(result).not.toBeNull()
		expect(result!.metadata?.recipient_identity_public_key).toBe(bytesToBase64(BOX_VECTOR.bobPublicKey))
		const pinned = await getTrustedKey(accountId, recipientId)
		expect(pinned).not.toBeNull()
		expect(Array.from(pinned!.publicKey)).toEqual(Array.from(BOX_VECTOR.bobPublicKey))
	})

	it("fails closed when the recipient key changes", async () => {
		const accountId = asPkid(333)
		const recipientId = asPkid(444)
		const identity: StoredIdentity = {
			privateKey: BOX_VECTOR.aliceSecretKey,
			publicKey: BOX_VECTOR.alicePublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, identity)
		await saveTrustedKey(accountId, recipientId, new Uint8Array(32).fill(0x1a))

		const result = await prepareDirectMessageSendPayload({
			accountId,
			recipientId,
			plaintext: "hello",
			senderIdentity: identity,
			bundle: { identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey) },
		})

		expect(result).toBeNull()
	})

	it("fails when no restored sender identity is available", async () => {
		const accountId = asPkid(555)
		const recipientId = asPkid(666)
		await e2eeRuntime.activate(accountId)

		const result = await prepareDirectMessageSendPayload({
			accountId,
			recipientId,
			plaintext: "hello",
			senderIdentity: null,
			bundle: { identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey) },
		})

		expect(result).toBeNull()
	})

	it("does not persist plaintext in the optimistic message payload", async () => {
		const payload = await prepareDirectMessageSendPayload({
			accountId: asPkid(777),
			recipientId: asPkid(888),
			plaintext: "hello world",
			senderIdentity: {
				privateKey: BOX_VECTOR.aliceSecretKey,
				publicKey: BOX_VECTOR.alicePublicKey,
				updatedAt: Date.now(),
			},
			bundle: { identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey) },
		})

		expect(payload).not.toBeNull()
		const optimistic = createOptimisticMessage(payload!, {
			id: "00000000-0000-0000-0000-000000000001" as never,
			pkid: asPkid(777),
			username: "alice",
			first_name: "Alice",
			last_name: null,
			profile_photo: null,
		})
		expect(optimistic.content).toBe(payload!.content)
		expect(optimistic.content).not.toBe("hello world")
	})
})


describe("cross-device sent-message recovery", () => {
	it("decrypts sent server ciphertext with the restored sender identity and recorded recipient key", async () => {
		const accountId = asPkid(9101)
		const recipientId = asPkid(9102)
		const identity: StoredIdentity = {
			privateKey: BOX_VECTOR.aliceSecretKey,
			publicKey: BOX_VECTOR.alicePublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, identity)
		const envelope = await prepareDirectMessageEnvelope({
			plaintext: "sent message recovered on another device",
			senderPrivateKey: identity.privateKey,
			senderPublicKey: identity.publicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})
		const page = {
			results: [{
				id: 9103,
				sender: { pkid: accountId },
				receiver: { pkid: recipientId },
				message_type: "text",
				content: envelope.content,
				nonce: envelope.nonce,
				sender_ephemeral_key: envelope.sender_ephemeral_key,
				metadata: {
					e2ee: true,
					e2ee_version: 1,
					e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
					e2ee_content_hash: envelope.e2ee_content_hash,
					recipient_identity_public_key: bytesToBase64(BOX_VECTOR.bobPublicKey),
				},
			} as any],
			next: null,
		}
		const recovered = await decryptDirectMessageHistoryPage(accountId, page)
		expect(recovered.results[0].content).toBe("sent message recovered on another device")
	})

	it("returns unavailable rather than ciphertext when sent-message recovery fails", async () => {
		const accountId = asPkid(9201)
		const identity: StoredIdentity = {
			privateKey: BOX_VECTOR.aliceSecretKey,
			publicKey: BOX_VECTOR.alicePublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, identity)
		const envelope = await prepareDirectMessageEnvelope({
			plaintext: "must not leak ciphertext",
			senderPrivateKey: identity.privateKey,
			senderPublicKey: identity.publicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})
		const page = {
			results: [{
				id: 9202,
				sender: { pkid: accountId },
				receiver: { pkid: asPkid(9203) },
				message_type: "text",
				content: envelope.content,
				nonce: envelope.nonce,
				sender_ephemeral_key: envelope.sender_ephemeral_key,
				metadata: {
					e2ee: true,
					e2ee_version: 1,
					e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
					e2ee_content_hash: envelope.e2ee_content_hash,
					recipient_identity_public_key: bytesToBase64(BOX_VECTOR.alicePublicKey),
				},
			} as any],
			next: null,
		}
		const recovered = await decryptDirectMessageHistoryPage(accountId, page)
		expect(recovered.results[0].content).toBe("Unable to decrypt message")
		expect(recovered.results[0].content).not.toBe(envelope.content)
	})
})

describe("concurrent incoming sender trust", () => {
	it("allows concurrent messages from the same authenticated key without overwriting the first pin", async () => {
		const accountId = asPkid(8601)
		const senderId = asPkid(8602)
		const recipientIdentity: StoredIdentity = {
			privateKey: BOX_VECTOR.bobSecretKey,
			publicKey: BOX_VECTOR.bobPublicKey,
			updatedAt: Date.now(),
		}
		await e2eeRuntime.activate(accountId)
		await e2eeRuntime.installIdentity(accountId, recipientIdentity)

		const env = await prepareDirectMessageEnvelope({
			plaintext: "concurrent authenticated sender test",
			senderPrivateKey: BOX_VECTOR.aliceSecretKey,
			senderPublicKey: BOX_VECTOR.alicePublicKey,
			recipientPublicKey: BOX_VECTOR.bobPublicKey,
		})
		const message = {
			id: 8603,
			sender: { pkid: senderId },
			content: env.content,
			nonce: env.nonce,
			sender_ephemeral_key: env.sender_ephemeral_key,
			e2ee: true,
			e2ee_version: 1,
			e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305",
			e2ee_content_hash: env.e2ee_content_hash,
			metadata: null,
		} as any

		const [first, second] = await Promise.all([
			decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message, recipientIdentity }),
			decryptDirectMessageEnvelope({ accountId, senderPkid: senderId, message: { ...message, id: 8604 }, recipientIdentity }),
		])

		expect(first?.content).toBe("concurrent authenticated sender test")
		expect(second?.content).toBe("concurrent authenticated sender test")
		const trusted = await getTrustedKey(accountId, senderId)
		expect(trusted).not.toBeNull()
		expect(Array.from(trusted!.publicKey)).toEqual(Array.from(BOX_VECTOR.alicePublicKey))
	})
})
