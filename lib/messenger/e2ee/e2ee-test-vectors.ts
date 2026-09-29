/**
 * Known-answer vectors for the E2EE primitives. TEST-ONLY: not exported from
 * `index.ts` and never imported by application code.
 *
 * Provenance: generated with PyNaCl 1.6.2 (libsodium) and Python `hashlib`
 * (OpenSSL) — implementations independent of tweetnacl and of Web Crypto — so
 * these tests check cross-implementation agreement, not self-consistency.
 * PBKDF2/SHA-256 reference values also match RFC 7914 / NIST.
 *
 * These are NOT vectors produced by the mobile client. When mobile fixtures
 * exist (a known-PIN backup, a v1 envelope with its keys) they should be added
 * as a separate suite alongside these.
 *
 * Recipe (secret keys are SHA-256 of a label so they are reproducible):
 *   sk = sha256(b"appscombo e2ee test vector: alice")
 *   Box(PrivateKey(sk_alice), PrivateKey(sk_bob).public_key).encrypt(msg, nonce).ciphertext
 *   SecretBox(key).encrypt(msg, nonce).ciphertext
 *   hashlib.pbkdf2_hmac("sha256", pin, salt, 600000, 32)
 */

export function hexToBytes(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) throw new Error("odd-length hex in test vector")
	const out = new Uint8Array(hex.length / 2)
	for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
	return out
}

export const BOX_VECTOR = {
	aliceSecretKey: hexToBytes("f4ab020a21326ade0cc6b5485cd4a89427c5d90c9ce72063e7fb10c74378a8b3"),
	alicePublicKey: hexToBytes("4a199faad433f2597f87654e78e1eab020da9b06321d521eb0ca79a1a4999470"),
	bobSecretKey: hexToBytes("aa459e8dd701af1ee97f2c693e57042a08b5a07810f011ec9b417f9c609c7abe"),
	bobPublicKey: hexToBytes("a1ca65e1d479de246de3cb2945f695ba225a974ba82dcc70ce1014b1fe3d711d"),
	nonce: hexToBytes("000102030405060708090a0b0c0d0e0f1011121314151617"),
	/** Contains 2-byte (é) and 4-byte (👋) UTF-8 sequences. */
	plaintext: "Hello, Bob! héllo 👋",
	/** alice → bob. */
	ciphertext: hexToBytes(
		"2a828be82c2b7217ca7fdcc4669acad84b41d41f30e64220d5e053ce2ea72b1e67ac4e5089dff8",
	),
	/** Same keys/nonce, empty plaintext: authenticator only. */
	emptyCiphertext: hexToBytes("8759e11bda56882d44928b1bfe7b8f4c"),
} as const

export const SECRETBOX_VECTOR = {
	key: hexToBytes("12b45ca4021fa9ce855a0f69cd721d029fd35cce1275008daee05fd2efa96f00"),
	nonce: hexToBytes("6465666768696a6b6c6d6e6f707172737475767778797a7b"),
	plaintext: hexToBytes("736563726574626f7820766563746f7220000102ff"),
	ciphertext: hexToBytes(
		"ead0944470f36169c40071824d661a2156decd37dbacaa58151599ee4e0211f5d62f571c91",
	),
} as const

export const PBKDF2_VECTORS = [
	{
		password: "password",
		salt: "salt",
		iterations: 1,
		output: "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b",
	},
	{
		password: "password",
		salt: "salt",
		iterations: 2,
		output: "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43",
	},
	{
		password: "password",
		salt: "salt",
		iterations: 4096,
		output: "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a",
	},
	{
		password: "passwordPASSWORDpassword",
		salt: "saltSALTsaltSALTsaltSALTsaltSALTsalt",
		iterations: 4096,
		output: "348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1",
	},
] as const

export const SHA256_VECTORS = [
	{ input: "", output: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
	{ input: "abc", output: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" },
	{
		input: "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
		output: "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
	},
] as const

/** One million bytes of "a" (NIST long-message vector). */
export const SHA256_MILLION_A = "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"

/**
 * A backup-shaped fixture: a 32-byte identity secret key wrapped with a
 * PBKDF2-derived key (PIN "123456", 600 000 iterations) using secretbox.
 * Matches the field sizes in E2EE-KEY-BACKUP-WEB-IMPLEMENTATION-1.md §2.1
 * (16-byte salt, 24-byte nonce, 48-byte ciphertext, 32-byte public key).
 */
export const BACKUP_VECTOR = {
	pin: "123456",
	iterations: 600_000,
	saltBase64: "oKGio6SlpqeoqaqrrK2urw==",
	nonceBase64: "MDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZH",
	ciphertextBase64: "vYj07zT6ZPAHlOw62udUM2GWTDJuaa+hOASAGFlDVTL6mKy+1VGKXjgHWPHC6xva",
	identityPublicKeyBase64: "5WrewRIR+vLExfdgrrdqy+ugoyVPufTnImrAKQv/p2c=",
	/** What a correct recovery must yield. */
	identitySecretKeyHex: "cc002212e5b454a0991ad5cc967fd64cf9a84c4ef221e39dd3a6cd3841cb0298",
	/** PBKDF2 output for the PIN/salt/iterations above (hashlib, OpenSSL). */
	wrappingKeyHex: "499fc178115096ec6047e1ddd7fa7c4443137ace61df743ea65125b2df24e644",
} as const

/**
 * Envelope fields for BOX_VECTOR (alice → bob) as they would appear on the
 * wire, plus the canonical string and hash (Python hashlib).
 */
export const CONTENT_HASH_VECTORS = {
	envelope: {
		ciphertext: "KoKL6CwrchfKf9zEZprK2EtB1B8w5kIg1eBTzi6nKx5nrE5Qid/4",
		nonce: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYX",
		senderPublicKey: "ShmfqtQz8ll/h2VOeOHqsCDamwYyHVIesMp5oaSZlHA=",
	},
	envelopeCanonical:
		"52:KoKL6CwrchfKf9zEZprK2EtB1B8w5kIg1eBTzi6nKx5nrE5Qid/4|32:AAECAwQFBgcICQoLDA0ODxAREhMUFRYX|44:ShmfqtQz8ll/h2VOeOHqsCDamwYyHVIesMp5oaSZlHA=",
	envelopeHash: "7c3c5a6b0d1ab35a4f692911c70520c149b48bd4bde5dca4f45217e254598685",
	short: {
		input: { ciphertext: "abc", nonce: "de", senderPublicKey: "f" },
		canonical: "3:abc|2:de|1:f",
		hash: "1036171c3f81967fee97dcf55d6c0d9f94608bc95cb69f7d62656aab30740026",
	},
	empty: {
		input: { ciphertext: "", nonce: "", senderPublicKey: "" },
		canonical: "0:|0:|0:",
		hash: "d8af24817ca0b1209872cfe65053804736521a7a9fc00d9a2bf46f338051fc8a",
	},
} as const

/** Public keys whose X25519 output is all zero (small-subgroup points). */
export const LOW_ORDER_PUBLIC_KEYS = {
	zero: "00".repeat(32),
	one: "01" + "00".repeat(31),
	order8A: "e0eb7a7c3b41b8ae1656e3faf19fc46ada098deb9c32b1fd866205165f49b800",
	order8B: "5f9c95bca3508c24b1d0b1559c83ef5b04445cc4581c8e86d8224eddd09f1157",
	pMinusOne: "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
	p: "edffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
} as const
