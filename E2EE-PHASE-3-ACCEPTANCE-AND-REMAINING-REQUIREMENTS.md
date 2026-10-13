# E2EE Phase 3 Acceptance Evidence and Remaining Guide Review

**Repository:** `kamtafw/unknown-web`  
**Branch:** `fix/e2ee-cross-device-sent-recovery`  
**Reviewed branch head:** `b959fcf1ad18e6f342a3febb3be40cd2bbac2a2a`  
**Guide reviewed:** `E2EE-KEY-BACKUP-WEB-IMPLEMENTATION.md` on `main`  
**Status:** Phase 3 accepted for the behaviors covered below. This is not a sign-off of every guide acceptance criterion or a production security audit.

## 1. Phase 3: accepted scope

Phase 3 addresses cross-device readability of sent direct-text messages after restoring the sender's existing mobile-created identity.

Evidence recorded from the implementation review and the test run reported for this branch:

- `prepareDirectMessageEnvelope` records `metadata.recipient_identity_public_key`, the recipient identity key used for encryption.
- The send path validates recipient-key length and enforces the existing account-scoped trusted-key policy before encryption.
- Sent history first uses the account-scoped local encrypted sender copy when its envelope hash matches.
- When the local copy is missing or stale, sent history attempts server-envelope recovery using the restored sender identity and recorded recipient key.
- Legacy messages without the recorded recipient key may use the authenticated current recipient bundle as a best-effort candidate; NaCl authentication remains the deciding check.
- Failed recovery yields an unavailable message state, not the server ciphertext.
- The tests explicitly cover absent local sender copy for legacy recovery and a valid-length but incorrect legacy fallback key that must fail closed.

### Test evidence reported

Command:

```powershell
npx vitest run lib/messenger/e2ee/direct-message.test.ts lib/messenger/e2ee/trust-store.test.ts
```

Reported result: **2 test files passed, 43 tests passed** (20 direct-message tests and 23 trust-store tests).

Command:

```powershell
npx tsc --noEmit
```

Reported result: exited cleanly.

These results are user-reported local runs, not a claim that CI or a clean-machine build was independently run during this review.

### Phase 3 verdict

**Accepted for tested behavior.** Do not reopen `lib/messenger/e2ee/direct-message.ts` without a reproducible defect or a specific guide criterion that it fails. The tests establish the covered code paths; they do not establish full mobile interoperability or every history/UI integration path.

## 2. Remaining guide requirements: status boundary

Statuses below distinguish inspected implementation/test evidence from scenarios that still need explicit verification.

