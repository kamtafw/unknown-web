# Messenger — Project Status

_This is the file to open after being away from the project. Detailed scope lives in `MESSENGER-SCOPE.md`, architecture reasoning in `DECISIONS.md`, career evidence in `CAREER-EVIDENCE.md`. Phase 0 reconnaissance detail is archived in `docs/messenger/archive/` — not needed for day-to-day work, kept for reference._

## What we're building

A web Messenger client (`unknown-web`, Next.js 15) porting the existing React Native Messenger (`unknown`) — direct chat, groups/communities, status/stories, scheduling, polls, calling, and AppsCombo Live. Full ticket-level scope is in `MESSENGER-SCOPE.md`.

## Current architecture

- **HTTP:** every Messenger call goes through an `app/api/chats/...` BFF proxy route (existing app convention — see `DECISIONS.md` D-001). Browser JS never sees the access token.
- **Sockets:** one connection, owned by `lib/messenger/socket-manager.ts`. No feature code calls `io()` directly. Auth is pluggable behind `lib/messenger/socket-auth.ts` (`DECISIONS.md` D-002, D-003).
- **Types:** `types/messenger/` enforces `Uuid` vs `Pkid` as distinct branded types — never a bare `userId`.
- **Query keys:** `lib/messenger/query-keys.ts`, Tier-1 only (chats/groups/statuses) — extended per-milestone, not pre-built.
- **Zustand:** connection status lives in `stores/messenger-connection.store.ts` (plural `stores/`, per how the repo actually merged — noting this since M0/M1 originally targeted the singular `store/` convention). One store per genuine need, not pre-created.

## Current milestone

**M4 — Messenger profile: kickoff.** M3 is functionally complete from the web side (realtime propagation of group-admin mutations to other members remains a backend dependency — see M3 known issues). M4 scope: profile info (name/phone/username), actions (message/call/share/mute/block/report), content (media/docs/links). Investigation below confirms most of the surface can be assembled from reused primitives plus three new, mobile-confirmed endpoints — not a from-scratch build.

## Milestone roadmap

