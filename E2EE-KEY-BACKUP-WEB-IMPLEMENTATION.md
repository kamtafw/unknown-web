# AppsCombo Web: E2EE Key-Backup Boundary and Compatibility Guide

**Decision:** Mobile creates account identities and backups. Web may retrieve and restore those existing keys.

## 1. Required web behavior

Web is a **restore-only client** for key backup. It may:

- call `GET /api/v1/chats/users/key-backup`;
- ask for the six-digit recovery PIN and use it locally;
- decrypt and verify a mobile-created backup;
- install the recovered existing identity in approved account-scoped browser storage;
- use the restored identity to encrypt and decrypt compatible direct messages.

Web must not:

- generate a new account identity;
- call `PUT` or `DELETE` on the key-backup endpoint;
- upload, create, replace, rotate, or delete an identity or backup;
- send the PIN, private key, or PBKDF2-derived key to the server;
- expose backup creation, PIN-change, replacement, rotation, or deletion controls.

Only iOS and Android may create account keys and upload or manage their backups.

This is an **encryption identity-key backup**, not a complete chat-history backup. Option C independent-device identities, prekeys, ratchets, device revocation, and group E2EE are deferred.

## 2. Retrieve and restore a mobile-created backup

Retrieve the authenticated user's backup:

```http
GET /api/v1/chats/users/key-backup  
Authorization: Bearer <token>
```

The backend wraps successful responses. With Axios, read `response.data.data` as the backup; `response.data` is the API envelope, not the backup:

```json
{  
"success": true,  
"status_code": 200,  
"message": null,  
"data": {  
"format_version": 1,  
"recovery_method": "six_digit_pin",  
"identity_public_key": "<standard Base64>",  
"encryption_algorithm": "nacl_secretbox_xsalsa20poly1305",  
"ciphertext": "<standard Base64>",  
"nonce": "<standard Base64>",  
"kdf": {  
"algorithm": "pbkdf2",  
"prf": "hmac_sha256",  
"salt": "<standard Base64>",  
"iterations": 600000,  
"output_length": 32  
},  
"updated_at": "<ISO 8601 timestamp>"  
}  
}
```

- `200`: require a backup object inside the envelope's `data` field, then classify and validate that object before offering PIN recovery. Only the current PBKDF2 format is supported. A missing or malformed `data` field is an API error, not evidence of an older backup format.
- `404`: direct the user to mobile to create the account identity and backup.
- Timeout, network error, `401`, or `5xx`: preserve state, offer retry, and never generate a replacement identity.

Fetch fresh data when the user selects **Check for updated backup**. Do not persist the response in query caches, Redux persistence, service-worker caches, logs, analytics, or error reports.

When the user opens Messenger without a local account identity, show recovery inline in a dialog rather than a toast directing them to settings. Block encrypted messaging until recovery succeeds or the user leaves Messenger. Missing backups direct users to mobile enrollment; errors preserve state and offer retry.

### 2.1 Restore validation

Require the version-1 fixed values and decoded byte lengths:


| Field                  | Required value                                    |
|------------------------|---------------------------------------------------|
| `format_version`       | `1`                                               |
| `recovery_method`      | `six_digit_pin`                                   |
| `encryption_algorithm` | `nacl_secretbox_xsalsa20poly1305`                 |
| `identity_public_key`  | Standard Base64; 32 decoded bytes                 |
| `ciphertext`           | Standard Base64; 48 decoded bytes                 |
| `nonce`                | Standard Base64; 24 decoded bytes                 |
| `kdf.algorithm`        | `pbkdf2`                                          |
| `kdf.prf`              | `hmac_sha256`                                     |
| `kdf.salt`             | Standard Base64; 16 decoded bytes                 |
| `kdf.iterations`       | Integer from `600000` through `2000000` inclusive |
| `kdf.output_length`    | `32`                                              |


