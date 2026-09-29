import type { MessageType, Pkid } from "@/types/messenger"
import { BOX_SECRET_KEY_LENGTH } from "./constants"
import { bytesToUtf8, utf8ToBytes } from "./encoding"
import { getIdentity } from "./identity-store"
import { secretboxOpen, secretboxSeal } from "./nacl"
import { generateNonce } from "./random"
import {
	LOCAL_MESSAGE_COPIES_BY_ACCOUNT_PEER_INDEX,
	LOCAL_MESSAGE_COPIES_STORE,
	getE2eeDatabase,
	type StoredLocalMessageCopyRow,
} from "./storage/database"
import { promisifyRequest, promisifyTransaction } from "./storage/indexeddb"

export interface LocalMessageCopy {
	accountId: Pkid
	messageId: number
	peerId: Pkid
	envelopeHash: string
	plaintext: string
	messageType: MessageType
	createdAt: number
	updatedAt: number
}

function assertIdentityKey(identity: Awaited<ReturnType<typeof getIdentity>>): Uint8Array {
	if (!identity || identity.privateKey.length !== BOX_SECRET_KEY_LENGTH) {
		throw new Error("E2EE identity unavailable")
	}

	return identity.privateKey
}

export async function saveLocalMessageCopy(params: {
	accountId: Pkid
	messageId: number
	peerId: Pkid
	envelopeHash: string
	plaintext: string
	messageType: MessageType
	createdAt: string
}): Promise<void> {
	const identity = await getIdentity(params.accountId)
	const key = assertIdentityKey(identity)

	const nonce = generateNonce()
	const ciphertext = secretboxSeal({
		plaintext: utf8ToBytes(params.plaintext),
		nonce,
		key,
	})

	const db = await getE2eeDatabase()
	const tx = db.transaction(LOCAL_MESSAGE_COPIES_STORE, "readwrite")

	tx.objectStore(LOCAL_MESSAGE_COPIES_STORE).put({
		accountId: params.accountId,
		messageId: params.messageId,
		peerId: params.peerId,
		envelopeHash: params.envelopeHash,
		ciphertext,
		nonce,
		messageType: params.messageType,
		createdAt: new Date(params.createdAt).getTime(),
		updatedAt: Date.now(),
	} satisfies StoredLocalMessageCopyRow)

	await promisifyTransaction(tx)
}

export async function getLocalMessageCopy(
	accountId: Pkid,
	messageId: number,
): Promise<LocalMessageCopy | null> {
	const identity = await getIdentity(accountId)
	if (!identity) return null

	const db = await getE2eeDatabase()
	const tx = db.transaction(LOCAL_MESSAGE_COPIES_STORE, "readonly")

	const row = await promisifyRequest<StoredLocalMessageCopyRow | undefined>(
		tx.objectStore(LOCAL_MESSAGE_COPIES_STORE).get([accountId, messageId]),
	)

	if (!row) return null

	const opened = secretboxOpen({
		ciphertext: row.ciphertext,
		nonce: row.nonce,
		key: identity.privateKey,
	})

	if (!opened) return null

	return {
		accountId: accountId,
		messageId: row.messageId,
		peerId: row.peerId as Pkid,
		envelopeHash: row.envelopeHash,
		plaintext: bytesToUtf8(opened),
		messageType: row.messageType as MessageType,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	}
}

export async function getLatestLocalMessageCopy(
	accountId: Pkid,
	peerId: Pkid,
): Promise<LocalMessageCopy | null> {
	const identity = await getIdentity(accountId)
	if (!identity) return null

	const db = await getE2eeDatabase()
	const tx = db.transaction(LOCAL_MESSAGE_COPIES_STORE, "readonly")

	const rows = await promisifyRequest<StoredLocalMessageCopyRow[]>(
		tx
			.objectStore(LOCAL_MESSAGE_COPIES_STORE)
			.index(LOCAL_MESSAGE_COPIES_BY_ACCOUNT_PEER_INDEX)
			.getAll([accountId, peerId]),
	)

	if (rows.length === 0) return null

	rows.sort((a, b) => b.createdAt - a.createdAt)
	const row = rows[0]

	const opened = secretboxOpen({
		ciphertext: row.ciphertext,
		nonce: row.nonce,
		key: identity.privateKey,
	})

	if (!opened) return null

	return {
		accountId,
		messageId: row.messageId,
		peerId: row.peerId as Pkid,
		envelopeHash: row.envelopeHash,
		plaintext: bytesToUtf8(opened),
		messageType: row.messageType as MessageType,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	}
}

export async function removeLocalMessageCopies(accountId: Pkid): Promise<void> {
	const db = await getE2eeDatabase()
	const tx = db.transaction(LOCAL_MESSAGE_COPIES_STORE, "readwrite")

	const index = tx
		.objectStore(LOCAL_MESSAGE_COPIES_STORE)
		.index(LOCAL_MESSAGE_COPIES_BY_ACCOUNT_PEER_INDEX)

	await new Promise<void>((resolve, reject) => {
		const request = index.openCursor(
			IDBKeyRange.bound([accountId, -Infinity], [accountId, Infinity]),
		)

		request.onsuccess = () => {
			const cursor = request.result

			if (!cursor) {
				resolve()
				return
			}

			cursor.delete()
			cursor.continue()
		}

		request.onerror = () => reject(request.error)
	})

	await promisifyTransaction(tx)
}
