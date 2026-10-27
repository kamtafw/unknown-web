# Events: Pass 4 handoff (live events and the deferred admission work)

**Status (2026-10-26, updated after the owner's review): the plan below is accepted as the planning baseline with the decisions in section G. Only P4-01 was authorised, and it is implemented and awaiting review (section G). Every other task is not started.** *(Original status: PLANNING ONLY. Nothing in Pass 4 is started and no task here is authorised.)* This document is a proposal for the owner's approval. It was written from the repository at branch `feat/events-p3-10-integration` (P3-10 closeout commit `53d98cd`; accepted work up to `016135f`), the backend guide (Project doc `events-api-web-implementation-guide.md`, cited `guide §n`) and the three Events documents. No application code was changed to produce it.

Predecessors: `PHASE-2-HANDOFF.md` (historical), `PHASE-3-HANDOFF.md` (Pass 3 source of truth, including the Pass 3 acceptance record in its section 11.1), `EVENTS.md` (assumptions A-n, issues EV-nnn) and `PROGRESS.md` (evidence record).

Evidence labels are the same as `PHASE-3-HANDOFF.md`: **[repo]** read in the repository now; **[guide]** stated by the guide and **not** verified against the deployed backend (no live-backend call has ever been made from this work); **[reported]** reported by the owner; **[proposal]** a suggestion made here, open to change. Where the repository or the guide is silent this document says so and does not fill the gap.

---

## A. Current baseline

### A.1 Accepted work

| Work | Status | Reference |
| --- | --- | --- |
| Pass 1: discovery (25 km, no fallback) and My events | Owner-accepted | branch `feat/events-phase1`, `8c72db1` (do not touch) |
| Pass 2: details, create, edit, delete, RSVP | Implemented, owner-smoke-tested, not verified live | checkpoint `a96887b` |
| P3-02 to P3-07: read layer, pane sections, links and documents, comments read and post, guest list | Owner-accepted | `cf8a4e8`, `549bfca`, `a9b4c95`, `5319f96`, `d73238f`, `6e2c365` |
| P3-08A: host removes a guest | Owner-accepted | `55d94e7` |
| P3-10: integration and acceptance (test and documentation work) | Owner-accepted 2026-10-26 | `33cf637` (invalidation matrix test), `016135f`, closeout `53d98cd` |
| **P3-08B: add a guest** | **Deferred by owner decision**; D-2 unresolved | `PHASE-3-HANDOFF.md` section 7.3 |
| **P3-09: join and leave** | **Deferred to Pass 4 by owner decision (2026-10-25), to be handled alongside the WebSockets work; not implemented, not complete** | `PHASE-3-HANDOFF.md` section 3.2 |
| **Pass 3 as a whole** | **Not complete** while P3-08B and P3-09 stay deferred | |

Accepted branches are separate and not merged; `feat/events-pass3` and `feat/events-phase1` are not to be modified by Pass 4 planning or work.

### A.2 What exists in the code now [repo]

- **Routes (`app/api/events/`):** nearby, my-location, my-events, create, `[eventId]` (details, update, delete), rsvp, `[eventId]/resources`, `[eventId]/comments` (GET and POST), `[eventId]/guests` (GET), `[eventId]/guests/remove` (POST). **There is no BFF route for `join`, `leave`, `guests/add`, `live-session`, `live-session/start`, `live-session/end`, `update-live-status` or anything under `/live/`.**
- **Live-related data that already exists:** details and cards carry `isLive`; full details carry `liveSessionId` and `liveSessionStatus` (`lib/events/normalize.ts`, `types/events/api.ts`). They are display-only. The "Live now" chip and "LIVE NOW!" card text show from `isLive`. `room_id` and the attached-session summary (provider, media status, room name) are not retained by the normaliser beyond the id and status.
- **Delete guard:** the delete dialog is blocked for a live event or live session (`components/events/delete-event-dialog.tsx`), and the BFF answers 409 `event_live` after checking state (`app/api/events/[eventId]/route.ts`; EV-025: a courtesy, not a security boundary).
- **Passcodes:** handled only in the Phase 2 create and edit form, validation and request builder (four ASCII digits kept as strings, written in the request body, never in a URL; `lib/events/validation.ts`, `lib/events/request.ts`, `components/events/form/access-field.tsx`). **Nothing collects a passcode to join.** The preview note in `components/events/event-details-view.tsx` already says "If it has a passcode, you'll be asked for it when you join", which is not yet true.
- **Guests, comments, RSVP:** guest list (read) and host remove exist; comments read and post exist; RSVP exists and is independent of membership (guide §4.9). Comment posting needs an **online** guest row (guide §4.15), so it is affected by join and leave (see C.4).
- **Sockets in the repository:** `socket.io-client` is the only realtime dependency (`package.json`). The only socket code is Messenger's: `lib/messenger/socket-manager.ts` (one connection; reconnect; listener replay; room-join replay), `lib/messenger/socket-auth.ts` (**temporary**, ADR-003: the access token is fetched from `app/api/messenger/socket-credential/route.ts` and sent in the query string, marked not production-ready), `stores/messenger-connection.store.ts`, `components/messenger/messenger-socket-bootstrap.tsx` (mounted in the Messenger layout only) and `docs/messenger/archive/decisions/ADR-002` and `ADR-003`. **No Events code imports any socket code.** Events data has no polling and no realtime (A-21, EV-030).
- **No media code:** there is no LiveKit, WebRTC or peer-connection library or module in this repository (`lib/` has no webrtc directory; `package.json` has no media dependency). `docs/messenger/MESSENGER-SCOPE.md` records Live and calls as undocumented surfaces that mobile implements with a peer mesh (STUN and TURN, "no SFU found"); that file describes mobile, not this repository's code.
- **Platform headers:** nothing in the web code sends `X-Platform` or `X-App-Version` [repo grep]. The guide says live-session creation reads them (guide §4.19, §9).

### A.3 Tested and unverified

| Evidence | Result |
| --- | --- |
| Automated (mocked transport) | Full Vitest 80 files, 1267 tests passing at P3-10; `tsc --noEmit` exit 0; ESLint clean on touched files; `git diff --check` clean |
| Browser (P3-10) | Claude ran a 21-check walk-through with Playwright and Chromium against `next dev` and a **mock Django written for that check** (not committed). It covered nearby, My events, links and docs, comments, guests, remove guest, preview behaviour. It did **not** cover create, edit, delete, RSVP, mobile layout or Figma fidelity |
| Production build | **Not verified.** `next build` fails in the sandbox on the Google Fonts fetch before compiling. The owner must run it |
| Live backend | **Never verified.** Every contract in this document is [guide] |
| Sockets and media | **No** socket or media behaviour has been exercised for Events. The sandbox cannot be assumed to reach the socket server |
| Existing lint findings | `next lint` reports pre-existing findings in five files untouched by Pass 3 (deferred); there is no Prettier config |

### A.4 Existing patterns Pass 4 should reuse [repo]

- **BFF:** `lib/events/bff.ts` (`envelope`, `unauthenticated`, `eventNotFound`, `fetchSanitizedGet`, `fetchSanitizedPost`, `readJsonBody` with the 256 KB guard) and `lib/events/server.ts` builders and sanitisers; event id validated by `isEventId`; only allowlisted body fields forwarded; a malformed 2xx becomes 502, never success; upstream 401/403/404 pass through. Templates: `app/api/events/[eventId]/comments/route.ts` and `guests/remove/route.ts`.
- **Client:** `lib/events/api.ts` (`eventsApi`), query keys scoped by account and login session (`lib/events/query-keys.ts`), cache helpers (`lib/events/cache.ts`: `invalidateEventSubResources`, `removeEventSubResources`, `refreshFromFirstPage`), mutation hooks with an in-flight guard and no optimistic insert (`use-post-event-comment.ts`, `use-remove-event-guest.ts`), local per-section error wording instead of changing `describeEventError` (EV-033), confirmation dialogs (`delete-event-dialog.tsx`, `remove-guest-dialog.tsx`).
- **Tests:** BFF route tests over a stubbed `fetch` with the real `server-fetch`; hook tests with `eventsApi` mocked; component tests; and the cross-hook invalidation matrix test `hooks/events/invalidation-matrix.integration.test.tsx`, which any new mutation that touches Events caches should extend.
- **Socket pattern to learn from, not to copy blindly:** the Messenger manager registers listeners before the socket exists and replays them; it replays room joins on every `connect`; hooks return an unsubscribe and clean up on unmount; status lives in a small store. It is Messenger-named, hard-wired to the default namespace and to a Messenger connection store (see C.2).

---

## B. Deferred scope: what Pass 4 inherits

### B.1 P3-09 (join and leave): the actual state

| Item | State | Evidence |
| --- | --- | --- |
| `POST {id}/join` | **Not implemented** in web code. Contract [guide §4.10]: optional `passcode` body field; needs the event not ended and `is_live`; with an attached session it must be `live` and the user not blocked; 201 joined or rejoined, 200 already joined or host opened; data `live_session_id` and `socket` (both may be null); 400 for event-not-found on this route only, ended, not live, passcode required, `event_not_live`, `live_session_blocked`; 403 `Incorrect passcode.` It creates or reactivates **live participation** as a side effect and creates or reactivates the guest row |
| `POST {id}/leave` | **Not implemented.** Contract [guide §4.11]: no body; a guest record must exist; marks it offline and deactivates non-host live participation; 200 `You have left the event.`; 400 `You are not a guest of this event.`; hosts usually have no guest row. It works outside a live session, and used there the guide's consequences (derived, not verified) are that an offline guest loses full access to locked, private and friends events and `guests/add` rejects an existing record, so the way back can be closed (`PHASE-3-HANDOFF.md` section 3.2) |
| Passcode handling | **Create and edit only.** No join passcode input, no attempt handling, no incorrect-passcode state. The handoff's passcode rules apply when it is built: body only, never in a URL, storage, log, error text, query key or surviving mutation cache; `gcTime: 0` and reset on success and on close |
| Admission and access control | Partly present as **read-side behaviour**: full details versus restricted preview (guide §4.8), the preview note, no sub-resource requests for a preview, and a guest-list 403 message. **Missing:** any way for a viewer to become admitted from the web, the event-specific live-session read (§4.18) and its 403/404 handling, and the admission-to-socket sequence (guide §8.7) |
| Relationship to sockets | Join returns a `socket` descriptor (`namespace` `/live`, `join_event` `live:join`, `join_payload.sessionId`) that is **not** a socket URL or a media credential [guide §3.6]. A socket connection alone authorises nothing; the client must wait for admission before `live:join` [guide §6.1] |

What still needs confirmation (not decided anywhere): the leave-stranding risk (owner choice between the P3-09 options if leave is built before a documented non-live way back exists); whether a host can reach the full event as a "viewer" without a guest row; and how a viewer who was never added gets a first view of a locked non-live event (there is none, by design [guide §8.4]).

### B.2 P3-08B (guest discovery and addition): separate, still blocked

Not part of Pass 4 scope and **not to be pulled in silently.** D-2 is unresolved. No documented, suitable user-selection mechanism exists; the documented `guests/add` contract (guide §4.13) does not say who is discoverable or eligible; the Messenger lookup `chats/users` is undocumented, chat-coupled and capped at 20 results and **must not be reused without an explicit contract and product approval** (`PHASE-3-HANDOFF.md` sections 7.1 to 7.3). Reopening it needs an approved, documented discovery contract, any product and backend decisions, and the owner's explicit authorisation.

Interaction to note: guide §9 states that guest add does not create live participation and remove does not revoke it. Removing a guest during a live session therefore needs the live moderation controls (kick, block; guide §5.4). The P3-08A dialog copy deliberately makes no claim about live media; a Pass 4C task may want to point to moderation (a proposal, not a change made here).

---

## C. WebSockets and live behaviour

### C.1 What is documented [guide]

Everything below comes from the guide and is unverified live.

- **Connection (§6, §6.1):** Socket.IO to the configured socket origin, namespace `/live`, access token in handshake `auth.token` (the server also accepts a token query parameter; handshake auth is preferred for new web work); the socket origin and the HTTP origin can differ (§1). Authentication failures reject the connection.
- **Client emissions:** `live:join` with positive integer `sessionId` (acknowledgement `ok`, `sessionId`; success also emits `live:joined`; failure code `live_room_unauthorized` plus `live:error`); `live:leave` (emits `live:left`; does **not** call event leave). Reconnect: revalidate membership and rejoin the room; a socket disconnect does not call event leave.
- **Server events (§6.2):** `event:live-session:available` (`event_id`, `session_id`, `phase` created, started or ended, `status`, `is_live`, `recipient_ids`; sent to **personal `/live` user rooms** of event hosts and users with any guest record; not a global nearby notification); `live:session:started`, `live:session:ended`, `live:session:cancelled`; `live:participant:joined` and `live:participant:left` (with `participant_count`); `live:comment`; `live:reaction`; `live:mic:requested`, `live:mic:approved`, `live:mic:revoked`; `live:co-host:added`, `live:co-host:removed`; `live:participant:muted`, `live:participant:kicked`, `live:participant:blocked`; `live:error`. Legacy `live:signal`, `live:ice`, `live:speaking` are feature-gated and return `live:error` `deprecated_transport_disabled` when off.
- **HTTP supporting routes (§4.18 to §4.22, §5):** event-specific session read, create, start, end, compatibility `update-live-status`; session read; participants (paginated); live comments (POST, list); reactions; media credentials and status; mic requests, co-hosts, mute, kick, block, unblock. Event comments and live comments are **independent stores** with different field names and ids (§5.3).

### C.2 Existing evidence in this repository [repo]

The Messenger manager proves the project already runs Socket.IO from the browser and has solved listener timing, reconnect replay and cleanup. It does **not** yet answer the Events questions: it uses the default namespace, not `/live`; it sends the token in the **query string** through a route that exposes the httpOnly cookie's token to client JavaScript and is documented as temporary and not production-ready (ADR-003); its origin comes from `NEXT_PUBLIC_MESSENGER_SOCKET_URL` (default `https://socket.appscombo.com`), which is a Messenger setting, not a confirmed Events setting; and its status store and bootstrap are Messenger-specific. ADR-002 also records that the "one connection for chat, group and live" topology is a **working hypothesis**, not confirmed, and that mobile uses separate chat, call and live sockets. Reusing or generalising `socket-manager.ts` would modify Messenger code and needs approval (the project rules forbid unrelated refactoring).

### C.3 Required updates and the code they affect (proposals, [guide]-based)

| Trigger | Affected data or UI | Proposed handling | Basis |
| --- | --- | --- | --- |
| `event:live-session:available` (created, started, ended) | event details (`isLive`, session status), nearby and My events cards, delete guard, "Live now" chips | Invalidate this event's detail and the two list roots; never add an unfiltered list call | Guide: "refresh matching details/My events"; **the way the client subscribes to its personal user room is not documented** (gap) |
| `live:session:started` / `ended` / `cancelled` | live panel state, publish, comment and reaction controls, media | Reconcile session state by refetching the event-specific session read; disable controls on ended | Guide §6.2 |
| Session end | **Pass 3 caches**: ending "marks online event guests offline" (§4.21), so a non-host guest of a locked, private or friends event can flip from full details to a restricted preview | Treat as a full-to-preview transition: sub-resource caches for that event must stop being served and no sub-resource request may be made for a preview (existing Pass 3 guarantees) | Guide §4.8, §4.21; derived, not verified |
| `live:participant:joined` / `left` | participants list and count | Merge or refetch page 1; de-duplicate by user | Guide §6.2 |
| `live:comment`, `live:reaction` | live comment list, reaction counts | Merge once by live comment id (HTTP POST and socket can both deliver it); de-duplicate reactions by the reaction emission id and use the server `emoji_count` | Guide §5.3, §6.2 |
| mic and co-host events, `muted`, `kicked`, `blocked` | roster, roles, publish controls | Refetch roles and permissions; a kicked or blocked viewer disconnects media and must not auto-rejoin | Guide §5.4, §6.2 |
| `live:error`, connect error, disconnect | connection status UI | Never show "connected" before admission and the `live:join` acknowledgement; revalidate and rejoin on reconnect | Guide §6.1, §8.7 |

**Proposal versus documentation:** the handlers and cache targets above are proposals built from the documented event list; event names are only those the guide lists, and **payload fields not named in the guide are not assumed**. The guide documents no event for event comments and none for RSVP or guest add or remove; those stay HTTP and refetch.

### C.4 Interactions with existing Pass 3 behaviour (read before planning)

- **Comments:** posting needs an online guest row. After `leave` (offline) or after a session ends (guests marked offline), a previously permitted viewer gets 404 "has not joined" on post. The composer is deliberately not gated by inference (D-3), and the local 404 wording already covers it.
- **Guest list:** offline guest records stay in the list and there is no `is_online` field, so join, leave and session end do not change what the list shows; a live participant roster is a **different** data source (§5.3).
- **My events:** a guest record keeps an event listed even when offline; `leave` therefore does not remove it.
- **Delete:** the web guard and EV-025 stay as they are until a session can be ended from the web.

### C.5 Gaps the contracts leave open (do not guess)

Lifecycle and ownership of the `/live` connection (when it opens and closes: per event view, per live panel, app-wide; the Messenger bootstrap mounts only inside its own layout); how a client joins its **personal user room** for `event:live-session:available`; whether missed events are replayed after reconnect (assume no and refetch, but this is not stated); duplicate and out-of-order delivery beyond the two documented dedupe keys; authorisation changes while connected (a guest set offline by session end, a block); token refresh over a long socket session (access tokens are short-lived; the guide says refresh on confirmed expiry through the app's auth flow); cleanup on account change and logout; and whether the deployed socket host is the Messenger host.

---

## D. Dependencies and blockers

### D.1 Decisions and contracts needed (owner or backend)

| ID | Needed | Needed by | Notes |
| --- | --- | --- | --- |
| **D4-1** | Socket origin, namespace and **production auth mechanism** for `/live`: is the host the same as `NEXT_PUBLIC_MESSENGER_SOCKET_URL`; handshake `auth.token` versus the temporary query-string route; does the backend confirm a short-lived ticket or cookie handshake (ADR-003 is still pending) | Any socket task | Without it the only option is to reuse the temporary, explicitly non-production mechanism |
| **D4-2** | Socket topology: one shared connection versus a separate `/live` connection, and whether the Messenger manager may be generalised (touches Messenger code) or a second manager is created | Socket foundation | ADR-002 hypothesis unconfirmed |
| **D4-3** | **Web media path** (Pass 4D): guide §9 says `X-Platform=web` selects P2P even when LiveKit is enabled; web may consume a mobile-created LiveKit session; web-hosted LiveKit creation needs backend support; legacy P2P signalling can be disabled independently; spoofing a mobile platform is not acceptable. Which path is intended for web, and is P2P signalling enabled in the deployed environment | Media tasks, and the decision whether web can host at all | There is no media library in the repository; the roadmap says not to assume the provider configuration is suitable **Investigated 2026-10-27, still open: see section H.** |
| **D4-4** | Does Pass 4A ship **lifecycle without media** (host can create, start and end; attendees see state) or wait for 4D? Offering "Start" when the web client cannot broadcast is a product question (guide §9: gate unavailable media controls) | 4A scope | |
| **D4-5** | `X-Platform` and `X-App-Version` values the web BFF should send for session creation | Session create and start | Guide §4.19 says send the actual client values. **Evidence and the `0.1.0` versus `1.0.0` discrepancy: section H.5; still open.** |
| **D4-6** | Leave semantics: which P3-09 option applies (confirm the guide-derived stranding risk is acceptable, or the backend documents a way back) | Join and leave | See B.1 |
| **D4-7** | How the client subscribes to the personal user room; whether events are replayed | Event-level updates | C.5 |
| **D4-8** | Which participant controls the web ships (mic requests, co-host, mute, kick, block) in Pass 4C | 4C scope | |
| **D4-9** | Whether Pass 4 needs a mocked Socket.IO server in tests (adding a dev dependency) or fakes at the manager boundary | All socket tests | |

### D.2 What can proceed with the documented contracts

Read-side live-session state (§4.18, §5.1) and the HTTP admission calls (`join`, `leave`) are fully specified in the guide and need no socket or media. Host lifecycle calls (create, start, end) are specified but depend on D4-4 and D4-5. Socket tasks wait on D4-1, D4-2 and D4-7. Media waits on D4-3. P3-08B waits on its own discovery contract and is independent of all of the above.

### D.3 Documentation contradictions and cautions

- The Pass 3 handoff D-1 says join and leave "stay in Pass 4B"; the owner decision of 2026-10-25 says "Pass 4, alongside the WebSockets work". The roadmap's Pass 4B is "Admission and Realtime", so this document maps P3-09 to 4B and orders host lifecycle (4A) first, because join needs a live event. **Confirm that mapping.**
- The handoff's "Guarantees" table says guest add and remove should invalidate `myEventsRoot()`, while the invalidation matrix, the implementation and the accepted P3-08A work invalidate `guests` and `comments` only (EV-035).
- `PHASE-3-HANDOFF.md` section 12 and some older sentences still describe P3-03 as "next"; those are historical and superseded by the status lines.
- The preview note promises a passcode prompt "when you join" that does not exist yet (A.2).
- The guide says the socket **payload** for several events is a raw event, not an HTTP envelope, but gives field lists only for some; do not infer the rest.

---

## E. Proposed implementation sequence (a proposal; none of it is authorised)

Each task is small, independently verifiable and stops for review. Numbering is proposed. "Contract ready" means the guide fully specifies it (still unverified live).

| Task | Objective and scope | Existing files and APIs | Prerequisites and blockers | Acceptance and tests | Contract ready? |
| --- | --- | --- | --- | --- | --- |
| **P4-00** | Documentation only: record D4-1 to D4-9 answers and the P3-09 to 4B mapping; fix the stale Guarantees wording only if the owner asks | the three Events docs | Owner answers | Docs consistent | n/a |
| **P4-01** | 4A: live-session **read**. BFF `GET {id}/live-session`; types and normaliser (status, provider, media status, `current_user_role`, no secrets); query key and hook; no UI beyond a status line | `bff.ts`, `normalize.ts`, `query-keys.ts`; guide §4.18, §5.1 | None beyond contract | BFF tests (403 "Join this event…" and 404 distinction, malformed 2xx is 502); hook and key scoping tests; restricted preview makes no request | Yes |
| **P4-02** | 4A: host lifecycle. BFF POST create, start, end; mutation hooks; Start and End controls for hosts; ended and cancelled states; invalidate this event's detail and both list roots; update the delete-guard reasoning (EV-025) | `delete-event-dialog.tsx`, `use-event-mutations.ts`, `cache.ts` | **D4-4, D4-5**; P4-01 | Route tests (no body, headers, 400 lifecycle codes, no repeat toggling); hook tests (duplicate-submit guard, matrix extension); component tests for states; Pass 3 regression run | Yes (guide §4.19 to §4.21) |
| **P4-03** | 4B: **admission (P3-09)**. BFF `join` (passcode in body only) and `leave`; join dialog with passcode, incorrect-passcode and not-live states; leave action; invalidation per the matrix (detail, resources, comments, guests, `myEventsRoot()`, `nearbyRoot()`) | `bff.ts`, `request.ts` passcode rules, `use-event-details.ts`, cache helpers | **D4-6**; P4-01, P4-02 (join needs a live event); passcode rules from `PHASE-3-HANDOFF.md` section 6 | Route tests (body-only passcode, no body logging, 403 versus 401 distinct); hook tests (mutation scrubbed on success and close); component tests; preview-to-full transition test; extend the matrix test | Yes (§4.10, §4.11) |
| **P4-04** | 4B: **socket foundation for `/live`** (no feature events): connect, auth, reconnect, status, cleanup on logout and account change, behind one interface | `socket-manager.ts`, `socket-auth.ts` as references; `socket.io-client` | **D4-1, D4-2, D4-9** | Unit tests with a fake socket or mocked server for connect, reconnect, listener replay, teardown; no feature code | Needs confirmation first |
| **P4-05** | 4B: room membership. `live:join` after admission, acknowledgement, `live:error`, `live_room_unauthorized`, `live:leave`, rejoin after reconnect, failure states | guide §6.1, §8.7 | P4-03, P4-04 | Handler tests for ack success and failure; no "connected" before acknowledgement; reconnect revalidates | Yes (given P4-04) |
| **P4-06** | 4B: event-level updates (`event:live-session:available`, `live:session:started` / `ended` / `cancelled`) mapped to cache invalidation | `cache.ts`, `query-keys.ts` | **D4-7**; P4-04 | Tests per event: correct keys invalidated for this account, session and event only; duplicate events harmless; ended-session full-to-preview transition handled | Partly (personal-room subscription undocumented) |
| **P4-07** | 4B: participants and presence. `GET sessions/{id}/participants` (paginated) and join/left events with de-duplication and count | guide §5.1, §5.3, §6.2 | P4-05 | Pagination by `next`; merge and dedupe tests | Yes |
| **P4-08** | 4C: live comments and reactions. POST and list, merge by id across HTTP and socket, 1,000-character limit, 429 throttle | guide §5.3 | P4-05; keep separate from event comments | Dedupe tests, throttle and not-live errors | Yes |
| **P4-09** | 4C: participant mic requests (listener side), request and status | guide §5.4 | P4-05, D4-8 | State machine tests including resubmit after rejection | Yes |
| **P4-10** | 4C: host and moderation controls (approve and revoke mic, co-host, mute, kick, block, unblock), including the 202 pending and 503 `media_service_unavailable` semantics (refetch before retry) | guide §5.4 | P4-09, D4-8; do not repeat uncertain moderation mutations blindly | Permission and error tests; role and permission refetch | Yes |
| **P4-11** | 4D: **media architecture verification** (investigation only, no code): confirm provider path for web, deployed signalling flags, available libraries, hosting and ceilings | guide §9, §5.2; `MESSENGER-SCOPE.md` for the mobile baseline | **D4-3** | A written decision record; nothing built | n/a |
| **P4-12** | 4D: browser media permissions and status (microphone, camera consent; permission states; never prompt without user action; status surface) | | P4-11 | Permission-state tests; no capture without consent | After P4-11 |
| **P4-13** | 4D: media connection (credentials request, connect, reconnect, failure) for the provider chosen in P4-11 | guide §5.2 (credentials throttle 10 per minute, 15-minute default token) | P4-11, P4-12 | Failure and reconnect tests with a fake provider; no secrets in logs or storage | After P4-11 |

Dependencies in short: P4-01 then P4-02 then P4-03; P4-04 can start once D4-1 and D4-2 are answered and is independent of P4-02; P4-05 needs P4-03 and P4-04; P4-06 to P4-08 need P4-05; P4-09 and P4-10 follow; P4-11 is independent and can run any time before P4-12; P4-13 is last. P3-08B is outside this sequence.

Each task ends with its own verification (focused tests, then the Pass 3 regression files it touches, full suite, `tsc`, ESLint on touched files, `git diff --check`), a docs update and a stop. Live-backend and production-build results are reported separately and never claimed unless run.

---

## F. Risks and validation

- **Mocked versus live.** Every contract here is [guide]. Socket behaviour in particular (acknowledgements, replay, token expiry, personal rooms) cannot be proven by mocks. Plan a staged live check with the backend team for P4-04 to P4-06 and report it separately; the existing `scripts/messenger-socket-smoke-test.mjs` is a Messenger smoke test and not evidence for `/live`.
- **Regression guards:** nearby at 25 km with no global fallback; `filter=my_events`; preview versus full; no sub-resource requests for a restricted preview; whitelisted guest and comment projections; collection-update semantics; invalidation matrix (extend `invalidation-matrix.integration.test.tsx` rather than adding parallel tests); the Phase 2 delete guard; the P3-08A and P3-06 error wording (EV-033).
- **Access control and privacy:** the access token reaches client JavaScript for the socket under the temporary mechanism (ADR-003); do not extend that pattern or treat it as production-ready, and do not log tokens, bodies or passcodes. Passcodes are body-only and must be scrubbed. Join has no distance, invitation or friend check for unlocked non-public events [guide §9], so the UI must not advertise invitation-only admission. Guest removal does not revoke live participation (guide §9).
- **Cache consistency:** socket events must invalidate only this account, session and event; stale responses after account change must be ignored; a session end can flip viewers to a preview (C.3).
- **Follow-up concerns recorded, not changed:** (1) **EV-034:** a 404 on a single section (comments, guests, resources) shows that section's local message but does **not** remove the event's cached sub-resources; only delete and delete-404 do. (2) **EV-035:** the handoff's Guarantees table (guest add and remove invalidate `myEventsRoot()`) disagrees with the invalidation matrix and the accepted implementation. Neither changes accepted behaviour, and neither is scheduled by this plan.
- **Environment limits:** the sandbox cannot fetch Google Fonts, so `next build` is unverified; no live backend, socket server or media server is reachable from here.

---

## G. Owner decisions and task status (recorded 2026-10-26)

The owner accepted this document as the planning baseline with the following decisions and constraints. They override the proposals above where they differ.

| Topic | Decision |
| --- | --- |
| P3-09 (join and leave) | Maps to Pass 4B, alongside the WebSockets work. Join and leave stay **independently testable** operations (the D.3 mapping is confirmed). |
| P3-08B (add a guest) | Stays **deferred and outside Pass 4**. D-2 is unresolved. Pass 3 stays incomplete while P3-08B and P3-09 are deferred. |
| Plan shape | The 4A to 4D structure is the working plan, subject to dependency or scope changes. |
| P4-02 (host lifecycle) | **Do not start** until D4-4 (can a host start when web media is unavailable, and what the UI does) and D4-5 (the `X-Platform` and `X-App-Version` values) are resolved. |
| Leave | **Do not implement** until D4-6 is resolved: the documented behaviour may strand a guest with no safe way back, so the documented contract is investigated and a backend or product decision is requested. Join may be considered separately if it is safe and independent. |
| Sockets | Do not modify or generalise Messenger's socket manager without explicit approval. Resolve the production auth mechanism, the socket origin and the connection topology (D4-1, D4-2) before P4-04. Do not extend the temporary token-in-query-string pattern (ADR-003). |
| Media | P4-11 stays a separate architecture investigation. No P2P, LiveKit or other path is selected or built before it. |
| Guest discovery | Do not reuse Messenger search or add guest-add functionality. |

| Task | Status |
| --- | --- |
| P4-01 live-session read | **Implemented, awaiting owner review** (2026-10-26, branch `feat/events-p4-01-live-session-read`). Scope was exactly: the BFF read route, types and normalisation, a scoped query key and hook, a minimal status line, and focused tests. Record: `PROGRESS.md` (P4-01 entry), assumptions A-23 and A-24 and issues EV-036 and EV-037 in `EVENTS.md`. The guide and the repository did not contradict this handoff on what P4-01 reads; two points the handoff did not settle were decided and recorded: the no-session 404 is told from the absent-event 404 by message text (A-24), and the read is skipped for an event with nothing attached that is not live (A-23). Section A.1's "accepted branches are separate and not merged" is stale at `main` `7d96cb4` (EV-037). **Review fixes (2026-10-27):** a failed refetch now takes precedence over retained data in `useEventLiveSession`; the 403 note says "host and guests who are currently in the event"; the status line is **the most recent successful read, not a real-time guarantee** until P4-04 to P4-06 (no polling, no refresh control, no `refetchOnMount: "always"`; A-23). |
| P4-04 and P4-05 (carried caveat) | When they read `EventLiveSessionState.socket`: `null` means absent, invalid or mismatched, **not** "safe legacy event" (A-25). The 404 message-matching limitation (A-24) also stays. |
| Media architecture investigation (2026-10-27) | Done as investigation only: findings, unknowns and options in section H. No decision made, no code, no task authorised. |
| P4-02 onward | Not started. P4-02 is gated by D4-4 and D4-5; P4-03 (with leave) by D4-6; P4-04 by D4-1 and D4-2. |

---

## H. Media architecture investigation (P4-11 pre-read, recorded 2026-10-27)

**Investigation only. No code, no decision and no task authorisation came out of it.** Nothing here selects a media path. Every item is labelled; read the labels before relying on a statement.

Extra evidence label: **[mobile]** read in the mobile repository `kamtafw/unknown` (shallow clone, `HEAD b7db079`) on 2026-10-27. This proves what the mobile client *does*. It does **not** prove what the deployed backend, LiveKit server, socket server or TURN service currently *accept*, and it does not say which mobile build is in production. No credential values were read; the `.env.example` TURN values were deliberately not opened.

### H.1 Established facts

**Mobile client [mobile]**

| # | Fact | Source path |
| --- | --- | --- |
| M1 | Two media providers exist on mobile: **LiveKit** (`livekit-client` 2.20.1 and `@livekit/react-native` 2.12.0) and a legacy **P2P audio mesh**. The room's `media.provider` (`p2p` or `livekit`) picks the class; both are built in `useLiveAudioSession`. | `package.json`; `hooks/messenger/use-live-audio-session.ts` (`LiveP2PAudioSession` at line 101, `LiveKitAudioSession` effect ~line 821) |
| M2 | LiveKit flow: `POST live/sessions/{id}/media/credentials` (no body) returns `server_url`, `token`, `room`, `identity`, `expires_at`, `permissions`, `correlation_id`; then `room.connect(server_url, token, { autoSubscribe: permissions.can_subscribe })`; then the client checks `room.name === credentials.room` and `localParticipant.identity === credentials.identity` and disconnects on mismatch; the token is not persisted. Microphone is published only after connect (audio and screen share only; no camera). | `lib/messenger/live-api.ts`; `lib/messenger/livekit-audio-session.ts` (connect and verification ~lines 120-215) |
| M3 | LiveKit enablement is gated on `room status === live`, an active participant and, for LiveKit, `media.status === "ready"`. Before connecting, the client calls `ensureLiveRoomJoined(sessionId)` (socket `live:join`). | `use-live-audio-session.ts` ~lines 700 and 1139 |
| M4 | P2P signalling uses the `/live` socket: `live:signal {to: socketId, type: offer|answer|ice, payload}`, `live:ice {to, candidate}`, `live:speaking`. The offerer for a pair is chosen by comparing socket ids (`localeCompare`), so every participant (listeners included) opens a peer to every other (mesh). | `lib/socket/live-socket.ts`; `use-live-audio-session.ts` lines 101-200, 520-560 |
| M5 | P2P ICE servers are three public STUN hosts hard-coded in the client plus **TURN taken from build-time environment variables** (`EXPO_PUBLIC_TURN_URLS`, `_USERNAME`, `_PASSWORD`). **No backend endpoint supplies ICE or TURN configuration in the mobile code.** | `lib/webrtc/peer-connection.ts` lines 19-56 |
| M6 | Socket: `/live` namespace, WebSocket transport, `auth: { token }`, `live:join { sessionId }`. A missing acknowledgement is tolerated (`live:joined` counts as success), which suggests some deployments do not acknowledge. Default origin falls back to `https://socket.appscombo.com`. | `lib/socket/live-socket.ts`; `lib/messenger/live-runtime.ts` |
| M7 | Headers: `X-Platform` is `"ios"` or `"android"` and the helper **throws on any other platform**; `X-App-Version` must match a strict semver pattern (taken from the Expo config). Mobile sends both on: event live-session read (`GET`), create, update-live-status, start, end, session create, series calls and **media credentials**. It does **not** send them on event `join` or `leave`. | `lib/messenger/live-runtime.ts`; `hooks/events/use-events.ts` (lines 279, 448-504); `lib/messenger/live-api.ts` line 14 |
| M8 | The mobile docs in the repository contain **no infrastructure documentation** (no LiveKit deployment, CORS, TURN or socket-host notes). `docs/` holds Messenger and E2EE notes and the live background-audio spec only. | `docs/` listing |

**Backend guide [guide]** (all unverified against the deployed backend)

| # | Fact | Section |
| --- | --- | --- |
| G1 | Create, start and end are host-only. Create and start take `X-Platform` and `X-App-Version` ("send actual client platform/version"; start uses them only when it must first create a session). End, read, join, leave and credentials list **no** header requirement. | §4.19-§4.21, §4.18, §4.10-§4.11, §5.2 |
| G2 | `X-Platform=web` selects **P2P even when LiveKit is enabled**. Provider selection recognises only eligible iOS/Android platform and version combinations. Existing sessions keep their provider. Web may consume an eligible mobile-created LiveKit session; web-hosted LiveKit creation needs backend web-platform support; spoofing a mobile platform is not acceptable. | §9 |
| G3 | Credentials: caller must already be an active participant admitted through the event flow; 201 with `correlation_id`, `server_url`, `room`, `identity`, `token`, `expires_at`, `permissions`; P2P sessions return 400 `media_provider_not_livekit`; throttle 10 per minute per user and session; token default 900 s; other codes listed in §5.2. | §5.2 |
| G4 | Socket: `/live`, handshake `auth.token` (query token also accepted), `live:join {sessionId}` only after admission, ack `ok` / `code=live_room_unauthorized`. Legacy `live:signal`, `live:ice`, `live:speaking` are **feature-gated and can be disabled**, returning `live:error deprecated_transport_disabled`. | §6.1-§6.2, §9 |
| G5 | The guide documents **no ICE, STUN or TURN endpoint** and no browser-specific media contract. | whole guide |
| G6 | A host who starts a LiveKit session must see provisioning succeed; start errors include `media_provisioning`, `media_service_unavailable`, `media_state_conflict`. | §4.20 |

**Repository facts [repo]**

- The web repository has `socket.io-client` ^4.8.1 and **no** `livekit-client` or other media dependency. `package.json` `"version"` is **`0.1.0`**.
- `next.config.ts` defines no `headers()` and the repository has no Content-Security-Policy configuration, so no `connect-src` allow-list for a LiveKit or socket host is present in this code. Whether the hosting layer adds one is unknown.
- `docs/messenger/MESSENGER-SCOPE.md` (line 29) says "No SFU found anywhere ... peer-mesh only". **That is contradicted by the mobile repository at `b7db079`**, which ships LiveKit (M1). Either the scope note predates LiveKit or it was written from another mobile revision. Treat the scope note as stale for media until the owner says otherwise. No change was made to that file.

### H.2 Inferences (reasonable, not verified)

- **I1.** `livekit-client` is a browser-capable JavaScript SDK, so a browser can in principle join a LiveKit room using the same credentials API and the same room-and-identity checks as mobile. Not tested, and it depends on the LiveKit server's reachability and CORS or origin rules from a browser (U3).
- **I2.** Because §9 names `X-Platform=web` as an input that selects P2P, the backend most likely recognises the value `web`. The guide never lists accepted platform values or the version format, so this is an inference from one sentence.
- **I3.** A web-created session would be P2P. For a browser and mobile to interoperate the web client would have to speak the same `live:signal` and `live:ice` message shapes, offer/answer roles and ICE configuration as mobile (M4, M5). Standard WebRTC SDP should interoperate with `react-native-webrtc`, but this has never been exercised here.
- **I4.** A web listener in a P2P mesh opens a peer to every participant (M4), so mesh size limits and TURN cost apply to web exactly as to mobile.
- **I5.** Event-room media on mobile uses the **generic live-room** endpoints (`live/sessions/{id}` and `.../media/credentials`) alongside the event routes (M3, `components/events/event-room.tsx`). The guide §5 documents the same endpoints for web. This matches, but the live-room GET and participants routes have not been planned for web yet.

### H.3 Unknowns and information gaps (the team must supply these)

| # | Unknown | Who can answer | Blocks |
| --- | --- | --- | --- |
| U1 | Which platform values and version formats the backend accepts, and whether `web` is accepted, on create, start, **read** and **credentials**. | Backend | D4-5, P4-02 |
| U2 | The backend rule that makes a platform and version combination eligible for LiveKit, and whether a web value can be added. | Backend | Option C |
| U3 | The deployed LiveKit server URL class (cloud or self-hosted), whether it accepts browser WebSocket and WebRTC from the web origins (CORS, allowed origins, TLS), and whether `media.status` ever reaches `ready` in staging. | Infrastructure | Options A and C |
| U4 | Whether the deployed socket server has legacy `live:signal` / `live:ice` enabled, and whether `live:join` is acknowledged. | Backend | Option B |
| U5 | How a browser gets ICE and TURN configuration (a backend endpoint, a public config, or a build-time value as on mobile) and whether the TURN credentials may ship to browsers. | Infrastructure and security | Option B |
| U6 | Socket origin, allowed web origins and the production auth mechanism (existing D4-1, D4-2). | Backend | all socket tasks |
| U7 | Whether the mobile build at `b7db079` matches production, and which mobile version first created LiveKit sessions. | Owner | all options |
| U8 | Whether a staging environment with a mobile-hosted LiveKit session and two test accounts exists. | Owner | every proof plan |
| U9 | Product intent for web: listener only, or speaker, or host (D4-3, D4-4). | Owner | scope |

Nothing in this document claims the deployed media infrastructure works. No call was made to any backend, LiveKit, socket or TURN service in this investigation.

### H.4 Options (none is chosen)

**A. Web as a LiveKit client of mobile-created sessions (listener first, speaker if promoted).**

- *Reuse:* the credentials API (G3, M2), the room-and-identity verification pattern, the admission flow (join), the `/live` socket join (M3), the participant and role fields already normalised in P4-01.
- *Implement on web:* BFF credentials route (no body; token never cached or logged); `livekit-client` dependency; a connection manager with connect, reconnect and credential refresh before `expires_at`; remote audio attachment and the browser autoplay unlock gesture; microphone publish only for a speaker, after browser consent; cleanup on leave, end, logout and account switch.
- *Backend or infrastructure:* confirm U1 for credentials with `web` or no header, U3 for browser access to the LiveKit host, admission (P4-03 join) for the web account.
- *Risks:* a web host cannot create a LiveKit session (G2), so a web-hosted event stays P2P and A covers only mobile-hosted events; header acceptance (U1); browser autoplay and device behaviour; token expiry and the 10-per-minute throttle; no CSP allow-list present here (a hosting-layer one is unknown).
- *Two-browser proof:* a mobile host creates and starts a LiveKit event session in staging; browser 1 (account X, promoted to speaker by the host) publishes a microphone; browser 2 (account Y, listener) subscribes. Evidence: both rooms report `connected`, browser 2 holds a subscribed remote audio track, and `RTCPeerConnection.getStats()` inbound-audio bytes increase on browser 2 while browser 1 speaks. Server side, `GET sessions/{id}/media/status` (host) shows `media_connected_count` of at least 2 plus the host. Requires U3, U7 and U8.

**B. Browser WebRTC over the existing P2P socket signalling (web-created sessions).**

- *Reuse:* the `/live` socket, `live:signal` and `live:ice` shapes and the socket-id offerer rule (M4), `X-Platform: web` sessions (G2).
- *Implement on web:* a signalling client for `/live`, a mesh peer manager, ICE and TURN configuration, speaking detection, reconnection and per-peer cleanup. This is new web code that duplicates what mobile already runs.
- *Backend or infrastructure:* U4 (signalling enabled), U5 (TURN for browsers), U6 (socket auth and origin).
- *Risks:* signalling can be switched off independently (G4), so web media could be unavailable by configuration; mesh scaling (I4); TURN credential exposure; interop with `react-native-webrtc` unproven (I3); the socket-id ordering rule must be replicated exactly or peers glare.
- *Two-browser proof:* browser 1 hosts a web-created event session (P2P), browser 2 joins; confirm `live:joined` and the offer/answer/ICE exchange, `connectionState === "connected"` on both, and inbound audio bytes increasing in `getStats()`. Run once on one network and once with relay forced to show TURN works. Requires U4 and U5.

**C. Backend work: web-platform LiveKit creation, then Option A for web-hosted sessions.**

- *Reuse:* everything in A.
- *Implement:* nothing beyond A on web, plus whatever the backend defines for a web platform.
- *Backend or infrastructure:* provider selection recognising a web platform (U1, U2), a web-eligible version rule, and LiveKit browser access (U3).
- *Risks:* depends on a backend change outside this repository, so the delivery date is not in the web team's control; must not be worked around by sending an iOS or Android value (G2).
- *Two-browser proof:* identical to A except the host is also a browser.

The investigation found **no evidence that new signalling or media infrastructure is needed**: LiveKit and the mesh both already exist (M1). The open questions are whether the existing pieces accept browsers (U3 to U5) and whether the backend will classify a web client for LiveKit (U1, U2). No recommendation to build new infrastructure is made.

### H.5 Headers: `X-Platform` and `X-App-Version`

- Proposal from the owner: `X-Platform: web` and `X-App-Version: 1.0.0`.
- **`web` as a value:** the guide mentions `X-Platform=web` once (§9) and does not list accepted values. Not confirmed. Mobile never sends `web` (M7).
- **`1.0.0` is not the web package version.** `package.json` says `0.1.0`. Either `0.1.0` is sent (it matches the same strict semver pattern as mobile) or the owner states that `1.0.0` is a deliberate contract value. This needs the owner's ruling because the guide says "actual client platform/version" (§4.19) and the backend may gate on the version (§9, "eligible platform/version combinations").
- **Which calls carry them:** the guide requires them on create and start only (G1). Mobile also sends them on read and credentials (M7); whether the backend consults them there is unknown (U1). P4-01's read sends none (`app/api/events/[eventId]/live-session/route.ts`); that stays as is until U1 is answered.
- **Needed confirmation (backend):** accepted platform values, version format, and whether any call besides create and start requires or reads them.
- **When implemented:** one constant (or one small module) in the BFF is the single source for both values, so a later confirmed change touches one place. Nothing was added now.
- Status: **D4-5 stays open.** This section is evidence, not a resolution.

### H.6 Proposed sequence (a proposal; nothing here is authorised)

1. **Owner and backend answers** (no code): U1, U3, U4, U5, U7, U8, U9, plus the D4-5 ruling on the two header values and D4-4 scope. These are the only things that unblock a chosen path.
2. **Smallest useful implementation task, once step 1 answers U1, U3, U7 and U8:** *listener-only LiveKit proof* behind a development-only harness. It adds the BFF credentials route (POST, no body, headers from the single constant, nothing cached or logged), `livekit-client`, and a connect-and-verify step that mirrors M2 (room and identity check) with no publishing, no socket and no lifecycle controls. It needs an already-admitted test account (admitted from the mobile app, or P4-03 join). It proves or disproves I1 and U3 with the smallest surface. If step 1 shows LiveKit is not reachable from browsers, Options B or C decide the path before any code.
3. Then, depending on the result: Option A speaker publishing (P4-12 area), or Option B or C. P4-02 stays gated by D4-4 and D4-5; the socket tasks (P4-04 to P4-06) stay gated by D4-1, D4-2 and D4-7.

Open items for the owner: rule on `1.0.0` versus `0.1.0`; whether to correct or supersede `MESSENGER-SCOPE.md` line 29; whether a staging environment and test accounts exist (U8).

---

## Approval requested

The owner is asked to (1) approve or amend the task sequence in section E, (2) answer D4-1 to D4-9 (or say which can be deferred), (3) confirm the P3-09 to Pass 4B mapping in D.3, and (4) say which task, if any, to authorise first. Nothing in this document starts work.