The GET envelope's `data` field contains the normative backup object plus the optional `updated_at` timestamp. Permit that response metadata inside `data`; reject other unknown backup or KDF fields, Base64URL, malformed Base64, unsupported values, and incorrect decoded lengths before key derivation. All decoded lengths apply to raw bytes, not Base64 string lengths. Use the downloaded iteration count, not a hard-coded restore default.

### 2.2 Legacy and unsupported backups

An earlier development version created backups with `kdf.algorithm: "argon2id"`. Match the current mobile compatibility policy: do not attempt Argon2id recovery or request a PIN for legacy or unsupported backups. Do not report this as an incorrect PIN.

Show **Update the backup on your original device**, with these instructions:

1. On an original mobile device that still holds the matching private identity key, open Messenger settings → Encryption key backup.
2. Enter and confirm a six-digit recovery PIN and replace the backup. Mobile creates a fresh PBKDF2 backup with a new salt and nonce while preserving the same identity key.
3. In the browser, select **Check for updated backup**. Refetch using GET, reclassify and validate the response, then offer PIN recovery only for a supported backup.


Warn users not to delete the legacy backup unless an original device still holds the matching private key. If no device retains that key, first verify that the unwrapped backup is genuinely unsupported rather than a misread API envelope. If no compatible backup reader exists, matching messages cannot be recovered. The mobile app may offer an explicit new-key setup after explaining that it cannot unlock old messages; web must never migrate the backup or generate replacement keys.

### 2.3 Restore procedure

1. Require exactly six ASCII digits (`^[0-9]{6}$`).
2. Derive 256 bits with Web Crypto PBKDF2-HMAC-SHA256 using the downloaded salt and iteration count.
3. Call `nacl.secretbox.open(ciphertext, nonce, wrappingKey)`.
4. Treat `null` as a generic recovery failure and install nothing.
5. Require the recovered private key to be exactly 32 bytes.
6. Derive `nacl.box.keyPair.fromSecretKey(privateKey).publicKey`.
7. Compare the derived public key in constant time with the backup's `identity_public_key`.
8. Only after all checks succeed, atomically install the matching pair in approved account-scoped browser identity storage.
9. Clear PIN state and mutable temporary buffers where possible.

```ts
const material = await crypto.subtle.importKey(  
  "raw",  
  new TextEncoder().encode(pin),  
  "PBKDF2",  
  false,  
  ["deriveBits"],  
);  
const bits = await crypto.subtle.deriveBits(  
  {  
    name: "PBKDF2",  
    hash: "SHA-256",  
    salt: decodedSalt,  
    iterations: backup.kdf.iterations,  
  },  
  material,  
  256,  
);  
const wrappingKey = new Uint8Array(bits);  
const privateKey = nacl.secretbox.open(  
  decodedCiphertext,  
  decodedNonce,  
  wrappingKey,  
);
```

Before installation, derive and verify the public key. The identity is already registered by mobile; web must not call identity-registration/upload endpoints, even with the same key:

```ts
if (!privateKey || privateKey.length !== 32) throw new Error("Recovery failed");  
const keyPair = nacl.box.keyPair.fromSecretKey(privateKey);  
if (!constantTimeEqual(keyPair.publicKey, decodedIdentityPublicKey)) {  
throw new Error("Recovery failed");  
}  
await identityStorage.installAtomically(accountId, keyPair);
```

The PIN remains local. Web must never call the backup endpoint with `PUT` or `DELETE`.

On failure, install nothing, retain any existing verified local identity, clear failed PIN state, and show one generic incorrect-PIN/invalid-backup error without exposing partial verification results. Before installation, confirm that the active account is still the account whose backup was fetched; discard an interrupted or stale-account recovery result.

## 3. Use the restored identity for messaging

After successful recovery, preserve message-version dispatch for existing records:

```json
{  
  "e2ee": true,  
  "e2ee_version": 1,  
  "e2ee_algorithm": "nacl_box_curve25519xsalsa20poly1305"  
}
```

