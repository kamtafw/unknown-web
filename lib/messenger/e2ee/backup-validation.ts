/**
 * E1 — strict validation of the mobile-created E2EE key backup.
 *
 * This module answers exactly one question, and only from an already-parsed
 * JSON value (no HTTP here — see `backup-retrieval.ts` for the fetch):
 *
 *   "Is this a supported, valid v1 backup that E2 can safely attempt PIN
 *    recovery against?"
 *
 * It never answers "can this PIN recover the identity?" — that is entirely
 * E2's job (PBKDF2 derive → secretbox.open → compare public key → install).
 * Nothing here touches a PIN, derives a key, or decrypts anything.
 *
 * Every check is against the RAW, UNTRUSTED wire value — `classifyBackup`
 * takes `unknown`, not a backup interface, precisely so nothing upstream can
 * skip validation by asserting a type onto an HTTP response. See
 * `lib/messenger/api.ts`'s `backupApi` for the same discipline at the
 * transport boundary.
 *
 * Field table and required values: E2EE-KEY-BACKUP-WEB-IMPLEMENTATION-1.md
 * §2.1. "Permit `updated_at`; reject other unknown top-level or KDF fields,
 * Base64URL, malformed Base64, unsupported values, and incorrect decoded
 * lengths before key derivation."
 *
 * Two distinct failure classifications are used, not one generic "invalid":
 *
 *  - `unsupported` — the field is present with the RIGHT TYPE but a
 *    RECOGNIZABLE, DIFFERENT value (e.g. `kdf.algorithm: "argon2id"`, the
 *    guide's own named legacy-format example, §2.2). This is a real backup,
 *    just not one this Web build's v1 validator handles — the eventual
 *    remedy is "update the backup on your original device," never a PIN
 *    prompt, and never reported as an incorrect PIN.
 *  - `malformed` — the field is missing, has the wrong type, is not valid
 *    strict standard Base64, decodes to the wrong byte length, iterations
 *    are out of range, or an unrecognized field is present. This is
 *    corrupt/invalid data, not a recognizable different backup variant.
 *
 * This distinction matters for whatever UI consumes `BackupClassification`
 * later: "unsupported" has a specified remedy (guide §2.2); "malformed" does
 * not (neither source document describes a backend that issues broken v1
 * backups) — that gap is deliberately preserved here rather than papered
 * over with an invented UI treatment.
 */

import {
	BACKUP_CIPHERTEXT_LENGTH,
	BACKUP_ENCRYPTION_ALGORITHM,
	BACKUP_FORMAT_VERSION,
	BACKUP_KDF_ALGORITHM,
	BACKUP_KDF_MAX_ITERATIONS,
	BACKUP_KDF_MIN_ITERATIONS,
	BACKUP_KDF_PRF,
	BACKUP_KDF_SALT_LENGTH,
	BACKUP_RECOVERY_METHOD,
	BOX_PUBLIC_KEY_LENGTH,
	KDF_OUTPUT_LENGTH,
	SECRETBOX_NONCE_LENGTH,
} from "./constants"
import { base64ToBytesOfLength } from "./encoding"

/** The strictly validated, DECODED v1 backup — exactly what E2's recovery
 * flow needs and nothing else. The now-confirmed-constant discriminator
 * fields (`format_version`, `recovery_method`, `encryption_algorithm`,
 * `kdf.algorithm`, `kdf.prf`, `kdf.output_length`) are deliberately not
 * carried forward: having passed validation, they can only be the one legal
 * value E0.1's constants already define. */
export interface ValidatedBackupV1 {
	identityPublicKey: Uint8Array
	ciphertext: Uint8Array
	nonce: Uint8Array
	kdf: {
		salt: Uint8Array
		iterations: number
	}
}

export type BackupClassification =
	| { status: "valid"; backup: ValidatedBackupV1 }
	| { status: "unsupported"; reason: string }
	| { status: "malformed"; reason: string }

const KNOWN_TOP_LEVEL_FIELDS = new Set([
	"format_version",
	"recovery_method",
	"encryption_algorithm",
	"identity_public_key",
	"ciphertext",
	"nonce",
	"kdf",
	"updated_at", // permitted response metadata (guide §2.1) — not otherwise used here
])

const KNOWN_KDF_FIELDS = new Set(["algorithm", "prf", "salt", "iterations", "output_length"])

/** Internal control-flow signal only — never leaves this module. Lets the
 * many sequential checks below `fail()` out of the validation function in
 * one place instead of threading a Result through 11 nested conditionals. */
class ClassificationSignal {
	constructor(readonly result: BackupClassification) {}
}

function fail(status: "malformed" | "unsupported", reason: string): never {
	throw new ClassificationSignal({ status, reason })
}

