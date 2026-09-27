/**
 * Web Messenger E2EE v1.
 *
 * Layers built so far:
 *   - Crypto primitives (E0.1): IO-free, protocol-correct building blocks —
 *     encoding, random, NaCl box/secretbox, PBKDF2/SHA-256, content hash.
 *   - Identity & trust foundation (E0.2): account-scoped persistence for a
 *     restored identity and pinned recipient keys (`identity-store.ts`,
 *     `trust-store.ts`, backed by `storage/`), plus the in-memory
 *     `e2eeRuntime` singleton that holds the ACTIVE account's identity/trust
 *     for use by runtime crypto operations.
 *
 * Still to come: backup validation (E1) · PIN recovery (E2) · send (E3) ·
 * receive (E4) · previews / local copies (E5).
 *
 * Rules (e2ee_implementation_brief.md §18):
 *  - `tweetnacl` is imported ONLY by ./nacl.ts.
 *  - No React, TanStack Query or transport imports under this folder. The
 *    one exception is `@/types/messenger` for the `Pkid` brand — it is a
 *    type-only, dependency-free import.
 *  - Errors carry fixed messages and never echo keys, plaintext or
 *    ciphertext (account/recipient ids, being non-secret, are fine).
 *  - Nothing here subscribes to `useAuthStore` or any other app store —
 *    reacting to login/logout/account-switch is a React concern, owned by
 *    `components/messenger/messenger-e2ee-bootstrap.tsx`.
 */

export { recoverIdentityFromBackup } from "./backup-recovery"
export {
	classifyBackup,
	type BackupClassification,
	type ValidatedBackupV1,
} from "./backup-validation"
export {
	BACKUP_CIPHERTEXT_LENGTH,
	BACKUP_ENCRYPTION_ALGORITHM,
	BACKUP_KDF_ALGORITHM,
	BACKUP_KDF_MAX_ITERATIONS,
	BACKUP_KDF_MIN_ITERATIONS,
	BACKUP_KDF_PRF,
	BACKUP_KDF_SALT_LENGTH,
	BOX_NONCE_LENGTH,
	BOX_OVERHEAD_LENGTH,
	BOX_PUBLIC_KEY_LENGTH,
	BOX_SECRET_KEY_LENGTH,
	E2EE_MESSAGE_ALGORITHM_V1,
	E2EE_MESSAGE_VERSION,
	KDF_OUTPUT_LENGTH,
	SECRETBOX_KEY_LENGTH,
	SECRETBOX_NONCE_LENGTH,
	SECRETBOX_OVERHEAD_LENGTH,
	SHA256_DIGEST_LENGTH,
} from "./constants"
export { buildContentHashInput, computeContentHash, type ContentHashInput } from "./content-hash"
export {
	decryptDirectMessageEnvelope,
	decryptDirectMessageHistoryPage,
	prepareDirectMessageEnvelope,
	prepareDirectMessageSendPayload,
	type DecryptDirectMessageEnvelopeParams,
	type DirectMessageEncryptionBundle,
	type DirectMessageEnvelope,
	type IncomingDirectMessage,
	type PrepareDirectMessageEnvelopeParams,
	type PrepareDirectMessageSendPayloadParams,
} from "./direct-message"
export {
	base64ToBytes,
	base64ToBytesOfLength,
	bytesToBase64,
	bytesToHex,
	bytesToUtf8,
	utf8ToBytes,
} from "./encoding"
export { E2eeCryptoError, type E2eeCryptoErrorCode } from "./errors"
export {
	getIdentity,
	listIdentityAccountIds,
	removeIdentity,
	saveIdentity,
	type StoredIdentity,
} from "./identity-store"
export {
	boxOpen,
	boxPublicKeyFromSecretKey,
	boxSeal,
	constantTimeEqual,
	secretboxOpen,
	secretboxSeal,
	type BoxOpenParams,
	type BoxSealParams,
	type SecretboxOpenParams,
	type SecretboxSealParams,
} from "./nacl"
export { generateNonce, randomBytes } from "./random"
export {
	e2eeRuntime,
	E2eeRuntimeError,
	type E2eeRuntimeErrorCode,
	type E2eeRuntimeState,
} from "./runtime"
export { E2eeStorageError, type E2eeStorageErrorCode } from "./storage/errors"
export { isIndexedDbAvailable } from "./storage/indexeddb"
export {
	getTrustedKey,
	listTrustedKeys,
	pinIfAbsent,
	removeAllTrustedKeys,
	removeTrustedKey,
	saveTrustedKey,
	type PinIfAbsentResult,
	type StoredTrustedKey,
} from "./trust-store"
export { pbkdf2HmacSha256, sha256, sha256Hex, type Pbkdf2Params } from "./webcrypto"