Web must never reinterpret or rewrite version-1 ciphertext as a newer protocol.

## 4. Encrypting and decrypting direct messages

This section applies after the browser has restored and verified the mobile-created identity. It does not authorize identity generation, upload, replacement, deletion, or rotation.

### 4.1 Version-1 algorithm and encoding

Version-1 direct text messages use TweetNaCl `box`, which is Curve25519-XSalsa20-Poly1305 authenticated public-key encryption.

- Public and private identity keys are raw 32-byte values.
- Plaintext is encoded as UTF-8 before encryption.
- Generate a fresh cryptographically random 24-byte nonce for every encryption operation.
- Ciphertext is the UTF-8 plaintext length plus the 16-byte NaCl authenticator.
- Keys, nonce, and ciphertext use standard padded RFC 4648 Base64, not Base64URL.
- Group E2EE is not supported by this version. Do not apply this envelope to group messages.

The server stores ciphertext and routing metadata. It must never receive direct-message plaintext or a private key.

### 4.2 Get and trust the recipient's public key

Before encrypting a direct message, fetch the recipient's bundle using their numeric PKID:

```http
GET /api/v1/chats/users/{recipientPkid}/encryption-bundle  
Authorization: Bearer <token>
```

The relevant response field is:

```json
{  
  "data": {  
    "user_id": 42,  
    "identity_public_key": "<standard Base64 of 32 bytes>"  
  }  
}
```

Strictly decode `identity_public_key` and require exactly 32 bytes. Maintain an account-scoped trusted-key record keyed by recipient PKID. On first use, pin the identity key. If a later bundle presents a different identity key, do not silently continue: fail closed and use the product's approved identity-change confirmation flow.

Never use `signed_prekey` or `one_time_prekey` as a substitute for `identity_public_key` in the current v1 algorithm. The implemented v1 message path uses the account identity keys directly.

### 4.3 Encrypt outgoing text

Encryption inputs are:

- the UTF-8 plaintext;
- the recipient's trusted 32-byte identity public key;
- the sender's restored 32-byte identity private key;
- a new random 24-byte nonce.

```ts
import nacl from "tweetnacl";  
import util from "tweetnacl-util";  

function encryptDirectText(  
plaintext: string,  
recipientPublicKeyBase64: string,  
senderPrivateKeyBase64: string,  
) {  
const recipientPublicKey = util.decodeBase64(recipientPublicKeyBase64);  
const senderPrivateKey = util.decodeBase64(senderPrivateKeyBase64);  

if (recipientPublicKey.length !== nacl.box.publicKeyLength) {  
throw new Error("Recipient encryption key must be 32 bytes");  
}  
if (senderPrivateKey.length !== nacl.box.secretKeyLength) {  
throw new Error("Sender encryption key must be 32 bytes");  
}  

const nonce = nacl.randomBytes(nacl.box.nonceLength);  
const ciphertext = nacl.box(  
util.decodeUTF8(plaintext),  
nonce,  
recipientPublicKey,  
senderPrivateKey,  
);  

return {  
ciphertext: util.encodeBase64(ciphertext),  
nonce: util.encodeBase64(nonce),  
};  
}
```

The sender's public identity key is placed in the transport field named `sender_ephemeral_key`. Despite that legacy field name, the current v1 implementation sends the long-lived sender identity public key, not a newly generated ephemeral key.

Send the encrypted message through the normal direct-message endpoint:

```http
POST /api/v1/chats/messages  
Authorization: Bearer <token>  
Content-Type: application/json
```

```json
{  
"receiver_id": 42,  
"message_type": "text",  
"content": "<standard Base64 ciphertext>",  
"nonce": "<standard Base64 24-byte nonce>",  
"sender_ephemeral_key": "<sender identity public key; standard Base64, 32 bytes>",  
"metadata": {  
"e2ee": true,  
"e2ee_version": 1,  
"e2ee_algorithm": "nacl_box_curve25519xsalsa20poly1305",  
"recipient_identity_public_key": "<recipient key used to encrypt this message; standard Base64, 32 bytes>",  
"e2ee_content_hash": "<SHA-256 envelope fingerprint>"  
}  
}
```