/** A "which variant of the protocol is this" field: present, correctly
 * typed, but a value other than the one this validator accepts →
 * `unsupported` (a real, different-variant backup). Missing or wrong
 * type entirely → `malformed` (not a recognizable variant signal at all). */
function checkDiscriminator(
	value: unknown,
	fieldName: string,
	expectedType: "string" | "number",
	expectedValue: string | number,
): void {
	if (typeof value !== expectedType) {
		fail("malformed", `"${fieldName}" must be a ${expectedType}`)
	}
	if (value !== expectedValue) {
		fail(
			"unsupported",
			`"${fieldName}" is ${JSON.stringify(value)}, expected ${JSON.stringify(expectedValue)}`,
		)
	}
}

/** A data-integrity field (key/ciphertext/nonce/salt material): wrong type,
 * invalid Base64, or the wrong decoded length is always `malformed` — this
 * is corrupt data, not a different protocol variant. */
function decodeField(value: unknown, fieldName: string, expectedLength: number): Uint8Array {
	if (typeof value !== "string") {
		fail("malformed", `"${fieldName}" must be a Base64 string`)
	}
	try {
		return base64ToBytesOfLength(value, expectedLength)
	} catch {
		fail("malformed", `"${fieldName}" is not valid standard Base64 of ${expectedLength} bytes`)
	}
}

/** Also always `malformed`, for the same reason as `decodeField`: an
 * iteration count is a range/integrity constraint on an already-confirmed
 * `pbkdf2` backup, not a signal that this is some other backup variant. */
function checkIterations(value: unknown): number {
	if (typeof value !== "number" || !Number.isInteger(value)) {
		fail("malformed", `"kdf.iterations" must be an integer`)
	}
	if (value < BACKUP_KDF_MIN_ITERATIONS || value > BACKUP_KDF_MAX_ITERATIONS) {
		fail(
			"malformed",
			`"kdf.iterations" (${value}) is outside the supported range ` +
				`${BACKUP_KDF_MIN_ITERATIONS}-${BACKUP_KDF_MAX_ITERATIONS}`,
		)
	}
	return value
}

function rejectUnknownFields(obj: Record<string, unknown>, known: Set<string>, where: string): void {
	for (const key of Object.keys(obj)) {
		if (!known.has(key)) fail("malformed", `Unexpected field "${key}" in ${where}`)
	}
}

function asPlainObject(value: unknown, what: string): Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		fail("malformed", `${what} must be a JSON object`)
	}
	return value as Record<string, unknown>
}

function classifyBackupOrThrow(raw: unknown): BackupClassification {
	const backup = asPlainObject(raw, "Backup response")
	rejectUnknownFields(backup, KNOWN_TOP_LEVEL_FIELDS, "the backup response")

	checkDiscriminator(backup.format_version, "format_version", "number", BACKUP_FORMAT_VERSION)
	checkDiscriminator(backup.recovery_method, "recovery_method", "string", BACKUP_RECOVERY_METHOD)
	checkDiscriminator(
		backup.encryption_algorithm,
		"encryption_algorithm",
		"string",
		BACKUP_ENCRYPTION_ALGORITHM,
	)

	const identityPublicKey = decodeField(
		backup.identity_public_key,
		"identity_public_key",
		BOX_PUBLIC_KEY_LENGTH,
	)
	const ciphertext = decodeField(backup.ciphertext, "ciphertext", BACKUP_CIPHERTEXT_LENGTH)
	const nonce = decodeField(backup.nonce, "nonce", SECRETBOX_NONCE_LENGTH)

	const kdf = asPlainObject(backup.kdf, "kdf")
	rejectUnknownFields(kdf, KNOWN_KDF_FIELDS, "kdf")

	checkDiscriminator(kdf.algorithm, "kdf.algorithm", "string", BACKUP_KDF_ALGORITHM)
	checkDiscriminator(kdf.prf, "kdf.prf", "string", BACKUP_KDF_PRF)
	const salt = decodeField(kdf.salt, "kdf.salt", BACKUP_KDF_SALT_LENGTH)
	const iterations = checkIterations(kdf.iterations)
	checkDiscriminator(kdf.output_length, "kdf.output_length", "number", KDF_OUTPUT_LENGTH)

	return {
		status: "valid",
		backup: { identityPublicKey, ciphertext, nonce, kdf: { salt, iterations } },
	}
}

/**
 * Pure, synchronous, IO-free. Never throws for ordinary invalid input —
 * every rejection is a `ClassificationSignal` caught here and returned as
 * data. A genuinely unexpected exception (a bug in this module, not a bad
 * backup) is deliberately NOT swallowed into a false "malformed" result.
 */
export function classifyBackup(raw: unknown): BackupClassification {
	try {
		return classifyBackupOrThrow(raw)
	} catch (err) {
		if (err instanceof ClassificationSignal) return err.result
		throw err
	}
}