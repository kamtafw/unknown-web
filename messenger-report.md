# AppsCombo Web Messenger – Implementation Status

**Overview**

We've made substantial progress on the AppsCombo web Messenger, particularly on the direct messaging experience and its End-to-End Encryption (E2EE) implementation.

The work has gone beyond simply getting messages to display and send. A considerable amount of attention has gone into message security, account isolation, cross-device recovery, asynchronous operations, and ensuring that encrypted messages don't accidentally expose plaintext or ciphertext in inappropriate places.

The Messenger has a functional implementation foundation, but there are still some outstanding issues, particularly around backend integration, message previews, recovery synchronization, and a few UI inconsistencies.

## What's currently functional

**1. Core messaging experience**

The web Messenger has an implemented direct messaging experience with:

- Conversation and chat-list retrieval.
- Sending and receiving direct messages.
- Message history retrieval.
- Real-time message updates through Socket.IO.
- Optimistic message updates.
- Conversation-level interactions and message actions.
- Chat-list filtering, including All, Favorites, and Archive.
- Pinning, muting, blocking, and archiving conversations.
- Synchronization between message activity and chat-list state.

**2. E2EE implementation**

This has been one of the more involved parts of the project.

The web client implements E2EE for supported direct messages using the existing encryption protocol.

The implementation includes:

- Encryption of outgoing messages.
- Decryption of incoming messages.
- Identity and public-key handling.
- Encrypted message metadata handling.
- Sender-side encrypted local message copies.
- Recovery of sent messages when local copies are unavailable.
- Validation of message envelopes and encryption metadata.
- Fail-closed handling when decryption is unsuccessful.

The implementation also preserves compatibility with existing message formats rather than casually changing the encryption protocol.

**3. E2EE identity recovery**

We implemented a restore-only recovery mechanism for users who already have an E2EE identity backed up on the AppsCombo platform.

The recovery process uses a six-digit PIN and PBKDF2-HMAC-SHA256.

The web implementation deliberately has limited authority:

- It can retrieve an existing backup.
- It can validate and restore a supported backup.
- It cannot generate a new identity.
- It cannot upload, replace, rotate, or delete identity backups.

This restriction is intentional. Identity creation and backup management remain outside the web client's authority.

We also addressed several difficult recovery concerns, including:

- Preventing concurrent recovery attempts from overwriting one another.
- Preventing stale recovery operations from installing an identity after logout or account changes.
- Ensuring identity installation is atomic.
- Handling unsupported legacy backup formats.
- Providing instructions for recovery through the original device when web restoration isn't supported.

**4. Cross-device message recovery**

We also implemented a mechanism for recovering previously sent encrypted messages when the original local encrypted copy is missing or stale.

The implementation uses the restored sender identity and recipient public-key information recorded in message metadata.

For older messages without that metadata, it attempts a best-effort recovery using the authenticated recipient's current key bundle.

When recovery isn't possible, the application fails safely and displays an unavailable/decryption-failure state rather than exposing ciphertext.

**5. Chat-list preview security**

We addressed an important security concern involving encrypted messages appearing in chat-list previews.

The web client now has a safer preview-resolution mechanism that:

- Avoids displaying server-provided plaintext previews for E2EE conversations.
- Uses locally available plaintext only when it can establish an appropriate match with the latest message.
- Uses message metadata to determine safe fallback labels.
- Avoids displaying ciphertext as a preview.
- Provides a neutral fallback when a preview cannot be safely established.
- Applies safe preview handling across the main list, Favorites, and Archive.

This is particularly important because the backend doesn't currently provide all the metadata needed for reliable preview resolution.

**6. Account isolation and session security**

We identified and addressed several subtle account-switching and asynchronous-operation problems.

These included situations where:

- A request initiated under one account could finish after another account had logged in.
- A user could log out and back into the same account while an earlier request was still running.
- Optimistic chat-list updates could leak across account boundaries.
- Socket events could update cached data belonging to an inactive account.
- Decrypted message history could remain in memory after a session change.

The implementation now introduces account-scoped query keys, session-generation tracking, guarded asynchronous operations, and cache cleanup at appropriate lifecycle boundaries.

We also audited local encrypted message storage. The inspected implementation uses account-scoped IndexedDB storage and encrypts message copies before persistence.

