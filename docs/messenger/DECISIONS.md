# Messenger — Architecture Decisions

*Only decisions that materially affect architecture, security, contracts, or future implementation. Compact by design — full original reasoning (options considered, trade-offs) for D-001–D-003 is archived at `docs/messenger/archive/decisions/` if you need the deeper context. New decisions get appended here, not as new files.*

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

**Status:** Temporary implementation **Implemented and confirmed working** against the real backend (2026-08-11). Production mechanism (cookie-based handshake vs. short-lived credential) **Pending** — exact question for backend: *does the socket server support authenticating via the `ac_token` httpOnly cookie during the Socket.IO handshake, or should we mint a short-lived credential server-side?*

**Consequence / migration path:** No Messenger feature knows the credential comes from a query parameter — everything goes through `socketAuthProvider`. When backend confirms the production mechanism, only `socket-auth.ts` (and possibly the credential route) changes. This ADR's Status gets updated, not deleted, once that happens.

**Security constraint (stays in force until resolved):** Never treat this as the production security model. Never let another feature construct its own `io(url?token=...)` call. Never log the full connection URL.

---

## D-004 — Messenger route group bypasses the Social dashboard shell

**Decision:** Messenger lives in its own route group, `app/(messenger)/messenger/`, not nested under `app/(dashboard)/`. Its `layout.tsx` reuses the existing `<TopBar />` component directly but renders a new `<MessengerRail />` instead of the Social `<Sidebar />`.

**Why:** `app/(dashboard)/layout.tsx` unconditionally wraps `{children}` in the Social sidebar (Home/Settings/Bookmarks/AI/Invite) — Next.js layouts can't be opted out of by a child route. The approved Messenger design (see M1 UI/UX findings) has no Social sidebar, so Messenger structurally cannot live under `(dashboard)`. This isn't a preference, it's a consequence of how the existing layout is coded.

**Status:** Implemented as the M1 routing plan; component code not yet written.

**Consequence:** `<TopBar />` is used in two separate layout trees (`(dashboard)` and `(messenger)`) rather than one — acceptable duplication since it's the same component, not reimplemented. If a Messenger-specific top-bar need ever arises (e.g. a different search scope), it becomes a prop on the shared component, not a fork.

---

## Log

| Date | Decision | Status change |
|---|---|---|
| 2026-08-11 | D-001, D-002, D-003 established (M0) | — |
| 2026-08-11 | D-002 | Draft hypothesis → empirically validated for chat + group |
| 2026-08-11 | D-003 | Draft → temporary implementation confirmed working against real backend; production still Pending |
| 2026-08-12 | D-004 established (M1 kickoff) | — |