```
M0  Foundation ✅                    → M1 Core shell ✅ (2 known issues deferred, see below)
M2  Chat-list & message interactions → M3 Groups core   ← next
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
- **TypeScript baseline:** `npx tsc --noEmit -p tsconfig.json` has **66 pre-existing errors as of 2026-08-18** — the original 10 in `__tests__/*`, plus **56 new ones introduced by an unrelated, apparently-incomplete parallel refactor** (`socials-polymorphic-migration`, merged separately from Messenger work) that moved types out of `types/api.ts` into `types/socials/api.ts` without finishing all the exports (`FullUser`, `OtpDefault`, `ExternalLink`, etc. are missing from the new location). Confirmed zero overlap with any `messenger`-path file. **This also currently breaks `next build` entirely for the whole app** (Next's build-time type-check fails on the same missing exports) — worth flagging to whoever owns that migration, since it's not something Messenger work should fix, but it does mean a full production build can't be used to verify _any_ feature (including Messenger) until it's resolved. Every milestone's verification step should report pre-existing / introduced / environmental failures as three distinct buckets against this updated baseline.

## M1 known issues (deferred)

Both surfaced in real-world testing, survived two rounds of confirmed, real fixes (see `DECISIONS.md` D-005 and the 2026-08-15 log entry), and were deliberately deferred rather than continuing to debug without live reproduction access. Revisit after chat-adjacent work (M2–M5ish) rather than blocking M2 now — neither affects core message delivery, only a status indicator.

**1. Unread badge — inconsistent across browsers (confirmed present in Edge, works in Brave)**

What's already ruled out: the two confirmed root causes from round 1 (an inverted fallback condition, an overly-aggressive visibility-triggered reconciliation racing with optimistic updates) — both fixed, both verified by re-reading the code, but the symptom persisted after retesting.

Current leading hypotheses, in order of likelihood:

- **Backend read-after-write timing.** If `unread_count` isn't updated synchronously server-side (e.g. an async worker/queue processes it), any client-side refetch shortly after an action can legitimately return stale data regardless of how careful the client caching is. This can't be fixed or ruled out from the client alone — see the backend question below.
- **Browser-specific tab-throttling behavior affecting when the underlying WebSocket actually drops/reconnects.** Edge's background-tab handling differs from Brave's; if the socket disconnects more readily in one, events genuinely get missed until the next reconnect-triggered reconciliation.
- **An actual `chat:receive`/`chat:status` payload-shape difference that only manifests in some real scenarios** — the dev-only `console.debug("[messenger] chat:receive payload", ...)` in `use-chat-socket.ts` is still in place for exactly this; hasn't yet produced a payload that looked wrong, but hasn't been captured during an actual failure, only during working cases.

Next diagnostic step: capture the console.debug output specifically during a failure (not just any receive), in both browsers, and compare. Also worth checking the Network tab's WS → Messages/Frames view directly during a failure to see whether the event arrives at all versus arrives-but-mishandled.

**2. Blue "seen" tick — doesn't appear for messages read while the recipient is online; only appears after a reload**

What's already ruled out: the confirmed sender/receiver ambiguity bug in the `chat:status` handler (fixed — it now searches all cached conversations instead of trying to resolve a single ambiguous "peer" uuid). Symptom persisted after retesting.

Current leading hypothesis: **the backend may not actually be broadcasting a `chat:status` (or equivalent) event back to the sender when the receiver's PATCH-to-seen completes** — i.e. this may not be a client bug at all. The client-side PATCH (`chatApi.updateStatus(id, "seen")`) fires correctly on the receiving end; whether the backend turns that into a realtime push back to the original sender is outside client control and unconfirmed. This is the more likely of the two remaining issues to be a genuine backend gap rather than a client bug — see the backend question below.

**Backend questions worth asking now, given both issues survived confirmed client-side fixes:**

- Is `unread_count` updated synchronously when a message is sent/marked seen, or via an async pipeline with some delay?
- Does marking a message "seen" (via the PATCH `chats/messages/:id/status` endpoint) trigger a `chat:status` broadcast back to the _original sender_, not just persist the status? If the backend only persists it without broadcasting, the client would only ever see it on the next HTTP fetch — which matches the exact symptom reported.

- **Production socket authentication** — backend decision pending between cookie-based handshake vs. short-lived credential (D-003). Does **not** block development; the temporary mechanism is implemented and empirically confirmed against the real backend.
- **Call/Live socket behavior** — not yet tested; deferred on purpose to M8/M11, once their event/signaling contracts are reverse-engineered. Not a current blocker.
- **Status likes/comments** — no backend evidence found anywhere in mobile. Needs backend/product confirmation before M5 builds it.
- **AI moderation approve/decline** — same: only the read-only spam listing appears to exist. Needs backend/product confirmation before M10 builds it.
- **Community access-level hierarchy** — Jira describes a Level 1/Level 2 concept with no matching field found in traced mobile types. Needs confirmation before M9 designs that UI.

### M1 UI/UX — needs a call before these specific pieces get built (not blocking the buildable core)

1. **Groups filter chip** in the chat list — visually present but disabled until M3, or omitted entirely? Mobile has no such chip (Groups is a separate tab there); the approved web design shows one, Jira lists it as a filter category. Recommendation: present, disabled.
2. **"+Create" button** — most likely "start a new chat" (needed for M1 to be usable at all — there's currently no way to originate a conversation that isn't already in history), possibly "create custom list" (more naturally M2/APPC-6-7). Recommendation: new chat.
3. **Composer affordances beyond text** — text send is unambiguous M1 scope; emoji/attach/mic are in the design but M1's scope line doesn't call out media sending. Recommendation: text fully wired, other icons present but inert, non-text messages still rendered (read-only) in history since real history will contain them regardless of send support.
4. **Archive folder row / per-chat pin indicator** — prominent in the design, but archiving/pinning are chat-list _actions_ that read more like M2 (APPC-6/7) than M1. Building M1 without them means the shipped UI won't be pixel-complete against the reference screenshots on day one.
5. **Conversation header call/video icons** — calling is M8; recommendation is present-but-disabled rather than hidden, consistent with #1.

Full reasoning for each in the M1 kickoff conversation. Once resolved, remove from this list and fold into `MESSENGER-SCOPE.md` / `DECISIONS.md` as appropriate.

## Recent decisions

- **2026-08-11** — Temporary socket auth (D-003) implemented and confirmed against the real `socket.appscombo.com`: query-string token accepted, connection stable.
- **2026-08-11** — Socket consolidation (D-002) empirically validated for the event families actually tested so far: a single connection carried both a `chat:typing` emit and a `group:join` emit (real group id) without rejection or disconnect. This is evidence for chat + group multiplexing specifically — **not** a claim that one socket handles every Messenger domain; call/live remain unverified until M8/M11.
- **2026-08-14** — Fixed a socket-manager race (D-005): listener registration could silently lose a race against the async credential fetch, permanently dropping the subscription. Root cause of intermittent typing/delivery/badge behavior in the first round of real-world testing.
- **2026-08-15** — Fixed three more bugs surfaced by continued real-world testing, all in `hooks/messenger/use-chat-socket.ts`: an inverted condition that made the unread-badge fallback refetch fire exactly backwards (refetching on success, doing nothing on failure); a missing `return` that could throw on a malformed payload instead of degrading gracefully; and a sender/receiver ambiguity that silently misrouted real-time "seen" status updates for messages sent while the current user was the sender. Also removed an overly-aggressive "refetch on every tab visibility change" reconciliation that was racing with optimistic updates — reconciliation now only fires on a genuine socket reconnect.
- **2026-08-15** — **M1 closed.** The badge-inconsistency and delayed-blue-tick symptoms persisted after the above fixes despite two rounds of confirmed, real root-cause fixes. Decision: don't keep debugging blind without live reproduction access — document both precisely (see "M1 known issues (deferred)" above, including current leading hypotheses and the exact next diagnostic step) and move to M2. Neither issue affects core message delivery, only a status indicator.

Full reasoning for all decisions: `DECISIONS.md`.

## M2 findings worth knowing

- **Favorites is a genuinely separate collection**, not a status filter on the main chat list (M1 had this wrong — corrected in M2, see `lib/messenger/api.ts`).
- **Mute endpoint ambiguity resolved**: `chats/mute`/`chats/unmute` confirmed as the only implementation with any call site anywhere in mobile; the alternate `messenger/conversations/:id` PATCH is dead code.
- **Two real bugs found and fixed in `chatApi.list`**: the cursor param was being written under the `search` key (broke pagination silently), and a missing `?` produced a malformed query string whenever any filter/search was active. Both pre-dated M2 but were only caught while extending this file.
- **New reusable pattern (D-006)**: `lib/messenger/list-overlay.ts` generalizes mobile's documented favorites read-after-write lag workaround for reuse across pin/mute/archive/block.

## M3 findings worth knowing

- **M3 read-path slice complete:** group types/contracts, `groupApi` (list/detail/history/markSeen), `useGroupList`/`useGroupDetail`/`useGroupHistory`, `GroupListPanel`/`GroupListItem`, `GroupConversationHeader`/`GroupConversationView` (read-only, reuses `MessageList`/`MessageBubble` via `groupMessageToMessage`), routes under `/messenger/groups` rail repurposed.
- **Known gaps, deliberately deferred to the next slice:** sending, permission-aware composer (pause vs. `can_members_send_messages` vs. admin override — still needs the verification you flagged: does pause override admin?), socket (`GROUP_SOCKET_EVENTS`, room join/rejoin, `group:delete` after HTTP delete), admin surfaces (members list/add/remove/role, permissions, pause toggle), threaded replies UI, no search on the Groups list (no confirmed backend param for it).
- **Confirmed risk carried forward:** `GroupChatHistoryData.next` = older messages (opposite naming from 1:1's `previous`) — documented in code, don't "fix" it to match.
- **GroupListItem has no created_at.** Genuine backend-contract limitation, not fixable client-side without an N+1 detail fetch per row. Current mitigation: no-message groups sort to the top instead of the bottom. If a real created-then-last-message ordering matters later, that's a backend request (created_at added to the list payload), not a client workaround.
- **"Leave group" (member self-exit) was omitted from the original M3 scope definition** and is intentionally deferred to M12 (cross-cutting hardening/product-completeness), not reopened into M3. This is a scope-sequencing decision, not an architectural one — no ADR. Mobile's `useLeaveGroup` (`chats/groups/:id/members/leave`) is confirmed and ready to port when M12 picks it up; nothing about M3's implementation blocks it.

## M3 known issues (backend dependency)

Confirmed via direct inspection of mobile's group socket contract (`hooks/messenger/use-group-socket.ts`) and admin mutation hooks (`hooks/messenger/use-groups.ts`): there is no `group:member:added`, `group:member:removed`, `group:role:changed`, `group:permissions:updated`, or `group:paused`/`resumed` event anywhere in the confirmed contract, on either client. Mobile's only mitigation is `refetchOnMount: "always"` on `useGetGroups` / `useGetGroup` / `useGetGroupMembers` — mobile doesn't push these to other members either, it just refetches aggressively on screen mount.

**Fixed on web (2026-08-27):** aligned `useGroupList`, `useGroupDetail`, `useGroupMembers` with mobile's `refetchOnMount: "always"` (web previously had only `staleTime: 30_000`, silently serving stale cache on remount — a strictly weaker mitigation for the same confirmed backend limitation). This resolved:

- Member removal — now reflects on revisit.
- Role/permission/pause changes — now reflect on revisit.

**Remaining, not client-fixable:** member _addition_ still shows real backend propagation delay — the added member doesn't see the group even after a hard reload + revisit, observed potentially exceeding a minute. A hard reload gets a fresh `QueryClient` and refetches unconditionally, so the client cannot be the cause. Same category as the confirmed favorites read-after-write lag (D-006), asymmetric with removal in a way worth flagging directly to backend rather than guessing at.

**Decision:** no frontend workaround (polling, timers, synthetic socket events) will be built for this — see D-008. Treated as an external backend dependency.

**Backend questions:**

- Is a realtime broadcast planned for group membership/admin-state changes over the existing Socket.IO connection (same transport as `group:message`/`group:status`)?
- If so, what event names/payloads are intended for: member added, member removed, role changed, permissions updated, group paused/resumed?
- Is `chats/groups/:id/members/sync`'s write followed by sync or async propagation to the list/detail/members read paths? Member addition specifically shows lag well past a hard reload.
- Removal propagates faster/more reliably than addition on the read side — expected (different invalidation paths for add vs. remove), or itself informative?
