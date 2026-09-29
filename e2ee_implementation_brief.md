# Web Messenger E2EE Implementation Brief

## 1. Purpose

This brief establishes the current E2EE implementation state, implementation timeline, architecture, and decisions for E2EE on the AppsCombo Web Messenger.

The goal is to give Claude a stable source of truth for implementing E2EE incrementally in the existing Web Messenger codebase.

This is **not** a request to implement all E2EE in one pass.

Implementation must proceed milestone by milestone. Each milestone has a defined scope, explicit exclusions, and acceptance criteria. Do not expand a milestone into later work unless the current milestone genuinely requires it.

---

## 2. Current E2EE State

## 2.1 Repository and application context

The Web Messenger lives inside the existing application repository:

`kamtafw/unknown-web`

It is not a dedicated Messenger repository.

Relevant areas include:

* `hooks/messenger/*`
* `lib/messenger/*`
* `types/messenger/*`
* `stores/*`
* `components/messenger/*`
* `app/api/*`
* `docs/messenger/*`
Current stack:

* Next.js 15 App Router
* TanStack Query v5
* Zustand
* Axios
* socket.io-client
* Radix UI
* Tailwind CSS
The Web Messenger already has:

* HTTP/BFF transport
* realtime socket transport
* direct chats
* groups
* message history
* optimistic updates
* chat-list projections
* account switching
* logout flows
* message retries
* message editing infrastructure in some areas
E2EE must integrate into this architecture rather than creating a parallel Messenger architecture.

---

## 2.2 Current crypto implementation

There is currently **no functional Web E2EE implementation**.

`lib/messenger/message-security.ts` is currently a placeholder.

It does not perform the required NaCl encryption/decryption protocol.

`use-send-message.ts` currently sends plaintext message content and contains placeholder transport values for fields such as nonce and sender key.

Therefore, the existing implementation must not be treated as partially compliant E2EE.

The E2EE work starts from a foundation/placeholder state.

---

## 2.3 Existing transport architecture

The existing transport layers should remain crypto-agnostic where possible.

### HTTP

Messenger API methods live in:

`lib/messenger/api.ts`

The BFF routes proxy requests to the backend.

The BFF does not need to perform message encryption.

For E2EE, the Web client should:

1. obtain the required crypto material;
2. encrypt/decrypt at the Messenger application layer;
3. send/receive the resulting wire envelope through the existing transport.
Do not move E2EE into the BFF unless a future protocol explicitly requires server-side handling.

### Socket

`lib/messenger/socket-manager.ts` owns socket connection lifecycle.

It should remain responsible for:

* connection
* reconnection
* authentication
* room lifecycle
It should **not** become the crypto layer.

Feature hooks such as `use-chat-socket.ts` should interpret encrypted message events and pass validated/decrypted messages into the normal UI/cache pipeline.

---

## 3. Protocol Scope

## 3.1 Web E2EE v1 scope

Web E2EE v1 applies to:

**Direct messages only.**

It does not apply to groups.

Groups must continue using the existing non-E2EE group-message protocol until a separate group E2EE protocol is defined.

Do not apply the v1 direct-message envelope to group messages.

---

## 3.2 Identity ownership

Mobile owns identity creation and backup management.

Web is a **restore/read-only client** for identity backup.

Web must not:

* create a new backup;
* register a backup;
* replace a backup;
* rotate a backup;
* delete a backup.
The Web client retrieves the existing backup and restores the identity locally when the user supplies the correct PIN.

---

## 4. E2EE Cryptographic Architecture

## 4.1 Identity key

The identity is a NaCl `box` keypair.

* private key: 32 raw bytes
* public key: 32 raw bytes
The Web client restores the private key from the mobile-created backup.

The private key must never be stored in:

* ordinary localStorage;
* persisted Zustand state;
* React Query cache;
* message objects;
* URL parameters;
* logs;
* analytics;
* notifications;
* session replay data.
Use the approved account-scoped browser identity storage abstraction.

The exact storage implementation must be isolated behind that abstraction.

---

## 4.2 Backup endpoint

Web retrieves the backup using:

`GET /api/v1/chats/users/key-backup`

Web does not write to this endpoint.

### Backup v1 structure

Expected fields include:

* `format_version: 1`
* `recovery_method: "six_digit_pin"`
* `encryption_algorithm: "nacl_secretbox_xsalsa20poly1305"`
* `identity_public_key`
* `ciphertext`
* `nonce`
* KDF information
The following encoding rules are fixed:

* Base64 uses standard padded RFC 4648 encoding.
* `identity_public_key` decodes to exactly 32 bytes.
* `ciphertext` decodes to exactly 48 bytes.
* `nonce` decodes to exactly 24 bytes.
* KDF salt decodes to exactly 16 bytes.
* derived wrapping key is 32 bytes.
KDF:

* algorithm: PBKDF2
* PRF: HMAC-SHA256
* iterations: supplied by the backup
* valid range: 600,000 through 2,000,000
* output length: 32 bytes
The Web client must use the iteration count contained in the backup.

---

## 4.3 PIN

The recovery PIN is exactly six ASCII digits:

`^[0-9]{6}$`

PIN validation occurs before attempting cryptographic recovery.

Wrong PIN and cryptographic failure must surface through a generic recovery failure state.

Do not expose cryptographic failure details to the user.

---

## 4.4 Identity recovery

Recovery sequence:

1. Validate the backup structure.
2. Validate the PIN format.
3. Decode the backup fields.
4. Derive the wrapping key using PBKDF2-HMAC-SHA256.
5. Open the NaCl secretbox using:
   * ciphertext
   * nonce
   * derived wrapping key
6. Require a 32-byte private key.
7. Derive the public key using:
   `nacl.box.keyPair.fromSecretKey(privateKey)`
8. Compare the derived public key with the backup's `identity_public_key` using constant-time comparison.
9. Only after successful verification, atomically install the identity into account-scoped browser identity storage.
If any step fails, the identity must not be installed.

---

## 5. Recipient Key Architecture

Recipient encryption material is retrieved from:

`GET /api/v1/chats/users/{pkid}/encryption-bundle`

For E2EE v1, only the recipient's:

`identity_public_key`

is required.

Signed prekeys and one-time prekeys are explicitly deferred.

---

## 5.1 Trusted recipient keys

Recipient public keys are account-scoped and locally pinned.

First successful observation may establish the trusted key.

Once pinned:

* the same key remains trusted;
* a changed key must fail closed.
Do not silently replace an existing trusted key.

Do not automatically accept a changed identity key.

Trusted-key storage must also be account-scoped and must be cleared/isolated during account switching and logout.

---

## 6. Message Encryption Architecture

## 6.1 Encryption primitive

Direct-message plaintext is encrypted using:

`nacl.box(plaintextUtf8, nonce, recipientPublicKey, senderPrivateKey)`

Each encryption must generate a fresh random 24-byte nonce.

Never reuse a nonce for a different encryption.

---

## 6.2 Sender key field

The backend wire field is currently named:

`sender_ephemeral_key`

Despite the name, the v1 protocol semantics are:

**the sender's long-lived identity public key.**

Web must not create a genuinely ephemeral sender key for v1.

Internally, code should use a semantic name such as:

`senderIdentityPublicKey`

and map it to the backend wire field only at the transport boundary.

This naming distinction is intentional and must not be "fixed" by changing the protocol semantics.

---

## 7. E2EE Message Envelope

A v1 encrypted direct message contains the encrypted payload and required metadata.

Important metadata includes:

* `e2ee: true`
* `e2ee_version: 1`
* `e2ee_algorithm: "nacl_box_curve25519xsalsa20poly1305"`
* encrypted ciphertext
* nonce
* sender identity public key, mapped to the wire field `sender_ephemeral_key`
* `e2ee_content_hash`
The exact existing backend message field names must be preserved at the transport boundary.

Do not invent a new envelope format if the backend contract already defines the field.

---

## 8. Content Hash

The content hash is calculated from the exact encoded values:

```text
[ciphertext, nonce, senderPublicKey]
  .map(v => `${v.length}:${v}`)
  .join("|")
```

The resulting canonical string is hashed with SHA-256.

The resulting hash is lowercase hexadecimal.

The hash is a fingerprint/integrity identifier.

It is **not** a replacement for NaCl authentication.

Do not treat a valid content hash as proof that a message is cryptographically authentic if NaCl decryption/authentication has failed.

---

## 9. Receiving and Decryption

