# E2EE Web Messenger Implementation Handoff

**Purpose:** Continue the existing E2EE implementation in a new ChatGPT conversation without losing phase boundaries, test evidence, constraints, or next actions.

## Project and source of truth

- Repository: `kamtafw/unknown-web`
- Local checkout previously used: `C:\Users\salva\appscombo\appscombo_frontend`
- Working branch: `fix/e2ee-cross-device-sent-recovery`
- Current guide/source of truth: `E2EE-KEY-BACKUP-WEB-IMPLEMENTATION.md` on `main`
- Phase 3 acceptance record: `E2EE-PHASE-3-ACCEPTANCE-AND-REMAINING-REQUIREMENTS.md`
- Phase 3 implementation commit reviewed: `b959fcf1ad18e6f342a3febb3be40cd2bbac2a2a`
- Acceptance-document commit: `7e7ff27a259e70b56c7605c40bba638a502221b1` (created on the working branch; verify current branch head before relying on this as latest).

## What the user is trying to achieve

Finish the web-client E2EE implementation in line with the **latest** implementation guide. Make it safe, interoperable with the existing mobile-created identity and message format, and reliable across restoration, history, previews, realtime updates, logout, and account switching. The goal is not merely passing isolated crypto tests: the application should never expose ciphertext as message content or show stale plaintext, and should have coherent recovery UX. Work phase by phase, inspect current code before editing, and avoid repeatedly changing a function that has already passed its focused regression tests.

The user wants practical, direct implementation help. Identify the exact failing stage, preserve phase numbering, make changes in the repository rather than supplying disconnected fragments when repository tooling permits, and report what is verified versus inferred or untested. Do not invent passing tests or claim an audit was completed without evidence.

## Phase status

### Earlier phases 1–2: completed according to the prior work record

**Phase 1 — recovery boundaries:** covered backup-response validation, removal of sensitive backup-response logging, stale-account recovery guards, atomic identity installation/no-overwrite behavior, and unsupported-backup handling. Previously reported relevant tests and TypeScript check passed (75 tests at that point). Verify current full-suite state before using that old count as a current baseline.

**Phase 2 — sender identity trust:** covered validating an unknown sender key against the authenticated encryption bundle, rejecting mismatches, pinning only after verification, content-hash tightening, and concurrent first-contact trust behavior. Earlier focused test count was 38, later increased as regression tests were added. Do not treat those old counts as current totals.

### Phase 3 — Implement cross-device sent-message recovery: ACCEPTED FOR TESTED BEHAVIOR

Scope:
- Add `recipient_identity_public_key` to outgoing direct-text metadata.
- Validate that key before encryption and record the exact key used.
- Decrypt sent server ciphertext using the restored sender identity and recorded recipient key.
- Retain local encrypted sender copies as the fast display path.
- Best-effort fallback for older messages without a recorded recipient key.
- Fail closed to an unavailable state rather than exposing ciphertext.

Implementation/test evidence:
- Outgoing envelope records `metadata.recipient_identity_public_key`.
- Recipient key is validated and checked against the trusted-key policy before encryption.
- Sent history prefers the local encrypted sender copy when its envelope hash matches; otherwise it attempts server-envelope recovery.
- Legacy fallback can use the authenticated current recipient bundle as a candidate, but NaCl authentication must succeed.
- Recovery failure returns unavailable content, not ciphertext.
- Tests cover a legacy message with no local sender copy and a valid-length but incorrect fallback key failing closed.
- Reported command: `npx vitest run lib/messenger/e2ee/direct-message.test.ts lib/messenger/e2ee/trust-store.test.ts` → 2 files, 43 tests passed (20 direct-message, 23 trust-store).
- Reported command: `npx tsc --noEmit` → clean exit.
- These are local results reported by the user, not an independently rerun CI result.

**Rule:** Do not reopen `lib/messenger/e2ee/direct-message.ts` unless there is a reproducible defect or a specific guide requirement it fails. The Phase 3 test results do not prove end-to-end mobile interoperability or all UI/history integration.

## Existing remaining roadmap — preserve exact phase numbering

### Phase 4: Correct preview behavior (Priority: Medium)
- Remove “Encrypted message” as the permanent fallback.
- Implement type-based preview fallbacks.
- Ensure local decrypted previews take precedence where available.
- Apply consistently to Chats, Favorites, and Archive.
- Preserve existing group preview behavior.

### Phase 5: Finish the recovery UX (Priority: Medium)
- Add “Check for updated backup.”
- Implement original-device replacement instructions.
- Keep unsupported-format recovery separate from incorrect-PIN handling.
- Make recovery gating independent of dialog visibility.
- Preserve existing state on retrieval failures.