| Guide requirement | Current status | Evidence / next verification |
|---|---|---|
| Restore-only backup boundary: web uses GET only; no web PUT/DELETE or identity generation | **Audit required** | Verify the actual API exports and every caller; search the production web bundle/source for backup writes and identity-registration calls. A product-boundary statement alone is not proof. |
| GET envelope unwrapping, missing/malformed `data`, 404, timeout/network/401/5xx behavior | **Partially covered; integration gaps remain** | Recovery UI tests cover no-backup and unsupported states. Add API-boundary tests for malformed envelopes and each transport/status error, checking that state is preserved and retry is offered. |
| Strict backup schema, standard Base64 and decoded lengths, fixed values, iteration bounds, unknown-field rejection, optional `updated_at` | **Unit-tested in part** | `backup-validation.test.ts` covers valid v1, unsupported variants, malformed Base64/lengths, malformed KDF settings, and unexpected fields. Confirm exact boundary cases (iteration min/max and non-integer) and `updated_at` allowance. |
| PBKDF2-HMAC-SHA256 restore, exactly six ASCII digits, authenticated secretbox opening, 32-byte key, derived public-key match | **Unit-tested in part** | `backup-primitives.test.ts`, `webcrypto.test.ts`, and `backup-recovery.test.ts` exist. Re-run the complete E2EE suite and map each guide failure case to a test. |
| Atomic installation, no overwrite on failure, stale-account/logout cancellation | **Unit-tested** | `backup-recovery.test.ts`, `identity-store.test.ts`, and `runtime.test.ts` include these cases. Still verify the actual Messenger auth/account-switch wiring in a browser. |
| Inline recovery prompt when Messenger opens without an identity; no PIN for unsupported backup; clear PIN after failure | **Basic UI coverage exists; full UX unverified** | `messenger-e2ee-recovery-surface.test.tsx` covers checking for backup, no-backup guidance, unsupported guidance, and PIN clearing. Verify blocking encrypted sends, retry/error states, keyboard/accessibility behavior, and the real Messenger entry point. |
| New v1 outgoing envelope, fresh nonce, correct metadata/content hash, no plaintext in optimistic payload | **Unit-tested in part** | `direct-message.test.ts` covers outgoing envelope fields, nonce freshness, hash, and plaintext omission. End-to-end mobile decryption is not evidenced by these unit tests. |
| Incoming mobile-created v1 message decrypts after restored identity; sender key authenticated against API bundle and pinned safely | **Unit-tested in part; mobile interop unverified** | Direct-message tests cover authenticated bundle matching, mismatch rejection, incoming decryption, and trust pinning. Still run a real mobile-to-web scenario with a restored identity and server-returned message. |
| Sent-history recovery with recorded recipient key and legacy fallback | **Phase 3 accepted for tested paths** | See Phase 3 evidence above. Add a browser/server integration test for persisted history after clearing the browser's local message store and restoring the identity. |
| Text edits re-encrypt with a fresh nonce and update all envelope fields together | **Untested in this phase** | Exercise the actual edit flow and assert `content`, `nonce`, `sender_ephemeral_key`, `metadata.recipient_identity_public_key`, and `metadata.e2ee_content_hash` change consistently. |
| Account-scoped plaintext cache is bound to verified envelope hash; no stale plaintext on modified envelope | **Partial / integration verification needed** | Local-copy hash checks exist in sent history. Audit all plaintext-cache read/write paths, incoming previews, and list/history normalization. Add tamper and reload tests. |
| Logout/account switch clears in-memory keys/plaintext; account A state cannot leak into B | **Runtime unit-tested; app wiring unverified** | Runtime tests cover clear and stale activation guards. Verify auth/logout/account-switch components actually invoke the correct clear/activate lifecycle, and check plaintext references/caches. |
| API/socket copies deduplicated by server message ID | **Not verified by Phase 3 tests** | Inspect the live message merge/store path and test API response + socket event for one server ID results in one visible item, including incoming encrypted messages. |
| No sensitive material in console, analytics, query/Redux devtools, telemetry, error reports or persistent caches | **Security audit required** | Search call sites and configuration; verify backup response and PIN/key/plaintext never enter logs, telemetry, query persistence, service-worker cache, or error context. |
| CSP, dependency/output-encoding controls, and server message content never trusted as HTML | **Outside Phase 3; audit required** | Review deployed CSP/security headers, relevant dependency posture, and rendering paths. Do not infer this from crypto unit tests. |
| Product copy describes an “encryption key backup,” not a complete chat backup; correct unsupported-backup guidance | **Partially covered** | Inspect all user-facing copy and support text, including missing-backup, unsupported/legacy, and unavailable-message states. |
| Future protocol keeps v1 read-only decryption and never rewrites old ciphertext in place | **Deferred design constraint** | No new protocol is in scope. Preserve the constraint when future protocol work is proposed. |
| Independent-device identities, prekeys, ratchets, device revocation, group E2EE | **Explicitly deferred by guide** | Do not implement as part of the next phase without a separate product/security decision. |

## 3. Recommended next implementation phase

### Phase 4 — Close end-to-end acceptance gaps

Prioritize observable application behavior over another refactor of the accepted cryptographic recovery function.

1. **Establish a clean baseline:** run the complete E2EE test set and `npx tsc --noEmit`; record exact counts and any failures.
2. **Verify restore-to-Messenger integration:** test missing identity → GET backup → supported/unsupported/error branches → PIN restore → Messenger becomes usable; include logout/account switch during recovery.
3. **Verify real message interoperability:** mobile-created v1 incoming message decrypts on web after restore; web-created v1 outgoing message decrypts on mobile; restored sender can read server history after local sender copies are removed.
4. **Audit API permissions and sensitive data boundaries:** prove web exposes only backup GET, with no identity-generation or backup-write path; inspect logging and caching.
5. **Verify edit, cache, and realtime integration:** edits update all envelope fields atomically; cache rejects mismatched hashes; API/socket duplicates collapse by server message ID.

Do not treat all of Phase 4 as one unbounded change. Start with the baseline and the narrow restore-to-Messenger integration test, then address the first reproducible gap. Keep security-header/XSS review as a separate explicit audit item if it cannot be proven from the relevant application configuration.

## 4. Acceptance rule

Phase 3 remains accepted unless a specific failing test or reproducible defect is found. Phase 4 is complete only when each in-scope criterion above has either:
- direct test or manual integration evidence recorded, or
- an explicit documented deferral approved as outside the current web-client scope.

The guide's deferred protocol features are not blockers for Phase 4.