For an incoming encrypted direct message:

1. Confirm the message is an E2EE message.
2. Dispatch based on E2EE version and algorithm.
3. Validate the v1 envelope.
4. Obtain the sender public key from `sender_ephemeral_key`.
5. Check the sender key against the account's trusted-key state.
6. Decrypt using:

```text
nacl.box.open(
  ciphertext,
  nonce,
  senderPublicKey,
  recipientPrivateKey
)
```

1. Decode the plaintext as UTF-8.
2. Only then create the normal UI-facing message representation.
If authentication/decryption fails:

* do not render ciphertext as plaintext;
* do not insert the failed message into the normal plaintext message cache;
* fail closed;
* expose only an appropriate generic UI state.

---

## 10. Version Dispatch

Encrypted messages must be dispatched by explicit E2EE version/algorithm metadata.

Version 1 is currently:

`nacl_box_curve25519xsalsa20poly1305`

Unknown or unsupported E2EE versions must fail closed.

Do not guess how an unknown envelope should be decrypted.

---

## 11. Plaintext Hygiene

This is a core architectural requirement.

Plaintext must not be persisted outside the places where it is intentionally required for active UI interaction.

Do not persist plaintext message content in:

* React Query persistence
* localStorage
* persisted Zustand
* IndexedDB
* optimistic records that survive the active operation
* logs
* analytics
* notification payloads
* URLs
* session replay
* debug telemetry
Transient plaintext may exist briefly in memory while:

* the user is composing;
* encryption is being performed;
* a freshly decrypted message is being normalized for immediate rendering.
The implementation should minimize its lifetime and avoid unnecessary copies.

---

## 12. Existing Chat-List Preview Decision

This decision is already resolved.

The server currently exposes fields such as:

* `last_message_preview`
* `last_message_time`
* `last_message_type`
* `unread_count`
For E2EE direct messages:

**`last_message_preview` must not be rendered as plaintext from the server.**

The Web client must treat the server-provided plaintext preview as unavailable/untrusted for E2EE DMs.

The server can continue supplying non-sensitive metadata such as:

* last message time
* last message type
* unread count
* ordering information

---

## 12.1 Local preview projection

When a successfully decrypted direct message is available locally, the Web client may derive a local preview.

If no decrypted preview is available, use the existing type-based fallback system.

Examples:

* Image
* Video
* Voice message
* Document
* Location
* Contact
* Poll
* Call
* Shared post
* Message
Do not use "Encrypted message" as the permanent fallback.

That wording describes an implementation state rather than the message type.

---

## 12.2 Scope of preview policy

The same policy applies to all direct-message list-like surfaces, including:

* Chats
* Favorites
* Archive
* other DM list projections
Groups are unaffected.

---

## 12.3 Durable sender previews

A sender-encrypted server copy may not be decryptable by the sender because the recipient-encrypted message is encrypted for the recipient.

If durable sender-side message readability is required, the protocol must use a separate local encrypted copy encrypted for the sender.

That is deferred to E5.

Do not introduce a full local encrypted message database merely to solve E3 chat-list previews.

---

## 13. Optimistic Updates

The existing Messenger implementation creates optimistic `Message` objects containing plaintext content.

This is not acceptable for the E2EE path.

The E2EE implementation must ensure plaintext does not become durable through optimistic TanStack Query records.

Outgoing E2EE messages should be encrypted before the message enters the durable message-cache path.

The optimistic strategy must be adapted so the Query cache does not persist plaintext.

Retry logic must also become E2EE-aware.

A retry must not depend on a plaintext message object that was previously persisted into the cache.

---

## 14. History and Socket Processing

E2EE decryption must happen before an encrypted direct message is allowed into the normal UI/cache representation.

### REST history

`use-chat-history.ts` currently treats API history as plaintext.

For E2EE DMs it must:

1. identify encrypted messages;
2. validate the envelope;
3. perform version dispatch;
4. validate trusted sender identity;
5. decrypt;
6. normalize into the UI message representation;
7. only then update the normal message cache.

### Socket receive

`use-chat-socket.ts` currently treats `CHAT_SOCKET_EVENTS.RECEIVE` payloads as ready-to-render messages.

For E2EE DMs, it must perform the same validation/decryption boundary before updating:

* message history cache;
* chat-list projections;
* unread/read state where applicable.
`socket-manager.ts` itself should remain crypto-agnostic.

---

## 15. Account Isolation and Lifecycle

Crypto state is account-scoped.

This includes:

* restored identity
* private key
* public key
* trusted recipient/sender keys
* local E2EE preview state
* any future encrypted local message copies
Account switching must not allow the previous account's crypto state to remain active.

Logout must clear in-memory crypto state.

Account switching must clear or replace the active crypto context before the new account begins E2EE operations.

There are multiple logout paths in the existing application, so cleanup must not depend on only one React hook.

Expose a central account-scoped crypto clear/reset operation that can be invoked by the application's account lifecycle.

---

## 16. E2EE Implementation Timeline

Implementation is intentionally divided into the following milestones.

## E0.1: Crypto Foundation

### Scope

Build the cryptographic primitives and protocol utilities.

Expected work:

* select/add compatible NaCl dependency;
* strict Base64 helpers;
* byte conversion helpers;
* PBKDF2-HMAC-SHA256;
* SHA-256;
* NaCl secretbox wrapper;
* NaCl box wrapper;
* random nonce generation;
* constant-time comparison;
* content-hash calculation;
* strict protocol types/validation helpers.

### Must not include

* PIN UI
* backup retrieval UI
* identity restoration flow
* message sending
* message receiving
* chat-list changes

### Exit condition

The cryptographic primitives are independently testable and match the protocol requirements.

---

## E0.2: Identity and Trust Foundation

### Scope

Create the account-scoped browser crypto architecture.

Expected work:

* identity abstraction;
* in-memory active identity;
* account-scoped identity storage;
* trusted-key storage abstraction;
* account isolation;
* crypto lifecycle clear/reset;
* tests for account switching and stale identity prevention.

### Must not include

* message encryption
* message decryption
* backup recovery UI
* group E2EE

### Exit condition

The application has a safe foundation on which E1/E2 can restore and use an identity.

---

## E1: Backup Retrieval and Validation

### Scope

Add:

`GET /api/v1/chats/users/key-backup`

Implement strict validation of the returned backup.

Handle:

* valid v1 backup;
* 404/missing backup;
* unsupported legacy format;
* unsupported KDF;
* malformed data;
* invalid lengths;
* invalid metadata.

### Important behavior

If the endpoint returns 404:

The Web client should not attempt to create a backup.

The user should be directed toward the mobile backup/update path.

If an unsupported legacy/Argon2id format is encountered:

Do not ask for the PIN.

The user should be directed toward the mobile backup/update path.

### Must not include

* backup creation/update
* PIN recovery
* message encryption

---

## E2: Identity Recovery

### Scope

Implement the six-digit PIN recovery flow.

Flow:

1. validated v1 backup exists;
2. user supplies six-digit PIN;
3. derive wrapping key;
4. secretbox decrypt;
5. derive public key;
6. constant-time compare against backup public key;
7. atomically install verified identity.
Wrong PIN/decryption failure must be generic.

### Must not include

* message encryption
* message decryption
* group E2EE
* backup creation or rotation

### Exit condition

A valid mobile-created identity can be restored into the correct account-scoped Web identity storage.

---

## E3: Outgoing Direct-Message E2EE

### Scope

Implement encrypted outgoing v1 direct messages.

Expected flow:

1. obtain current account identity;
2. obtain recipient encryption bundle;
3. pin/verify recipient public key;
4. generate fresh nonce;
5. encrypt plaintext with NaCl box;
6. construct v1 envelope;
7. calculate content hash;
8. send through existing Messenger transport;
9. handle optimistic UI without persisting plaintext;
10. adapt retry behavior to the encrypted-message model.

### Must include

* recipient key retrieval;
* trust pinning;
* encryption;
* envelope creation;
* content hash;
* optimistic-cache hygiene;
* retry compatibility.

### Must not include

* incoming decryption;
* group E2EE;
* encrypted media protocol;
* full local encrypted message database;
* unrelated direct-message features.

---

## E4: Incoming Direct-Message E2EE

### Scope

Decrypt E2EE direct messages from:

* REST history;
* socket receive events.
Implement:

* version dispatch;
* envelope validation;
* sender trust verification;
* NaCl decryption;
* fail-closed behavior;
* UI/cache normalization.
Incoming encrypted messages must never reach the normal plaintext message path before successful decryption.

### Must not include

* group E2EE;
* new group protocol;
* unrelated realtime changes.

---

## E5: Conversation Surfaces and Durable Local State

### Scope

Complete the E2EE-aware conversation experience.

Expected work:

* local chat-list previews;
* Favorites preview behavior;
* Archive preview behavior;
* local preview projection;
* safe fallback labels;
* durable sender-side local encrypted copies if required;
* any necessary local encrypted message storage abstraction.
This is where durable sender-side readability can be addressed.

Do not solve it prematurely during E3 by persisting plaintext.

---

## E6: Lifecycle and Security Audit

### Scope

Perform a dedicated E2EE security/lifecycle audit.

Verify:

* logout cleanup;
* account switching;
* stale identity prevention;
* trusted-key isolation;
* plaintext cache search;
* plaintext logs;
* analytics;
* notifications;
* session replay;
* retry behavior;
* optimistic updates;
* history handling;
* socket handling;
* unknown E2EE versions;
* group exclusion;
* server preview exclusion;
* key-change failure behavior.
This milestone is about verification and hardening, not adding unrelated functionality.

---

## 17. Explicit Non-Goals

The following are outside Web E2EE v1:

### Group E2EE

No group encryption is being implemented in this milestone series.

### Signed prekeys

Deferred.

### One-time prekeys

Deferred.

### Web identity creation

Not supported.

### Web backup creation

Not supported.

### Web backup rotation

Not supported.

### Web backup deletion

Not supported.

### Encrypted media protocol

Do not invent an encrypted-media protocol unless a separate backend/product contract defines one.

### Calls/live E2EE

Out of scope for this implementation.

### Protocol redesign

Do not redesign the established v1 protocol during implementation.

If a discovered backend inconsistency makes implementation impossible, stop and surface the inconsistency rather than silently changing the protocol.

---

## 18. Architectural Boundaries

The implementation should maintain these boundaries:

```text
                 Messenger UI
                      |
                Feature hooks
                      |
          +-----------+-----------+
          |                       |
     E2EE boundary          Existing Messenger
          |                    state/cache
          |
   Crypto / identity
   / trust services
          |
   Account-scoped storage
```

More concretely:

```text
API / Socket transport
        |
        v
Encrypted wire envelope
        |
        v
E2EE message boundary
        |
   +----+----+
   |         |
decrypt    validate
   |         |
   +----+----+
        |
        v
UI-facing Message
        |
        v
Query/cache/UI
```

The transport layer should not perform cryptography.

The socket manager should not perform cryptography.

The BFF should not perform cryptography.

The crypto layer should not know about React components.

The identity layer should not know about chat UI.

The UI should not manipulate raw private-key material.

---

## 19. Naming and Semantics

Avoid misleading names internally.

The backend field:

`sender_ephemeral_key`

means the sender's long-lived identity public key for v1.

Prefer:

`senderIdentityPublicKey`

inside application code.

Only map to `sender_ephemeral_key` when constructing/parsing the backend wire representation.

Likewise, avoid names such as:

* `fakeNonce`
* `temporaryKey`
* `encryptedContent` when it actually means a full envelope
Use names that describe the protocol semantics accurately.

---

## 20. Error Handling Principles

E2EE failures must fail closed.

Examples:

* malformed encrypted envelope;
* unsupported version;
* unsupported algorithm;
* missing identity;
* missing recipient key;
* changed trusted key;
* invalid ciphertext;
* invalid nonce;
* failed authentication;
* failed UTF-8 decoding;
* content-hash mismatch where the protocol requires validation.
Do not:

* render ciphertext as message text;
* silently downgrade encrypted messages to plaintext;
* silently accept a changed identity key;
* silently treat an unknown protocol version as v1;
* log private key material;
* expose cryptographic internals to the user.
User-facing errors should be useful but generic enough not to leak sensitive cryptographic details.

---

## 21. Backend Contract Principle

The latest backend E2EE contract takes precedence over old implementation comments or assumptions.

Before changing protocol fields or semantics, verify the current backend contract.

If an implementation detail appears contradictory:

1. identify the exact contradiction;
2. do not silently reinterpret the protocol;
3. surface the issue for confirmation.
The Web implementation should conform to the established protocol rather than creating a Web-specific variant.

---

## 22. Claude Implementation Rules

For every E2EE milestone:

1. Inspect the current repository state before editing.
2. Read the relevant Messenger implementation and types.
3. Reuse existing architecture where appropriate.
4. Do not rewrite unrelated Messenger code.
5. Do not expand scope into later E2EE milestones.
6. Preserve existing group-message behavior.
7. Preserve existing transport architecture.
8. Add tests for protocol-critical behavior.
9. Do not persist plaintext as a shortcut.
10. Do not invent protocol behavior when the contract is silent.
11. Report discovered contract gaps instead of silently solving them.
12. Keep changes reviewable and milestone-scoped.
Each milestone should end with:

* files changed;
* behavior implemented;
* tests added/updated;
* validation performed;
* known limitations;
* anything that must be addressed in the next milestone.

---

## 23. Current Implementation Order

The implementation order is:

```text
E0.1  Crypto primitives
  |
E0.2  Identity + trust foundation
  |
E1    Backup retrieval + validation
  |
E2    PIN recovery
  |
E3    Outgoing DM encryption
  |
E4    Incoming DM decryption
  |
E5    Conversation surfaces + durable local state
  |
E6    Lifecycle/security audit
```

Do not skip directly to E3 merely because the message encryption function appears simple.

The identity, storage, trust, and plaintext-hygiene foundations are prerequisites for a safe implementation.

---

## 24. Current Decisions That Are Locked

The following decisions should be treated as established unless new backend evidence requires revisiting them:

1. Web E2EE v1 is direct-message only.
2. Groups remain non-E2EE.
3. Mobile owns identity creation and backup management.
4. Web only restores the mobile-created identity.
5. Web never creates, updates, rotates, or deletes the backup.
6. Identity is a NaCl box keypair.
7. Backup recovery uses PBKDF2-HMAC-SHA256 followed by NaCl secretbox.
8. PIN is exactly six ASCII digits.
9. Backup public-key verification is mandatory before installing the identity.
10. Identity storage is account-scoped.
11. Trusted keys are account-scoped and pinned.
12. A changed trusted identity key fails closed.
13. E2EE v1 uses NaCl box.
14. Every encryption gets a fresh 24-byte nonce.
15. `sender_ephemeral_key` is semantically the sender's long-lived identity public key.
16. Web must not generate a truly ephemeral sender key for v1.
17. Content hash uses the established canonical string and SHA-256.
18. Content hash is not a substitute for NaCl authentication.
19. Unknown E2EE versions fail closed.
20. Plaintext must not enter durable caches/storage.
21. Server `last_message_preview` must not be rendered for E2EE DMs.
22. Chat lists continue using non-sensitive server metadata.
23. Local decrypted previews may be projected into DM list surfaces.
24. Safe type-based fallback is used when no local decrypted preview exists.
25. Durable sender-side previews are deferred to E5/local encrypted copies.
26. The BFF remains crypto-agnostic.
27. The socket manager remains crypto-agnostic.
28. Crypto is performed at the Messenger application boundary.
29. E2EE implementation is milestone-based, not one-shot.
30. Backend contract inconsistencies must be surfaced rather than silently resolved.

---

## 25. Definition of Done for the Overall E2EE Work

Web Messenger E2EE v1 is complete only when:

* a mobile-created identity can be safely restored on Web;
* identity state is isolated per account;
* direct messages can be encrypted using the established NaCl v1 protocol;
* recipient keys are trusted and pinned correctly;
* incoming direct messages can be validated and decrypted;
* encrypted messages fail closed on protocol/authentication errors;
* plaintext is not persisted through Messenger caches or local storage;
* optimistic updates and retries are E2EE-safe;
* chat-list previews no longer depend on server plaintext for E2EE DMs;
* local preview behavior is consistent across DM list surfaces;
* account switching and logout clear crypto state correctly;
* groups remain on their existing protocol;
* unknown E2EE versions are rejected safely;
* the final lifecycle/security audit passes.
The objective is not merely to make encrypted messages appear to work.

The objective is to integrate the established E2EE protocol into the existing Web Messenger without creating plaintext persistence, account-isolation, trust, or lifecycle vulnerabilities.
