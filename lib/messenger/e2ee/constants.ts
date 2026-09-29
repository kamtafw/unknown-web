/**
 * Web Messenger E2EE v1 — algorithm identifiers and byte-length constants.
 *
 * Single source of truth for every protocol literal the crypto layer and
 * (later) the backup / envelope validators compare against. Lengths are
 * RAW BYTE lengths, never Base64 string lengths.
 *
 * Sources: e2ee_implementation_brief.md §4, §6–8 and
 * E2EE-KEY-BACKUP-WEB-IMPLEMENTATION-1.md §2.1, §4.1.
 *
 * The KDF iteration bounds are DEFINED here but deliberately NOT enforced by
 * the PBKDF2 primitive — range validation of a downloaded backup belongs to
 * the backup validator (E1). The primitive stays usable with small counts for
 * tests.
 */

// --- Direct-message envelope (v1) -------------------------------------------

export const E2EE_MESSAGE_VERSION = 1 as const
export const E2EE_MESSAGE_ALGORITHM_V1 = "nacl_box_curve25519xsalsa20poly1305" as const

// --- Key-backup protocol (v1) -----------------------------------------------

export const BACKUP_FORMAT_VERSION = 1 as const
export const BACKUP_RECOVERY_METHOD = "six_digit_pin" as const
export const BACKUP_ENCRYPTION_ALGORITHM = "nacl_secretbox_xsalsa20poly1305" as const
export const BACKUP_KDF_ALGORITHM = "pbkdf2" as const
export const BACKUP_KDF_PRF = "hmac_sha256" as const
export const BACKUP_KDF_MIN_ITERATIONS = 600_000
export const BACKUP_KDF_MAX_ITERATIONS = 2_000_000

// --- NaCl box (Curve25519-XSalsa20-Poly1305) --------------------------------

export const BOX_PUBLIC_KEY_LENGTH = 32
export const BOX_SECRET_KEY_LENGTH = 32
/** Fresh random nonce per encryption. Never reuse for a different encryption. */
export const BOX_NONCE_LENGTH = 24
/** Poly1305 authenticator prepended by NaCl: ciphertext = plaintext + 16. */
export const BOX_OVERHEAD_LENGTH = 16

// --- NaCl secretbox (XSalsa20-Poly1305) -------------------------------------

export const SECRETBOX_KEY_LENGTH = 32
export const SECRETBOX_NONCE_LENGTH = 24
export const SECRETBOX_OVERHEAD_LENGTH = 16

// --- Backup field sizes -----------------------------------------------------

export const BACKUP_KDF_SALT_LENGTH = 16
/** 32-byte private key + 16-byte authenticator. */
export const BACKUP_CIPHERTEXT_LENGTH = BOX_SECRET_KEY_LENGTH + SECRETBOX_OVERHEAD_LENGTH

// --- Hash / KDF outputs -----------------------------------------------------

/** PBKDF2 output: the 256-bit secretbox wrapping key. */
export const KDF_OUTPUT_LENGTH = 32
export const SHA256_DIGEST_LENGTH = 32