Include ordinary fields such as `reply_to` when applicable. Do not put plaintext into `content`, previews, notification metadata, optimistic records that may be persisted, analytics, or logs.

For compatibility, calculate `e2ee_content_hash` as lowercase hexadecimal SHA-256 of this exact UTF-8 string:

```ts
const canonicalEnvelope = [ciphertext, nonce, senderPublicKey]  
  .map((value) => `${value.length}:${value}`)  
  .join("|");
```

The string lengths are JavaScript string lengths of the Base64 values. The hash fingerprints the envelope for local plaintext-cache validation; it is not a replacement for NaCl authentication.

### 4.4 Recognize an encrypted message

Treat a message as v1 encrypted only when all of these are true:

```ts
message.metadata?.e2ee === true &&  
message.metadata?.e2ee_version === 1 &&  
message.metadata?.e2ee_algorithm ===  
"nacl_box_curve25519xsalsa20poly1305" &&  
typeof message.content === "string" &&  
typeof message.nonce === "string" &&  
typeof message.sender_ephemeral_key === "string"
```

Do not attempt to decrypt partially marked or unsupported envelopes. Fail closed and show an unavailable-encrypted-message state.

### 4.5 Decrypt incoming text

For a received message, use:

- `content` as the Base64 ciphertext;
- `nonce` as the Base64 nonce;
- `sender_ephemeral_key` as the sender's public identity key;
- the current recipient's restored private identity key.

Verify that the message's sender key matches the account-scoped trusted key for `message.sender.pkid`. If trust has not yet been established, compare it with a freshly authenticated encryption bundle before pinning it. A mismatch must not be silently accepted.

```ts
function decryptIncomingText(  
  ciphertextBase64: string,  
  nonceBase64: string,  
  senderPublicKeyBase64: string,  
  recipientPrivateKeyBase64: string,  
): string | null {  
  const ciphertext = util.decodeBase64(ciphertextBase64);  
  const nonce = util.decodeBase64(nonceBase64);  
  const senderPublicKey = util.decodeBase64(senderPublicKeyBase64);  
  const recipientPrivateKey = util.decodeBase64(recipientPrivateKeyBase64);  
  
  if (nonce.length !== nacl.box.nonceLength) {  
    throw new Error("Encrypted message nonce must be 24 bytes");  
  }  
  if (senderPublicKey.length !== nacl.box.publicKeyLength) {  
    throw new Error("Sender encryption key must be 32 bytes");  
  }  
  if (recipientPrivateKey.length !== nacl.box.secretKeyLength) {  
    throw new Error("Recipient encryption key must be 32 bytes");  
  }  
  if (ciphertext.length < nacl.box.overheadLength) {  
    throw new Error("Encrypted message ciphertext is too short");  
  }  
  
  const plaintext = nacl.box.open(  
    ciphertext,  
    nonce,  
    senderPublicKey,  
    recipientPrivateKey,  
  );  
  
  return plaintext ? util.encodeUTF8(plaintext) : null;  
}
```

`nacl.box.open` returning `null` means authentication or decryption failed. Show a generic “Unable to decrypt” state, install no key, and never fall back to rendering `content` as plaintext.

### 4.6 Sent-message readability

For each new direct text message, store the recipient public identity key used for encryption in `metadata.recipient_identity_public_key`. It is public key material, not plaintext or a secret. The backend accepts this optional field only when it matches the recipient's registered identity at send time. Existing messages without the field remain valid.

After restoring the sender's identity on a new device, read the sent message's ciphertext and nonce from the server. Verify that its `sender_ephemeral_key` matches the public key derived from the restored sender private key. Decode and validate the recorded recipient public key, nonce, and ciphertext, then decrypt with the restored sender private key:

```ts
function decryptSentText(  
ciphertextBase64: string,  
nonceBase64: string,  
senderPublicKeyBase64: string,  
recipientPublicKeyBase64: string,  
senderPrivateKeyBase64: string,  
): string | null {  
const ciphertext = util.decodeBase64(ciphertextBase64);  
const nonce = util.decodeBase64(nonceBase64);  
const senderPublicKey = util.decodeBase64(senderPublicKeyBase64);  
const recipientPublicKey = util.decodeBase64(recipientPublicKeyBase64);  
const senderPrivateKey = util.decodeBase64(senderPrivateKeyBase64);  

if (ciphertext.length < nacl.box.overheadLength ||  
nonce.length !== nacl.box.nonceLength ||  
senderPublicKey.length !== nacl.box.publicKeyLength ||  
recipientPublicKey.length !== nacl.box.publicKeyLength ||  
senderPrivateKey.length !== nacl.box.secretKeyLength) {  
throw new Error("Invalid encrypted message envelope");  
}  
if (!nacl.verify(senderPublicKey, nacl.box.keyPair.fromSecretKey(senderPrivateKey).publicKey)) {  
throw new Error("Sent message does not match restored sender identity");  
}  

const plaintext = nacl.box.open(ciphertext, nonce, recipientPublicKey, senderPrivateKey);  
return plaintext ? util.encodeUTF8(plaintext) : null;  
}
```

Use `metadata.recipient_identity_public_key` for messages that have it. The device-local encrypted sender copy remains a fast display path, while the server ciphertext and recorded recipient key allow new sent messages to be read across devices after identity restoration. For older messages without a recorded key, the app may try the recipient's authenticated current key as a best-effort fallback. That key may have rotated; only successful authenticated decryption establishes that it matches the message. If decryption fails, show an unavailable state and never render ciphertext as plaintext. Neither the sender private key nor the recipient private key is stored alongside a message.

### 4.7 Edits, caching, and failures

- Re-encrypt every text edit with a fresh nonce and update `content`, `nonce`, `sender_ephemeral_key`, `metadata.recipient_identity_public_key`, and `metadata.e2ee_content_hash` together.
- Cache plaintext only in an approved account-scoped local cache and bind it to the verified envelope hash.
- Never cache plaintext for an envelope whose computed hash differs from `metadata.e2ee_content_hash`.
- Never persist plaintext inside server message metadata.
- Clear in-memory plaintext and key references on logout and account switch.
- Deduplicate API and socket copies by the server message ID, not ciphertext or timestamp.
- Do not downgrade to plaintext when key fetch, trust validation, encryption, or decryption fails.

## 5. Web state when encryption keys are unavailable

If the browser does not have an approved E2EE key/session:

- do not generate or register a replacement account identity;
- call only `GET` on the key-backup endpoint to determine whether recovery is available;
- request the recovery PIN only after retrieving and validating a mobile-created backup;
- show a clear unavailable state for encrypted content;
- direct the user to mobile when no backup exists or backup creation/management is required;
- preserve ciphertext unchanged until the existing identity is restored.

Suggested product text:

>
> This encrypted message is unavailable on this device. Restore your encryption key, or use the AppsCombo mobile app to create a backup first.
>

Do not say that the message is corrupt, deleted, or permanently unrecoverable unless the server supplies a distinct authoritative state.

For a legacy or unsupported backup, use the original-device replacement guidance in section 2.2 instead of requesting a PIN. A **Check for updated backup** action must only refetch GET; it must not generate, register, or rotate an identity.

## 6. Backup API permissions

The product's allowed operations differ by client:

```text
/api/v1/chats/users/key-backup
```

Web may use authenticated `GET` to retrieve a mobile-created backup. Web must never use `PUT` or `DELETE`.

Expose only a restore-specific GET function to the web bundle. Keep creation, replacement, PIN-change, rotation, and deletion functions mobile-only. Do not preload, persistently cache, or log the response.