These changes are important because E2EE security isn't just about encrypting messages. It's also about controlling where decrypted content lives and preventing it from crossing account boundaries.

## What's not yet fully resolved

**1. Chat-list preview metadata**

This remains an important backend dependency.

The web client needs more reliable metadata from the backend to determine which message is actually the latest message in a conversation.

The proposed contract includes:

- `last_message_type`
- `last_message_id`
- An authoritative E2EE preview-safety indicator.

These fields need consistent availability across All/Unread, Favorites, Archive, and other relevant conversation-list endpoints.

The frontend has already implemented safe fallbacks, but those fallbacks cannot provide the same experience as a complete backend contract.

Consequently, some conversations may display a generic preview instead of the actual latest message.

**2. Recovery and history synchronization**

One observed UX issue concerns message history immediately after a successful identity restoration.

A user can restore their backup, but previously loaded messages may continue displaying "Unable to decrypt message" until the conversation is refreshed.

The underlying issue is that the existing history state doesn't necessarily get reprocessed immediately after identity restoration.

This needs better synchronization between identity recovery, message history, and the Messenger runtime.

**3. E2EE-aware message editing**

During the lifecycle audit, we identified that the existing direct-message actions exposed functionality such as forwarding, reacting, pinning, and deleting.

However, we didn't establish an E2EE-aware message-editing implementation in the inspected message-action flow.

This needs clarification against the intended backend capabilities before considering message editing fully supported for encrypted conversations.

**4. Recovery compatibility**

Legacy and unsupported backup formats still require careful handling.

The web client intentionally doesn't attempt to convert or replace unsupported backups because doing so without the original identity could permanently compromise access to encrypted history.

Users with unsupported backups must follow the original-device recovery instructions.

## Blockers and hindrances

There are a few recurring challenges affecting the project.

**Backend contract inconsistencies**

The most significant technical hindrance is the dependency on backend response structures.

Some endpoints don't provide sufficient message metadata for the web client to make reliable decisions about previews and synchronization.

The frontend has implemented defensive handling, but it cannot manufacture information that the backend doesn't provide.

**Limited control over identity management**

The restore-only E2EE design is deliberate, but it also means that certain recovery scenarios depend on the availability and correctness of the mobile client's identity-management and backup implementation.

The web client cannot independently resolve every identity-related problem.

**Asynchronous state complexity**

Messenger has several independent operations happening concurrently:

- REST history retrieval.
- Socket message reception.
- Message encryption and decryption.
- Local encrypted-copy reads and writes.
- Identity activation and restoration.
- Optimistic chat-list updates.

These operations can overlap, especially during logout, account switching, and recovery.

This has required considerably more defensive programming and regression testing than a conventional messaging implementation.

## Overall assessment

The web Messenger has a substantial functional foundation, and the E2EE work is considerably more mature than a basic encryption integration.

The most important engineering work has been completed around encryption, identity recovery boundaries, cross-device message recovery, safe previews, and account/session isolation.

The remaining work is less about rebuilding the Messenger and more about closing specific integration and experience gaps.

I'd classify the current state as follows:

| Area                                 | Status                                       |
| ------------------------------------ | -------------------------------------------- |
| Direct messaging foundation          | Implemented                                  |
| Real-time messaging                  | Implemented                                  |
| Message history                      | Implemented                                  |
| Conversation management              | Implemented                                  |
| E2EE encryption/decryption           | Implemented                                  |
| Identity backup restoration          | Implemented, with compatibility limitations  |
| Cross-device sent-message recovery   | Implemented                                  |
| Safe encrypted chat previews         | Implemented with backend-dependent fallbacks |
| Account/session isolation            | Implemented                                  |
| Local encrypted message copies       | Implemented                                  |
| Recovery/history synchronization     | Needs improvement                            |
| Conversation participant information | Needs investigation                          |
| Backend preview metadata             | Outstanding dependency                       |
| E2EE-aware message editing           | Not established                              |

**Bottom line:** We have implemented a substantial amount of the actual messaging infrastructure, including some fairly complex security and lifecycle protections. However, there are still outstanding integration issues that prevent us from calling the entire experience fully complete and production-verified.

The biggest outstanding dependency is getting the backend and frontend to agree on the metadata and state needed for reliable encrypted conversation previews and synchronization.
