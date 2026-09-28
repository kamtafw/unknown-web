/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment node

import { asPkid } from "@/types/messenger"
import { afterEach, describe, expect, it } from "vitest"
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

afterEach(() => {
	e2eeRuntime.clear()
})

describe("direct-message E2EE send envelope", () => {
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
