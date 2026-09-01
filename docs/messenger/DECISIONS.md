# Messenger — Architecture Decisions

_Only decisions that materially affect architecture, security, contracts, or future implementation. Compact by design — full original reasoning (options considered, trade-offs) for D-001–D-003 is archived at `docs/messenger/archive/decisions/` if you need the deeper context. New decisions get appended here, not as new files._

---

## D-001 — BFF proxy pattern extended to Messenger

**Decision:** Every Messenger HTTP endpoint (`chats/*`, `groups/*`, `statuses/*`, etc.) gets an `app/api/...` Route Handler mirroring the existing `app/api/users/*` pattern — reads the httpOnly `ac_token` cookie server-side, attaches `Authorization: Bearer`, proxies to Django.

**Why:** It's what the whole app already does for auth. Calling Django directly from the browser would mean exposing the token to client JS and duplicating the refresh flow — not a real trade-off, just "follow the existing pattern."

**Status:** Implemented (`app/api/chats/{route,history/[uuid],messages}/route.ts`).

**Consequence:** Messenger inherits the app's existing 401-refresh-retry and error handling for free. No migration path needed — this isn't expected to change.

---

## D-002 — Socket lifecycle abstraction & connection topology

**Decision:** One `MessengerSocketManager` (`lib/messenger/socket-manager.ts`) owns connect/reconnect/reauth/room-rejoin/cleanup behind an interface (`on`/`emit`/`joinRoom`/`disconnect`). No feature code calls `io()` directly. Currently opens exactly **one** Socket.IO connection, on the hypothesis that mobile's three separate connections (chat/call/live, same host, three different auth shapes) are organic duplication rather than a backend requirement.

**Why:** The guide explicitly recommends one socket per session. Being wrong is cheap specifically because of the abstraction — only `socket-manager.ts`'s internals would need to change to open a second connection, not every feature hook built on top of it.

**Status:** **Empirically validated for chat + group events**, 2026-08-11, against the real `socket.appscombo.com` (not a mock): single connection accepted the temporary auth, stayed open through a `chat:typing` emit and a `group:join` emit against a real group id, no rejection or disconnect. **Not yet tested:** call/live event families — deliberately deferred to M8/M11 once those signaling contracts are reverse-engineered. Don't read the current evidence as "one socket handles all of Messenger" — it specifically supports chat + group multiplexing.

**Consequence / migration path:** If M8/M11 reconnaissance finds the backend needs separate connections for call/live, `socket-manager.ts` opens a second managed `Socket` and routes by event-name prefix — the public interface (`messengerSocket.on/emit/joinRoom`) doesn't change, so nothing built in M1–M7 needs rework.

---

## D-003 — Temporary socket authentication during development

