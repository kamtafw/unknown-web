# E2EE Phase 3 Acceptance Evidence and Remaining Guide Review

**Repository:** `kamtafw/unknown-web`  
**Working branch:** `fix/e2ee-cross-device-sent-recovery`  
**Phase 3 implementation commit previously reviewed:** `b959fcf1ad18e6f342a3febb3be40cd2bbac2a2a`  
**Current guide:** `E2EE-KEY-BACKUP-WEB-IMPLEMENTATION.md` on `main`  
**Status:** Phase 3 is accepted for the behaviors covered by tests. This does not sign off the entire guide or constitute a production security audit.

## 1. Phase 3 acceptance evidence

Phase 3 addresses cross-device readability of sent direct-text messages after restoring the sender's existing mobile-created identity.

Evidence recorded from implementation review and the local test results reported by the developer:

- `prepareDirectMessageEnvelope` records `metadata.recipient_identity_public_key`, the recipient identity key used for encryption.
- The send path validates recipient-key length and enforces the existing account-scoped trusted-key policy before encryption.
- Sent history first uses the account-scoped local encrypted sender copy when its envelope hash matches.
- When the local copy is missing or stale, sent history attempts server-envelope recovery using the restored sender identity and recorded recipient key.
- Legacy messages without a recorded recipient key may use the authenticated current recipient bundle as a best-effort candidate; NaCl authentication remains the deciding check.
- Failed recovery yields an unavailable message state, not server ciphertext.
- Regression tests cover the absent local sender copy for legacy recovery and a valid-length but incorrect legacy fallback key that must fail closed.

### Reported test results

```powershell
npx vitest run lib/messenger/e2ee/direct-message.test.ts lib/messenger/e2ee/trust-store.test.ts
```

**Reported result:** 2 files passed, 43 tests passed (20 direct-message tests and 23 trust-store tests).

```powershell
npx tsc --noEmit
```

**Reported result:** exited cleanly.

These are developer-reported local results, not a claim that CI or a clean-machine build was independently run during this review.

### Phase 3 verdict

**Accepted for tested behavior.** Do not reopen `lib/messenger/e2ee/direct-message.ts` without a reproducible defect or a specific current-guide criterion it fails. Unit tests do not establish full mobile interoperability or all history/UI integration behavior.

## 2. Remaining requirements and verification boundary

| Requirement | Status | What is still needed |
|---|---|---|
| Restore-only backup boundary: web uses GET only; no web PUT/DELETE or identity generation | Audit required | Inspect actual API exports/callers and verify no backup-write or identity-generation path exists. |
| Backup GET envelope handling, missing/malformed data, 404, network/timeout/401/5xx | Partial | Add API-boundary tests for malformed payloads and transport/status failures; confirm recovery state is preserved and retry is possible. |
| Strict backup schema, Base64/decoded lengths, fixed KDF values, iteration bounds, unknown fields, optional `updated_at` | Unit-tested in part | Confirm all exact boundary cases against the current guide, including min/max/non-integer iteration values and `updated_at`. |
| PBKDF2-HMAC-SHA256, exactly six ASCII PIN digits, authenticated secretbox opening, 32-byte key, derived public-key match | Unit-tested in part | Run the full E2EE suite and map every guide failure case to an explicit test. |
| Atomic identity install, no overwrite after failure, stale-account/logout cancellation | Unit-tested; app wiring unverified | Browser-check the real authentication, logout, and account-switch lifecycle. |
| Recovery surface: no identity, no backup, unsupported format, incorrect PIN, PIN clearing | Basic UI coverage exists | Verify actual Messenger entry point, retry/error behavior, send gating, keyboard/accessibility, and retrieval failure state preservation. |
| New v1 outgoing envelope, fresh nonce, correct metadata/hash, no plaintext in optimistic payload | Unit-tested in part | Verify with a real API-backed mobile recipient. |
| Incoming mobile-created v1 message decrypts after restore; authenticated sender bundle and safe trust pinning | Unit-tested in part | Perform real mobile-to-web interoperability with server-returned messages. |
| Sent-history recovery with recorded recipient key and legacy fallback | **Phase 3 accepted for tested paths** | Browser/server integration test after clearing local sender copies and restoring the identity. |
| Type-based previews across Chats, Favorites, and Archive; local decrypted preview precedence; preserve group previews | **Phase 4 not yet accepted** | Implement and test all surfaces and message types. |
| Updated-backup check, original-device replacement instructions, separate unsupported-format path, gating independent of dialog visibility | **Phase 5 not yet accepted** | Implement and test each recovery state and ensure retrieval failures preserve existing state. |
| Text edits re-encrypt with fresh nonce and update all envelope fields consistently | Phase 6 audit/test required | Inspect edit path; assert content, nonce, sender key, recipient key metadata, and hash update together. |
| Plaintext cache tied to verified envelope hash; no stale plaintext on tampering | Phase 6 audit/test required | Audit all cache read/write, preview, history, and normalization paths; add tamper/reload tests. |
| Logout/account-switch clears in-memory keys/plaintext; no A-to-B leakage | Runtime unit tests exist; app wiring unverified | Inspect actual lifecycle calls and audit plaintext references/caches. |
| REST history/socket receive merge deduplicates by server message ID | Phase 6 audit/test required | Test REST response plus socket event for the same ID, including incoming encrypted messages. |
| No PIN/key/plaintext/backup response in logs, analytics, telemetry, error reports, devtools or persistent caches | Security audit required | Search relevant source/configuration and verify data-flow boundaries. |
| CSP, output encoding, message rendering and dependency controls | Security audit required | Review relevant app configuration and rendering paths; crypto unit tests do not establish these controls. |
| Backup copy accurately describes an encryption-key backup, not a complete chat backup | Copy audit required | Check all recovery and support copy, including unsupported, missing-backup and unavailable-message states. |
| v1 remains readable; old ciphertext is not rewritten in place; future protocol changes remain separate | Design constraint | Preserve this constraint for future work. |
| Independent-device identities, prekeys, ratchets, device revocation, group E2EE | Deferred by scope | Do not include without a separate product/security decision. |

## 3. Existing roadmap (preserve these phase numbers)

### Phase 4: Correct preview behavior — Medium priority
- Remove “Encrypted message” as the permanent fallback.
- Implement type-based preview fallbacks.
- Prefer local decrypted previews where available.
- Apply consistently to Chats, Favorites, and Archive.
- Preserve existing group preview behavior.

### Phase 5: Finish the recovery UX — Medium priority
- Add “Check for updated backup.”
- Implement original-device replacement instructions.
- Keep unsupported-format recovery separate from incorrect-PIN handling.
- Make recovery gating independent of dialog visibility.
- Preserve existing state on retrieval failures.

### Phase 6: Complete the lifecycle and plaintext audit — High priority before declaring completion
- Inspect message editing, optimistic-send, REST history, socket receive, logout, and account-switch paths.
- Run the existing tests and add missing tests for the acceptance criteria.
- Evaluate the implementation as a whole, not only as cryptographic functions.

Do not invent a new Phase 4 or renumber these planned phases. The complete lifecycle/plaintext audit is Phase 6, although an individual high-risk defect discovered earlier should be fixed when encountered.

## 4. Acceptance rule

Phase 3 remains accepted unless a specific failing test or reproducible defect is found. Phases 4–6 are complete only when their stated behaviors have direct test or manual integration evidence, or an explicit documented deferral is agreed. Guide requirements marked as audit-required remain open until verified.