### Phase 6: Complete the lifecycle and plaintext audit (Priority: High before declaring implementation complete)
- Inspect message editing, optimistic-send, REST history, socket receive, logout, and account-switch paths.
- Run the existing tests and add missing tests for acceptance criteria.
- Evaluate the implementation as a whole, not merely as cryptographic functions.

Do **not** replace Phase 4 with a newly invented “end-to-end acceptance” phase. Baseline tests and integration verification can be performed as preparation or within the relevant planned phase, but must not renumber the roadmap.

## Remaining guide-level checks to track

These are verification tasks, not all confirmed bugs:

1. Confirm web backup behavior is restore-only: GET only; no web PUT/DELETE and no web identity generation.
2. Test backup GET response envelope and missing/malformed payloads, 404, network/timeout, 401 and 5xx; retrieval failure must preserve existing state and allow retry.
3. Map every strict backup-validation and PIN/KDF/decryption failure case in the current guide to a test, including boundary iteration values and optional `updated_at`.
4. Test the actual Messenger recovery entry point, including no backup, unsupported format, incorrect PIN, recovery gating, retry, logout and account switch during recovery.
5. Verify mobile↔web interoperability against actual server-returned messages, including restored sent history after local sender copies are removed.
6. Phase 4: preview behavior across Chats, Favorites, Archive, all relevant message types, local decrypted preview precedence, and preserved group previews.
7. Phase 5: updated-backup check, original-device replacement instructions, distinct unsupported-format vs wrong-PIN states, gating independent of dialog visibility, state preservation on fetch failure.
8. Phase 6: edits must use a fresh nonce and update envelope fields consistently; optimistic sends must not persist plaintext; REST history/socket paths must not leak ciphertext; duplicate events must merge by server message ID; logout/account switch must not leave key or plaintext leakage.
9. Audit sensitive-data sinks: console, analytics, telemetry, error reporting, query/devtools persistence, and other caches.
10. Review relevant CSP, output encoding and message-rendering paths. Do not treat crypto tests as proof of application security.
11. Keep v1 decrypt compatibility and do not rewrite old ciphertext in place. Independent-device identities, prekeys, ratchets, device revocation, and group E2EE are deferred unless separately approved.

## Likely code/test areas

- `lib/messenger/e2ee/direct-message.ts`
- `lib/messenger/e2ee/direct-message.test.ts`
- `lib/messenger/e2ee/trust-store.ts`
- `lib/messenger/e2ee/trust-store.test.ts`
- `lib/messenger/e2ee/backup-validation.ts`
- `lib/messenger/e2ee/backup-validation.test.ts`
- `lib/messenger/e2ee/backup-recovery.ts`
- `lib/messenger/e2ee/backup-recovery.test.ts`
- `lib/messenger/e2ee/identity-store.ts`
- `lib/messenger/e2ee/identity-store.test.ts`
- `lib/messenger/e2ee/runtime.ts`
- `lib/messenger/e2ee/runtime.test.ts`
- `lib/messenger/e2ee/local-message-store.ts`
- `lib/messenger/e2ee/local-preview.ts`
- `components/messenger/messenger-e2ee-recovery-surface.tsx`
- `components/messenger/messenger-e2ee-recovery-surface.test.tsx`
- `components/messenger/messenger-e2ee-bootstrap.tsx`

Inspect the current guide and current branch before acting. Do not assume the listed files or implementation are unchanged.

## Recommended continuation in the new conversation

1. Read this handoff and fetch the current `E2EE-KEY-BACKUP-WEB-IMPLEMENTATION.md` from `main`, plus the current branch head and relevant implementation.
2. Confirm the current Git branch/HEAD and working-tree state in the user's local checkout; the GitHub branch may have moved since this handoff.
3. Run the full relevant E2EE test suite and `npx tsc --noEmit`; record exact counts/errors as a baseline. Do not start a broad refactor before knowing the baseline.
4. Resume at **Phase 4: Correct preview behavior**, because Phase 3 is accepted and Phases 4–6 are already the user's planned roadmap.
5. Trace current preview derivation and rendering across Chats, Favorites, Archive, and group chats. Identify the actual preview data source and existing type definitions before coding. Add focused regression tests, implement the smallest change, then run focused tests, full relevant tests, and TypeScript.
6. Keep a short phase ledger: acceptance criteria, files changed, commands/results, unverified items, and next blocker.

## Security and implementation constraints

- Never log PINs, private/secret key material, decrypted backup payloads, or plaintext message bodies.
- Never show ciphertext to users as fallback content. Use an unavailable/appropriate type-specific state.
- Keep identity/trust persistence account-scoped; do not move private keys into localStorage.
- Do not overwrite an existing identity during failed recovery.
- Guard async recovery against logout and account switching.
- Keep the user's existing phase boundaries and names.