**Decision:** Until the backend confirms a production socket-auth mechanism, the client authenticates Socket.IO connections with the normal access token in the query string (`GET /api/messenger/socket-credential` reads the httpOnly cookie server-side and returns the raw token for this one purpose; `lib/messenger/socket-auth.ts`'s `socketAuthProvider` puts it in the connection query). This mirrors mobile's current pattern and is explicitly named by the guide as an acceptable temporary compatibility fallback.

**Why:** Unblocks realtime development now instead of waiting on a backend answer with no ETA. Deliberately does **not** weaken the HTTP auth architecture (D-001) — the httpOnly cookie is untouched; only this one dev-only route exposes the token, and only for the socket handshake.

**Status:** Temporary implementation **Implemented and confirmed working** against the real backend (2026-08-11). Production mechanism (cookie-based handshake vs. short-lived credential) **Pending** — exact question for backend: _does the socket server support authenticating via the `ac_token` httpOnly cookie during the Socket.IO handshake, or should we mint a short-lived credential server-side?_

**Consequence / migration path:** No Messenger feature knows the credential comes from a query parameter — everything goes through `socketAuthProvider`. When backend confirms the production mechanism, only `socket-auth.ts` (and possibly the credential route) changes. This ADR's Status gets updated, not deleted, once that happens.

**Security constraint (stays in force until resolved):** Never treat this as the production security model. Never let another feature construct its own `io(url?token=...)` call. Never log the full connection URL.

---

## D-004 — Messenger route group bypasses the Social dashboard shell

**Decision:** Messenger lives in its own route group, `app/(messenger)/messenger/`, not nested under `app/(dashboard)/`. Its `layout.tsx` reuses the existing `<TopBar />` component directly but renders a new `<MessengerRail />` instead of the Social `<Sidebar />`.

**Why:** `app/(dashboard)/layout.tsx` unconditionally wraps `{children}` in the Social sidebar (Home/Settings/Bookmarks/AI/Invite) — Next.js layouts can't be opted out of by a child route. The approved Messenger design (see M1 UI/UX findings) has no Social sidebar, so Messenger structurally cannot live under `(dashboard)`. This isn't a preference, it's a consequence of how the existing layout is coded.

**Status:** Implemented as the M1 routing plan; component code not yet written.

**Consequence:** `<TopBar />` is used in two separate layout trees (`(dashboard)` and `(messenger)`) rather than one — acceptable duplication since it's the same component, not reimplemented. If a Messenger-specific top-bar need ever arises (e.g. a different search scope), it becomes a prop on the shared component, not a fork.

---

## D-005 — Socket listener registration must not depend on call order relative to `connect()`

**Context:** Real-world testing after M1 surfaced intermittent typing indicators, inconsistent realtime message delivery, and an unreliable unread badge — all pointing at the same underlying cause rather than three separate bugs.

**Root cause:** `doConnect()` awaits the credential fetch (a real HTTP round-trip, D-003) _before_ `this.socket` is ever assigned. `on()` previously did `this.socket?.on(...)` directly — if a feature hook's effect (e.g. `useChatSocket`, `useTyping`) ran during that window, the call silently no-op'd and the handler was **never attached, permanently**, since nothing remembered the registration for later. Whether a given page load lost this race depended on network timing, which is exactly why the symptom was intermittent rather than a clean always-fails bug.

**Decision:** `MessengerSocketManager` now keeps a persistent `listeners` map. `on()` always registers there first and attaches immediately only if a socket already exists; whenever `doConnect()` creates a socket, every registered listener is replayed onto it. Call order relative to `connect()` completing no longer matters. `emit()` is deliberately left as fire-and-drop, not queued — an emit carries a point-in-time payload (e.g. typing state) where replaying a stale one later would show incorrect state, unlike a listener registration.

**Status:** Implemented, 2026-08-14.

**Consequence:** No feature-hook code changed — this was entirely internal to `socket-manager.ts`, which is the whole point of keeping the lifecycle behind one abstraction (D-002). Worth a fresh empirical pass on the "typing/realtime/badge" symptoms to confirm this was the full explanation rather than assuming it — see MESSENGER.md.

---

## D-006 — Read-after-write overlay for chat-list mutations

**Context:** Mobile's `use-chats.ts` documents a confirmed backend quirk: a successful POST/DELETE on `/chats/favorites` is occasionally not reflected by the very next GET, so a naive refetch-after-mutation can show stale data for a few seconds. Mobile works around this with a favorites-specific tombstone/pending-add mechanism. M2 needed the same protection for pin/mute/archive/block too — same API family, same plausible risk, and no reason to assume only favorites has it.

**Decision:** Generalized mobile's mechanism into one small reusable module (`lib/messenger/list-overlay.ts`, ~60 lines) instead of five copy-pasted versions. One overlay = one pending mutation's effect on one list, expressed as an `apply` transform plus an `isSettled` check; reconciled every time fresh server data lands (via each list query's `select`). Explicitly not a generic state-management framework — no subscriptions, no middleware, nothing beyond one in-memory Map per logical list.

**Why:** Proportional to the actual, evidence-confirmed problem (toggle/membership mutations on the chat list having read-after-write lag), not a speculative abstraction. Every M2 mutation that needed it (pin, mute, archive, block, favorite add/remove) uses the exact same ~10-line pattern rather than five different ad-hoc workarounds.

**Status:** Implemented, 2026-08-18.

**Consequence:** If a genuinely different shape of staleness problem shows up later (not "an optimistic list mutation racing a lagged read"), solve that directly rather than stretching this module to cover it — that's the deliberate boundary on what this is for.

## D-007 — No frontend compensation for missing group-admin realtime events; refetch-on-mount parity with mobile

**Context:** Multi-account testing showed other group members don't see admin mutations (member add/remove, role/permission changes, pause/resume) until revisiting the screen. Investigation of mobile's confirmed socket contract found no realtime event exists for any of these mutations on either client — mobile's only mitigation is `refetchOnMount: "always"`, which web lacked.

**Decision:** Adopted mobile's exact mitigation on `useGroupList`/`useGroupDetail`/`useGroupMembers`. Explicitly declined any additional frontend compensation (polling, synthetic events, cross-client optimistic patching) for the confirmed absence of a push contract. Residual member-addition lag (persists past a hard reload) is logged as an external backend dependency, not engineered around.

**Why:** The project's scope boundary prohibits inventing backend capability. Mobile — mature, already shipped — doesn't have this event either, so there's no evidence one exists to be "missed." A workaround would misrepresent a product-wide gap as a solved web problem, and would need undoing the moment backend ships real events.

**Trade-offs:** Other members see admin/membership changes only on next visit, not live — matches mobile's actual current behavior, not a web regression, but a real UX gap versus what design/Jira likely assumes.

**Consequences:** If backend adds these events later, only `use-group-socket.ts`'s listener registration changes — `groupKeys.members/detail/list` invalidation already exists and just needs to be triggered by a socket handler instead of only on mount.

**Revisit conditions:** Backend ships realtime group-admin events, or confirms/resolves the member-addition propagation lag.

---

## Log

| Date       | Decision                             | Status change                                                                                                           |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-08-11 | D-001, D-002, D-003 established (M0) | —                                                                                                                       |
| 2026-08-11 | D-002                                | Draft hypothesis → empirically validated for chat + group                                                               |
| 2026-08-11 | D-003                                | Draft → temporary implementation confirmed working against real backend; production still Pending                       |
| 2026-08-12 | D-004 established (M1 kickoff)       | —                                                                                                                       |
| 2026-08-14 | D-004                                | Planned → Implemented                                                                                                   |
| 2026-08-14 | D-005 established                    | Socket listener registration race fixed                                                                                 |
| 2026-08-15 | M1 closed                            | 2 known issues (badge inconsistency, delayed seen-tick) documented and deferred — see MESSENGER.md                      |
| 2026-08-18 | D-006, D-007 established (M2)        | Overlay pattern Implemented                                                                                             |
| 2026-08-27 | D-008 established                    | Refetch-on-mount parity adopted; group-admin realtime push confirmed absent from backend, logged as external dependency |
