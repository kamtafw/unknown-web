import type { MediaAttachment, MessageType, Pkid, SendMessagePayload } from "@/types/messenger"
import {
	BOX_PUBLIC_KEY_LENGTH,
	E2EE_MESSAGE_ALGORITHM_V1,
	E2EE_MESSAGE_VERSION,
} from "./constants"
import { computeContentHash } from "./content-hash"
import { bytesToBase64, base64ToBytesOfLength, utf8ToBytes } from "./encoding"
import { type StoredIdentity } from "./identity-store"
import { boxPublicKeyFromSecretKey, boxSeal, constantTimeEqual } from "./nacl"
import { generateNonce } from "./random"
import { e2eeRuntime } from "./runtime"
import { getTrustedKey, pinIfAbsent } from "./trust-store"

export interface DirectMessageEncryptionBundle {
	identity_public_key: string
}

export interface PrepareDirectMessageEnvelopeParams {
	plaintext: string
	senderPrivateKey: Uint8Array
	senderPublicKey: Uint8Array
	recipientPublicKey: Uint8Array
	nonce?: Uint8Array
}

export interface DirectMessageEnvelope {
	content: string
	nonce: string
	sender_ephemeral_key: string
	e2ee: true
	e2ee_version: typeof E2EE_MESSAGE_VERSION
	e2ee_algorithm: typeof E2EE_MESSAGE_ALGORITHM_V1
	e2ee_content_hash: string
}

export async function prepareDirectMessageEnvelope({
	plaintext,
	senderPrivateKey,
	senderPublicKey,
	recipientPublicKey,
	nonce,
}: PrepareDirectMessageEnvelopeParams): Promise<DirectMessageEnvelope> {
	const finalNonce = nonce ?? generateNonce()
	const ciphertext = boxSeal({
		plaintext: utf8ToBytes(plaintext),
		nonce: finalNonce,
		peerPublicKey: recipientPublicKey,
		ownSecretKey: senderPrivateKey,
	})

	const ciphertextBase64 = bytesToBase64(ciphertext)
	const nonceBase64 = bytesToBase64(finalNonce)
	const senderIdentityPublicKeyBase64 = bytesToBase64(senderPublicKey)
	const e2eeContentHash = await computeContentHash({
		ciphertext: ciphertextBase64,
		nonce: nonceBase64,
		senderPublicKey: senderIdentityPublicKeyBase64,
	})

	return {
		content: ciphertextBase64,
		nonce: nonceBase64,
		sender_ephemeral_key: senderIdentityPublicKeyBase64,
		e2ee: true,
		e2ee_version: E2EE_MESSAGE_VERSION,
		e2ee_algorithm: E2EE_MESSAGE_ALGORITHM_V1,
		e2ee_content_hash: e2eeContentHash,
	}
}

export interface PrepareDirectMessageSendPayloadParams {
	accountId: Pkid
	recipientId: Pkid
	plaintext: string
	senderIdentity: StoredIdentity | null
	bundle: DirectMessageEncryptionBundle
	messageType?: MessageType
	media?: MediaAttachment[]
	metadata?: Record<string, unknown>
	reply_to?: number
	nonce?: Uint8Array
}

export async function prepareDirectMessageSendPayload({
	accountId,
	recipientId,
	plaintext,
	senderIdentity,
	bundle,
	messageType = "text",
	media,
	metadata,
	reply_to,
	nonce,
}: PrepareDirectMessageSendPayloadParams): Promise<SendMessagePayload | null> {
	if (!senderIdentity) return null

	const derivedPublicKey = boxPublicKeyFromSecretKey(senderIdentity.privateKey)
	if (!constantTimeEqual(derivedPublicKey, senderIdentity.publicKey)) {
		return null
	}

	const recipientPublicKeyBytes = (() => {
		try {
			return base64ToBytesOfLength(bundle.identity_public_key, BOX_PUBLIC_KEY_LENGTH)
		} catch {
			return null
		}
	})()
	if (!recipientPublicKeyBytes) return null

	try {
		const existingKey = await getTrustedKey(accountId, recipientId)
		if (existingKey && !constantTimeEqual(existingKey.publicKey, recipientPublicKeyBytes)) {
			return null
		}

		const pinResult = await pinIfAbsent(accountId, recipientId, recipientPublicKeyBytes)
		if (
			!pinResult.pinned &&
			pinResult.existing &&
			!constantTimeEqual(pinResult.existing.publicKey, recipientPublicKeyBytes)
		) {
			return null
		}

		const envelope = await prepareDirectMessageEnvelope({
			plaintext,
			senderPrivateKey: senderIdentity.privateKey,
			senderPublicKey: senderIdentity.publicKey,
			recipientPublicKey: recipientPublicKeyBytes,
			nonce,
		})

		return {
			receiver_id: recipientId,
			message_type: messageType,
			content: envelope.content,
			media,
			metadata,
			...(reply_to ? { reply_to } : {}),
			nonce: envelope.nonce,
			sender_ephemeral_key: envelope.sender_ephemeral_key,
			e2ee: envelope.e2ee,
			e2ee_version: envelope.e2ee_version,
			e2ee_algorithm: envelope.e2ee_algorithm,
			e2ee_content_hash: envelope.e2ee_content_hash,
		}
	} catch {
		return null
	}
}

export async function getPreparedSenderIdentity(
	accountId: Pkid,
): Promise<StoredIdentity | null> {
	await e2eeRuntime.activate(accountId)
	return e2eeRuntime.getState()?.identity ?? null
}