The backend requires normal account authentication; the restore-only restriction is a web client/product boundary, not a claim that the endpoint independently detects and rejects browsers. For backend/mobile integration context, PUT returns `201` on creation or `200` on replacement. Idempotent DELETE returns `200` with `{"detail": "Encryption key backup removed."}`, even when no backup exists; it no longer returns an empty `204`. Mobile may retry DELETE once after a transport-level network failure. None of these write operations or retries belong in web.

## 7. Security requirements for web recovery and messaging

Web must ensure:

- ciphertext, nonces, and message metadata are handled according to their stored version and algorithm;
- plaintext and key material never enter URLs, analytics, session replay, console logs, Redux/query devtools, or error-reporting context;
- one account's encryption state cannot be reused after account switching;
- unavailable encrypted messages fail closed instead of being rendered as plaintext;
- active XSS risk is addressed through CSP, dependency, and output-encoding controls;
- server-provided message content is never treated as trusted HTML.

A six-digit PIN has only 1,000,000 possibilities. PBKDF2 slows guessing but cannot prevent offline brute force after backup disclosure. State this limitation and discourage predictable PINs; do not advertise forward secrecy or post-compromise security. Use the approved identity-storage abstraction, never raw private keys in `localStorage` or ordinary persisted state. Active XSS or a compromised browser can access JavaScript-held key material.

Clear mutable temporary key and plaintext buffers where possible. PIN strings are immutable JavaScript values and cannot reliably be zeroed; clear UI state and references without claiming guaranteed memory erasure.

## 8. Web acceptance criteria

- Web implements PIN entry only for restoring a retrieved mobile-created backup.
- Web unwraps the successful GET response's `data` field before format checks; an absent or malformed field produces an API error, not an unsupported-format result.
- Opening Messenger without the account key prompts for recovery inline; no settings-navigation toast replaces the recovery flow.
- Legacy Argon2id and unsupported formats show original-device replacement guidance before PIN entry; checking for an updated backup only repeats GET.
- GET `404` directs users to mobile enrollment; network, timeout, authentication, and server failures preserve state and never permit identity generation.
- Malformed Base64, decoded lengths, unsupported versions/algorithms, noninteger/out-of-range iterations, and unexpected fields fail before key derivation or installation; `updated_at` response metadata is allowed.
- Web uses only `GET` on `/api/v1/chats/users/key-backup`, never `PUT` or `DELETE`.
- Web provides recovery UI but no creation, PIN-change, replacement, rotation, or deletion controls.
- A recovered private key derives the exact mobile-registered public key before installation.
- Wrong PIN, modified backup ciphertext/nonce/public key, and account switching during recovery install nothing and retain existing verified local state.
- A browser without approved key material does not generate or rotate the account identity.
- Encrypted content without an available key shows the approved unavailable state.
- Version-1 ciphertext remains unchanged and is dispatched only to the version-1 decryptor when an approved key/session exists.
- Account logout and switching clear account-scoped in-memory encryption state.
- Sensitive plaintext and key material do not appear in logs, telemetry, caches, or error reports.
- A recipient can decrypt a web-created v1 direct message using the mobile client.
- Web can decrypt a mobile-created v1 direct message after restoring the matching identity.
- Modified ciphertext, nonce, or sender key fails authentication and never renders as plaintext.
- After identity restoration, web can decrypt a new sent message from its server ciphertext using the recorded recipient public key and the restored sender private key; changed keys or ciphertext fail authentication.
- Older sent messages without a recorded recipient key use the authenticated current key only as a best-effort fallback and show an unavailable state if decryption fails.
- Product/support copy says “encryption key backup,” not “complete chat backup”; sent-history recovery is available only where the required identity key and message envelope are available.
- A future protocol uses a new message version while retaining the v1 identity key and read-only v1 decryptor for supported history; old ciphertext is never rewritten in place.

Do not extend web beyond restore-only backup access without a new explicit product and security decision.
