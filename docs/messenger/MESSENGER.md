# Messenger — Project Status

*This is the file to open after being away from the project. Detailed scope lives in `MESSENGER-SCOPE.md`, architecture reasoning in `DECISIONS.md`, career evidence in `CAREER-EVIDENCE.md`. Phase 0 reconnaissance detail is archived in `docs/messenger/archive/` — not needed for day-to-day work, kept for reference.*

## What we're building

A web Messenger client (`unknown-web`, Next.js 15) porting the existing React Native Messenger (`unknown`) — direct chat, groups/communities, status/stories, scheduling, polls, calling, and AppsCombo Live. Full ticket-level scope is in `MESSENGER-SCOPE.md`.

## Current architecture

- **HTTP:** every Messenger call goes through an `app/api/chats/...` BFF proxy route (existing app convention — see `DECISIONS.md` D-001). Browser JS never sees the access token.
- **Sockets:** one connection, owned by `lib/messenger/socket-manager.ts`. No feature code calls `io()` directly. Auth is pluggable behind `lib/messenger/socket-auth.ts` (`DECISIONS.md` D-002, D-003).
- **Types:** `types/messenger/` enforces `Uuid` vs `Pkid` as distinct branded types — never a bare `userId`.
- **Query keys:** `lib/messenger/query-keys.ts`, Tier-1 only (chats/groups/statuses) — extended per-milestone, not pre-built.
- **Zustand:** `store/*.store.ts` convention (matches the majority of the existing app). Only `messenger-connection.store.ts` exists so far (socket status) — one store per genuine need, not pre-created.

## Current milestone

**M1 — Core Messenger shell: UI/UX recon done, five product decisions pending your call (see below), buildable core (layout, list read path, conversation read/send/typing/delivery) starting now.**

## Milestone roadmap

```
M0  Foundation ✅                    → M1 Core shell (chat list + direct conversation) ← next
M2  Chat-list & message interactions → M3 Groups core
M4  Messenger profile                → M5 Status/stories
M6  Polls (∥ M7 Scheduling)          → M8 Calling (signaling investigation → build)
M9  Communities (∥ M10 Moderation)   → M11 AppsCombo Live
M12 Cross-cutting hardening
```

Full milestone plan (dependency reasoning, what's in/out of scope per milestone) is archived at `docs/messenger/archive/03-milestone-plan.md` — the sequence above is the part that stays live.

## Constraints

- Tiered scope: Tier 1 (chat, interactions, profile, groups, status) gets strongest production treatment; Tier 2 (scheduling, polls, calling) built where mobile/guide evidence is sufficient; Tier 3 (communities, AI moderation, Live) attempted but tracked as highest-risk.
- **Evidence discipline carries forward into every milestone:** actual mobile behavior > Jira > stale docs/manifests. Don't invent backend capability. Surface conflicts rather than quietly resolving them.
- **No Messenger feature may know how the socket credential is obtained.** All socket auth goes through `socketAuthProvider` — this is what makes the temporary-to-production auth migration (D-003) a one-file change instead of a rewrite.
- **TypeScript baseline:** `npx tsc --noEmit -p tsconfig.json` has **10 pre-existing errors, all in `__tests__/*`**, confirmed unrelated to Messenger (zero overlap with any `messenger`-path file). This baseline was established before Messenger work began. Every milestone's verification step should report: pre-existing failures (this baseline) / failures introduced by the milestone / unrelated environmental-tooling failures — as three distinct buckets, not lumped together.

## Open / blocked

- **Production socket authentication** — backend decision pending between cookie-based handshake vs. short-lived credential (D-003). Does **not** block development; the temporary mechanism is implemented and empirically confirmed against the real backend.
- **Call/Live socket behavior** — not yet tested; deferred on purpose to M8/M11, once their event/signaling contracts are reverse-engineered. Not a current blocker.
- **Status likes/comments** — no backend evidence found anywhere in mobile. Needs backend/product confirmation before M5 builds it.
- **AI moderation approve/decline** — same: only the read-only spam listing appears to exist. Needs backend/product confirmation before M10 builds it.
- **Community access-level hierarchy** — Jira describes a Level 1/Level 2 concept with no matching field found in traced mobile types. Needs confirmation before M9 designs that UI.

### M1 UI/UX — needs your call before these specific pieces get built (not blocking the buildable core)

1. **Groups filter chip** in the chat list — visually present but disabled until M3, or omitted entirely? Mobile has no such chip (Groups is a separate tab there); the approved web design shows one, Jira lists it as a filter category. Recommendation: present, disabled.
2. **"+Create" button** — most likely "start a new chat" (needed for M1 to be usable at all — there's currently no way to originate a conversation that isn't already in history), possibly "create custom list" (more naturally M2/APPC-6-7). Recommendation: new chat.
3. **Composer affordances beyond text** — text send is unambiguous M1 scope; emoji/attach/mic are in the design but M1's scope line doesn't call out media sending. Recommendation: text fully wired, other icons present but inert, non-text messages still rendered (read-only) in history since real history will contain them regardless of send support.
4. **Archive folder row / per-chat pin indicator** — prominent in the design, but archiving/pinning are chat-list *actions* that read more like M2 (APPC-6/7) than M1. Building M1 without them means the shipped UI won't be pixel-complete against the reference screenshots on day one.
5. **Conversation header call/video icons** — calling is M8; recommendation is present-but-disabled rather than hidden, consistent with #1.

Full reasoning for each in the M1 kickoff conversation. Once resolved, remove from this list and fold into `MESSENGER-SCOPE.md` / `DECISIONS.md` as appropriate.

## Recent decisions

- **2026-08-11** — Temporary socket auth (D-003) implemented and confirmed against the real `socket.appscombo.com`: query-string token accepted, connection stable.
- **2026-08-11** — Socket consolidation (D-002) empirically validated for the event families actually tested so far: a single connection carried both a `chat:typing` emit and a `group:join` emit (real group id) without rejection or disconnect. This is evidence for chat + group multiplexing specifically — **not** a claim that one socket handles every Messenger domain; call/live remain unverified until M8/M11.

Full reasoning for all decisions: `DECISIONS.md`.

## Immediate next action

Start **M1 — Core Messenger shell**, scoped exactly as the roadmap above: Messenger route/layout, chat list (+ unread badges + realtime preview updates), direct conversation (history pagination, HTTP-durable optimistic send, delivery/seen, typing). Nothing from M2+ pulled forward.