import type {
	CursorPage,
	MediaAttachment,
	Message,
	MessageType,
	Pkid,
	SendMessagePayload,
} from "@/types/messenger"
import {
	BOX_NONCE_LENGTH,
	BOX_PUBLIC_KEY_LENGTH,
	E2EE_MESSAGE_ALGORITHM_V1,
	E2EE_MESSAGE_VERSION,
} from "./constants"
import { computeContentHash } from "./content-hash"
import {
	base64ToBytes,
	base64ToBytesOfLength,
	bytesToBase64,
	bytesToUtf8,
	utf8ToBytes,
} from "./encoding"
import { getIdentity, type StoredIdentity } from "./identity-store"
import { getLocalMessageCopy } from "./local-message-store"
import { boxOpen, boxPublicKeyFromSecretKey, boxSeal, constantTimeEqual } from "./nacl"
import { generateNonce } from "./random"
import { e2eeRuntime } from "./runtime"
import { getTrustedKey, pinIfAbsent } from "./trust-store"

export const E2EE_FAILURE_CONTENT = "Unable to decrypt message"
export const E2EE_UNSUPPORTED_CONTENT = "Unsupported encrypted message"

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

		const e2eeMetadata = {
			...(metadata ?? {}),
			e2ee: envelope.e2ee,
			e2ee_version: envelope.e2ee_version,
			e2ee_algorithm: envelope.e2ee_algorithm,
			e2ee_content_hash: envelope.e2ee_content_hash,
		}

		return {
			receiver_id: recipientId,
			message_type: messageType,
			content: envelope.content,
			media,
			metadata: e2eeMetadata,
			...(reply_to ? { reply_to } : {}),
			nonce: envelope.nonce,
			sender_ephemeral_key: envelope.sender_ephemeral_key,
		}
	} catch {
		return null
	}
}

export async function getPreparedSenderIdentity(accountId: Pkid): Promise<StoredIdentity | null> {
	await e2eeRuntime.activate(accountId)
	return e2eeRuntime.getState()?.identity ?? null
}

type E2EEMessageMetadata = {
	e2ee: true
	e2ee_version: number
	e2ee_algorithm: string
	e2ee_content_hash: string
}

export type IncomingDirectMessage = Message & {
	nonce?: string
	sender_ephemeral_key?: string
	metadata: (Record<string, unknown> & Partial<E2EEMessageMetadata>) | null
}

export interface DecryptDirectMessageEnvelopeParams {
	accountId: Pkid
	senderPkid?: Pkid | null
	message: IncomingDirectMessage
	recipientIdentity?: StoredIdentity | null
}

function resolveSenderPkid(message: Partial<IncomingDirectMessage>): Pkid | null {
	const candidate =
		(message.sender && typeof message.sender === "object" && "pkid" in message.sender
			? message.sender.pkid
			: undefined) ??
		(message as { senderPkid?: unknown }).senderPkid ??
		(message as { sender_id?: unknown }).sender_id ??
		(message as { senderId?: unknown }).senderId ??
		(message as { sender_pkid?: unknown }).sender_pkid

	if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate as Pkid
	if (typeof candidate === "string" && /^\d+$/.test(candidate)) return Number(candidate) as Pkid
	return null
}

function hasAnyE2EEIndicator(message: Record<string, unknown>): boolean {
	const metadata =
		message.metadata && typeof message.metadata === "object"
			? (message.metadata as Record<string, unknown>)
			: null

	return (
		Boolean(
			metadata &&
			("e2ee" in metadata ||
				"e2ee_version" in metadata ||
				"e2ee_algorithm" in metadata ||
				"e2ee_content_hash" in metadata),
		) ||
		"nonce" in message ||
		"sender_ephemeral_key" in message ||
		"e2ee" in message ||
		"e2ee_version" in message ||
		"e2ee_algorithm" in message ||
		"e2ee_content_hash" in message
	)
}

export function getMessageEnvelopeHash(message: IncomingDirectMessage): string | null {
	const metadata =
		message.metadata && typeof message.metadata === "object" ? message.metadata : null

	const metadataHash =
		typeof metadata?.e2ee_content_hash === "string" ? metadata.e2ee_content_hash : null

	if (metadataHash) return metadataHash

	const topLevelHash = (
		message as IncomingDirectMessage & {
			e2ee_content_hash?: unknown
		}
	).e2ee_content_hash

	return typeof topLevelHash === "string" ? topLevelHash : null
}

function getE2EEEnvelopeMetadata(message: IncomingDirectMessage) {
	const metadata = message.metadata && typeof message.metadata === "object" ? message.metadata : {}

	return {
		e2ee:
			metadata.e2ee === true ||
			(message as IncomingDirectMessage & { e2ee?: unknown }).e2ee === true,

		e2ee_version:
			metadata.e2ee_version ??
			(message as IncomingDirectMessage & { e2ee_version?: unknown }).e2ee_version,

		e2ee_algorithm:
			metadata.e2ee_algorithm ??
			(message as IncomingDirectMessage & { e2ee_algorithm?: unknown }).e2ee_algorithm,

		e2ee_content_hash:
			metadata.e2ee_content_hash ??
			(
				message as IncomingDirectMessage & {
					e2ee_content_hash?: unknown
				}
			).e2ee_content_hash,
	}
}

export type DirectMessageEnvelopeKind = "encrypted" | "plain" | "malformed-encrypted"

export function classifyDirectMessageEnvelope(message: unknown): DirectMessageEnvelopeKind {
	if (!message || typeof message !== "object") {
		return "malformed-encrypted"
	}

	const candidate = message as Record<string, unknown>

	const metadata =
		candidate.metadata && typeof candidate.metadata === "object"
			? (candidate.metadata as Record<string, unknown>)
			: null

	/*
	 * Any cryptographic indicator means this is intended to be an
	 * encrypted envelope. Never downgrade it to plaintext merely because
	 * part of the envelope is missing.
	 */
	if (!hasAnyE2EEIndicator(candidate)) {
		return "plain"
	}

	const version = metadata?.e2ee_version ?? candidate.e2ee_version

	const algorithm = metadata?.e2ee_algorithm ?? candidate.e2ee_algorithm

	const encrypted =
		(metadata?.e2ee === true || candidate.e2ee === true) &&
		version === E2EE_MESSAGE_VERSION &&
		algorithm === E2EE_MESSAGE_ALGORITHM_V1

	if (encrypted) {
		return "encrypted"
	}

	return "malformed-encrypted"
}

export async function decryptDirectMessageEnvelope({
	accountId,
	senderPkid,
	message,
	recipientIdentity,
}: DecryptDirectMessageEnvelopeParams): Promise<Message | null> {
	const kind = classifyDirectMessageEnvelope(message)

	if (kind === "plain") {
		return message as Message
	}

	if (kind === "malformed-encrypted") {
		return null
	}

	const metadata = getE2EEEnvelopeMetadata(message)

	if (metadata.e2ee !== true) return null
	if (metadata.e2ee_version !== E2EE_MESSAGE_VERSION) return null
	if (metadata.e2ee_algorithm !== E2EE_MESSAGE_ALGORITHM_V1) return null
	if (typeof metadata.e2ee_content_hash !== "string") return null
	if (typeof message.content !== "string") return null
	if (typeof message.nonce !== "string") return null
	if (typeof message.sender_ephemeral_key !== "string") return null

	try {
		const senderPublicKey = base64ToBytesOfLength(
			message.sender_ephemeral_key,
			BOX_PUBLIC_KEY_LENGTH,
		)

		const nonce = base64ToBytesOfLength(message.nonce, BOX_NONCE_LENGTH)

		const ciphertext = base64ToBytes(message.content)

		if (ciphertext.length < 16) return null

		const actualHash = await computeContentHash({
			ciphertext: message.content,
			nonce: message.nonce,
			senderPublicKey: message.sender_ephemeral_key,
		})

		if (actualHash.toLowerCase() !== metadata.e2ee_content_hash.toLowerCase()) {
			return null
		}

		const resolvedSenderPkid = senderPkid ?? resolveSenderPkid(message)

		if (!resolvedSenderPkid) return null

		const identity =
			recipientIdentity ?? (await getIdentity(accountId)) ?? e2eeRuntime.getState()?.identity

		if (!identity) return null

		const trusted = await getTrustedKey(accountId, resolvedSenderPkid)

		if (trusted && !constantTimeEqual(trusted.publicKey, senderPublicKey)) {
			return null
		}

		if (!trusted) {
			const pinResult = await pinIfAbsent(accountId, resolvedSenderPkid, senderPublicKey)

			if (
				!pinResult.pinned &&
				pinResult.existing &&
				!constantTimeEqual(pinResult.existing.publicKey, senderPublicKey)
			) {
				return null
			}
		}

		const opened = boxOpen({
			ciphertext,
			nonce,
			peerPublicKey: senderPublicKey,
			ownSecretKey: identity.privateKey,
		})

		if (opened === null) return null

		return {
			...message,
			content: bytesToUtf8(opened),
		} as Message
	} catch {
		return null
	}
}

export async function decryptDirectMessageHistoryPage<T extends CursorPage<Message>>(
	accountId: Pkid,
	page: T,
): Promise<T> {
	const identity = await getIdentity(accountId)
	const results: Message[] = []

	for (const message of page.results) {
		const senderPkid = resolveSenderPkid(message)

		/* Messages sent by the current account cannot be decrypted from
		 * the server ciphertext. They were encrypted with:
		 *   our private key + recipient public key
		 * so our own private key alone cannot open them.
		 *
		 * Restore the display plaintext from the account-scoped local
		 * encrypted copy instead. */
		if (identity && senderPkid === accountId) {
			const localCopy = await getLocalMessageCopy(accountId, message.id)

			if (localCopy) {
				/* Verify that the local plaintext belongs to the exact
				 * server envelope currently being displayed. */
				const envelopeHash = getMessageEnvelopeHash(message)

				if (envelopeHash && envelopeHash === localCopy.envelopeHash) {
					results.push({ ...message, content: localCopy.plaintext })
					continue
				}
			}

			/* We know this is an encrypted message belonging to us, but
			 * there is no matching local copy. Never expose ciphertext. */
			const kind = classifyDirectMessageEnvelope(message)

			if (kind === "encrypted" || kind === "malformed-encrypted") {
				results.push({ ...message, content: E2EE_FAILURE_CONTENT })
				continue
			}
		}

		results.push(await normalizeDirectMessage({ accountId, senderPkid, message }))
	}

	return {
		...page,
		results,
	} as T
}

export interface NormalizeDirectMessageParams {
	accountId: Pkid
	message: IncomingDirectMessage
	senderPkid?: Pkid | null
}

export async function normalizeDirectMessage({
	accountId,
	message,
	senderPkid,
}: NormalizeDirectMessageParams): Promise<Message> {
	const kind = classifyDirectMessageEnvelope(message)

	if (kind === "plain") {
		return message as Message
	}

	if (kind === "malformed-encrypted") {
		return {
			...message,
			content: E2EE_UNSUPPORTED_CONTENT,
		}
	}

	const decrypted = await decryptDirectMessageEnvelope({
		accountId,
		senderPkid,
		message,
	})

	if (!decrypted) {
		return {
			...message,
			content: E2EE_FAILURE_CONTENT,
		}
	}

	return decrypted
}
