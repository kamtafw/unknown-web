# Events — Pass 3 handoff (participation, resources, discussions)

**Status (updated 2026-10-24): P3-01 to P3-04 (with P3-02a) are complete and P3-04 is owner-accepted; P3-05 (read-only comments) is owner-accepted; P3-06 (posting a comment, the first Pass 3 write route) is owner-accepted; P3-07 (read-only guest list, `6e2c365`) is owner-accepted; P3-08A (host-only remove guest, `55d94e7`) is owner-accepted. The P3-08B **discovery gate** (2026-10-25, branch `feat/events-p3-08b-discovery-gate`, docs only) found no documented, suitable user-selection mechanism, and **the owner decided to defer web guest addition: P3-08B is Deferred and is not implemented in this pass; D-2 stays unresolved for any future web guest-add** (sections 7.2 and 7.3). P3-09 and P3-10 are not started. Pass 3 is not complete.** The sections below are the original plan, written 2026-10-22 on branch `feat/events-phase1` at `8849097`
(Phase 2 implementation checkpoint `a96887b`; Phase 2 closed for delivery with verification deferred to QA). Those SHAs are the **historical authoring point**; the current Pass 3 starting point is in section 1.1.

**Revision 2026-10-23:** D-1 (join/leave) and D-2 (guest addition) were investigated and resolved to explicit blockers (section 3.2 and section 7); comment authorization, comment length/refresh and Figma evidence labelling were corrected; the premature assumption-ID reference was removed (IDs are now assigned only when written); add-guest and join/leave are now gated tasks (P3-08B, P3-09). Still planning only: no Pass 3 code exists.

This is the primary source of truth for Pass 3 scope, task order and acceptance criteria. The roadmap
(`docs/events/EVENTS.md`) and the progress record (`docs/events/PROGRESS.md`) only point here.
Backend reference: the Project doc `events-api-web-implementation-guide.md` ("the guide"), cited as `guide §n`.
Predecessors: `PHASE-2-HANDOFF.md` (historical), `EVENTS.md` (assumptions A-n, issues EV-nnn), `PROGRESS.md` (evidence record).

---

## 0. How to use this document

1. Read all of it before starting any task. Sections 1 to 8 define the destination; section 9 divides it into tasks; section 10 is the execution protocol; section 11 is the completion checklist.
2. A session is assigned **one task** (`P3-nn`). Completing it does **not** authorise the next one.
3. Sections 7 and 9 name decisions that need the owner. Each has a recommended default; a task that depends on an undecided item must stop and ask rather than assume.

### Evidence labels used throughout

| Label | Meaning |
| --- | --- |
| **[repo]** | Verified directly in the repository on 2026-10-22 |
| **[guide]** | Stated by the backend guide; **not** verified against the deployed backend (no live-backend call has ever been made from this work) |
| **[reported]** | Reported by the owner (browser smoke tests, production build); no log in the repo |
| **[design]** | Read from Figma metadata (frame names and text layers); see section 2.3 for the limits |
| **[assumption]** | A decision made here to proceed; it must be recorded and is open to review |

---

## 1. Starting point

### 1.1 Repository (verified)

**Historical (when this handoff was first written, 2026-10-22):** branch `feat/events-phase1`, HEAD `8849097`, working tree clean [repo]. Phase 1 and Phase 2 commits are present. `a96887b` remains the Phase 2 implementation checkpoint.

**Current Pass 3 starting point (verified 2026-10-23 from Git history):** `feat/events-phase1` advanced to `745b4c7` (adds this handoff, `f2165d0`, and a PROGRESS update) and was merged into `main` as `7044b18`; the application code is unchanged since `a96887b`. P3-01 was committed as `2880913` on branch `docs/events-p3-01-confirm-defaults` (cut from `main` `7044b18`), documentation only. Later commits follow it on the branch `feat/events-p3-02-read-foundation`: documentation reconciliation `b035663`, P3-02 `2d46430` (read-side data layer) and P3-02a `f137303` (BFF minimisation). Read the branch tip with `git log`. No Pass 3 UI exists.

Phase 2 test state last reported: Vitest 63 files / 834 tests, `tsc`, lint clean [reported]; production build and mocked-browser smoke tests passed [reported]. **Not re-run for this handoff.**

### 1.2 What Pass 3 builds on [repo]

| Area | What exists | Where |
| --- | --- | --- |
| Right pane + URL state | `?event=<uuid>`, `&edit=1`, `?create=1` (`SELECTION_KEYS` is exactly `event`, `edit`, `create`); list items are links | `lib/events/selection.ts`, `hooks/events/use-event-selection.ts`, `components/events/{events-shell,event-pane,event-link}.tsx` |
| Details | One union: `full` (has `hosts`) or `preview`; BFF GET removes `guests` and host `email`/`phone_number` before the browser sees them | `types/events/api.ts`, `lib/events/normalize.ts`, `lib/events/server.ts` (`sanitizeDetailsPayload`), `app/api/events/[eventId]/route.ts` |
| Host/guest detection | `isHost` = a host UUID in `details.hosts` matches `user.id`; server stays authoritative | `hooks/events/use-event-details.ts` |
| Resources **data** | Full details keep `links` (`{name,url}`, http/https only) and `documents` (`{name,url}`, media URL resolved) **only so a host can edit them**. The details view displays neither (code comment: "viewing them is Pass 3") | `normalizeLinks`, `normalizeDocuments`, `event-details-view.tsx`, `event-form.tsx` |
| Live hint | Details view shows a "Live now" chip and: "This event is live. Joining live events isn't available in the web app yet." | `event-details-view.tsx` |
| RSVP | Three-way knowledge (`set`/`none`/`unknown`), independent of join and guest membership; seeded only from same-account/session list caches | `rsvp-control.tsx`, `use-event-rsvp.ts`, `lib/events/cache.ts` |
| Write path | `forwardEventWrite` (JSON allow-list or streamed multipart), `envelope()`, `fetchOrError()`, `unauthenticated()`, `eventNotFound()`; `isEventId()` UUID check | `lib/events/bff.ts`, `lib/events/server.ts` |
| Errors | `describeEventError` → kinds `validation | unauthorized | forbidden | not_found | live | too_large | network | server | unknown`; a 403 is never treated as an expired login | `lib/events/errors.ts` |
| Cache | Keys scoped by account `pkid` and `sessionGeneration` at positions 2 and 3; `keyBelongsTo`; existing roots: nearby, my-events, address, detail, rsvp. **No** guests/comments/resources keys | `lib/events/query-keys.ts` |
| Mutations | `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent` invalidate nearby + My events and set/remove detail+rsvp. They know nothing about sub-resources yet. Write mutations use `gcTime: 0` and reset after success so passcodes/files do not linger | `hooks/events/use-event-mutations.ts` |
| Shared UI | `StateMessage`, `RetryButton`, `secondaryButton` (exported from `event-list.tsx`), `components/ui/{dialog,alert-dialog,input,scroll-area,skeleton,switch,input-otp,sonner}`, avatar via `radix-ui` `Avatar` (messenger), `useDebouncedValue` | `components/events/event-list.tsx`, `components/ui/*` |
| Tests | Vitest 3 + happy-dom + Testing Library; one `.test` beside each module; BFF route tests use `// @vitest-environment node` and mock `@/lib/cookies` and `@/lib/server-fetch`; hook tests wrap in `QueryClientProvider` and seed `useAuthStore.setState({ user: { pkid, id }, sessionGeneration })`; `vitest.setup.ts` mocks `next/navigation` (incl. `useSearchParams`), `next/link` (drops `className`/`aria-*`; use a local mock if a test needs them), `next/image` | `vitest.setup.ts`, `app/api/events/routes-write.test.ts`, `hooks/events/use-event-rsvp.test.tsx` |

Naming collision to remember: the domain type `EventLink` (`{name,url}`) and the component `EventLink` (`components/events/event-link.tsx`, a list-item link) share a name. Do not import one where the other is meant.

### 1.3 What does **not** exist [repo]

**At the Phase 2 checkpoint (historical):** no guests, comments, resources, join or leave code of any kind. **Since then (P3-02 `2d46430`, corrected by P3-02a `f137303`):** the read-side data layer exists (types, normalisers, keys, `eventsApi` read methods, three GET routes with BFF minimisation, a cache helper). **Still absent:** every hook and component, the `tab` URL state, write routes (remove guest, post comment), any user-lookup for adding guests, and all join/leave code.

---

## 2. Contracts and designs available

### 2.1 Backend contract for Pass 3 [guide]

All rows are documented, none verified live. Paths are relative to `/api/v1/events/`.

| Operation | Contract (summary) |
| --- | --- |
| `GET {id}/resources` | Any authenticated viewer for a **public, unlocked** event; host or **online** event guest for locked/private/friends events (else 403 `Join this event before accessing its live session.`, a reused message). No pagination. `data.event` is the event **name** (not the UUID). `data.links[]`: `link_name`, `url`, `date_added` (`DD/MM/YYYY`, **derived from the event's creation time, not a per-link date**). `data.documents[]`: `doc_name`, `doc_file`, `size` (display string or null), `file_type` (uppercased extension or null), `date_uploaded` (`DD/MM/YYYY`). Empty arrays when none. Read-only |
| `GET {id}/comments?page&limit` | Same access rule as resources. Newest first. Paginated (`count,total_pages,limit,current,previous,next,results`; default limit 10, max 100). Item: UUID `id`, `message`, `created_at`, `user{pkid,id,photo,full_name,username,role(host|guest),joined_at}` |
| `POST {id}/comments/create` | Body `{message}` (nonblank, **no backend max length**). Caller must have an **online event guest row**; **host status alone is insufficient**; does not require the event to be live. 201 returns only `data.message` (no id, author or timestamp; outer `message` null). No live-socket event. 404 `The user has not joined this event. Only users that have joined can comment.`; 400 blank |
| `GET {id}/guests?page&limit` | **Host or any event guest record** (offline records count). Public visibility alone does not grant it (403 `You do not have permission to view this event's guests.`). Newest `joined_at` first, online and offline, **no `is_online` field**, no search parameter. Item: `user_id` (= user `pkid`), `user_photo`, `user_full_name`, `user_username`, `role` (`host|guest`), `rsvp_status` (`going|interested|not_going|""`), `joined_at` |
| `POST {id}/guests/add` | Host only. Body `{user_id}` (numeric `pkid`). 201 `Guest added successfully.` Creates a guest with `is_online=true`; no live participant, no media. 400 missing id **or existing record (including an offline guest)**; 404 absent event/user; 403 non-host |
| `POST {id}/guests/remove` | Host only. Body `{user_id}`. 200 `Guest removed successfully.` Deletes the record; **the guest's event comments cascade-delete**; does not revoke live participation. 404 `Guest not found in this event.` |
| `POST {id}/join` | Optional body `{passcode}` (required when locked, except hosts and already-online guests). Requires event **not ended** and `is_live=true` (and, with an attached session, session status `live` and the user not blocked). 201 joined / 200 already joined / 200 host opened. Data: `live_session_id`, `socket` (both may be null). Errors: 400 not found (this route only), ended, not live, passcode required, `event_not_live`, `live_session_blocked`; 403 `Incorrect passcode.`. Creates/reactivates **live participation** as a side effect |
| `POST {id}/leave` | No body. Needs an existing guest record (400 `You are not a guest of this event.`). Marks it offline, deactivates non-host live participation, **keeps the record** (event stays in My events). Hosts normally have no record |
| `GET {id}/details` (already used) | Full for host/online guest, or any viewer of a public unlocked event; otherwise a 200 restricted preview |

Contracts **not** present in the guide, so **not buildable**: event-comment edit, delete, reply, reaction, pin or report; guest search; guest invite/accept; per-link dates; an event description; co-host for events; any `is_online` for guests; a user-search endpoint for events.

### 2.2 Consequences that shape the work [guide]

- Resources, comments and (for guests/hosts) the guest list are **gated by being a host or an online guest** except for public unlocked events, where resources and comments are readable by any authenticated viewer. The guest list is **never** readable by a viewer who has no guest record, even on a public event.
- A non-host user obtains a guest record only by (a) a host adding them, or (b) joining a **live** event. So outside live events, only host-added guests can comment.
- `join` and `leave` are live-session operations in practice (section 3.2): there is **no documented self-service, event-level membership operation for a non-live event**. Host `guests/add` and `guests/remove` are the only event-level membership writes outside a live session.
- `viewer_rsvp_status`, RSVP and the My events list are separate from all of the above: an RSVP never makes someone a guest; a guest record (even offline) makes the event appear in My events.
- Because `guests` is stripped from details (EV-001 hardening) and the guest list has no `is_online`, **the web cannot know from details whether the viewer is an online guest** (EV-026, section 7).
- The backend itself still leaks restricted `links`/`documents`/`guests` through nearby and list responses (guide §9, EV-001). Pass 3 must not treat discovery fields as proof of access, and the BFF whitelists stay in place.

### 2.3 Designs: what was seen, and how

Figma file `33p8aAelQZxsbg8XQMlULz`, section "Event center" (`2936:42813`), with an attendee lane ("Event home") and a host lane ("Event home - create event"). Three evidence tiers, never to be mixed:

| Tier | What | Evidence and limits |
| --- | --- | --- |
| **A. Rendered and inspected** | The owner-supplied Phase 1 exports (1440 × 1024 at 2×): Events tab with the room open as attendee, My events tab with the room open as host, and a cropped passcode modal. EV-014 records that they show host-only items and a room (host header, comments, reactions, actions) | Inspected in Phase 1 (`EVENTS.md`, "Design source and fidelity"). The image files are **not in the repo** and were **not re-viewed for this handoff**, so nothing in this document is taken from them for Pass 3 |
| **B. Metadata and text-layer inspection only** | Frame names, positions, sizes and text strings read through the Figma connector (`get_metadata`) for the frames listed below | **No pixels, spacing, colours, icons or panel switcher were seen.** The frames also contain leftover messenger copy ("read receipt", "Add message schedule", "Add group"), so they are drafts |
| **C. Inferred / assumption** | Everything not in A or B | Recorded as assumptions (D-n) and to be re-checked against the rendered frames |

Rendering attempt: in this planning work one `get_screenshot` call (Comments, `2936:46754`) returned an image URL, but the sandbox could not download it (egress to the Figma image host was refused) and later calls hit the Starter-plan call limit. **So none of the Pass 3 frames has been rendered and inspected.** All Figma-derived statements below are tier B.

Tier B frames:

| Frame | Attendee node | Host node |
| --- | --- | --- |
| Home (list + room) | `2936:44729` (text "Leave") | `3022:42871` (text "End event", "Edit") |
| Comments | `2936:46754` | `3024:44193` |
| Links and Docs | `2936:47184` | `3024:44295` |
| Guest | `2936:47702` | `3024:44481` |
| Create event | n/a | `3022:43554` (Phase 2) |
| Passcode required | `2936:48122` (text "Passcode required", "this event requires passcode to access,") | |

What the text layers say (tier B): the room panel has a header (title, a description paragraph, address, red `LIVE`, hashtags); **Comments** rows have a name, a role label (`Host`, `Co Host`) and message text; **Links and Docs** has link rows (full URL text) and document rows (a type label such as `PDF`/`MP3`, name, size, type, a date like `28/10/2024`); **Guest** has a `Search guest` field and rows of name, `@username` and a role label.

Tier B items the contract does not support, so **not built**: an event **description** (no such field); **Co Host** labels (a live-session role, Pass 4); **Search guest** as a server search (only client-side filtering of loaded pages is possible); a **Date and Time per link** in the Create frame (EV-023); **Leave** and **End event** controls (live, Pass 4B/4A).

Tier C (assumptions, no design seen): how the sections are switched (tabs, D-7); the comment composer; relative timestamps on comments; avatar fallbacks; every loading, empty, error and access-denied state; the remove-guest confirmation; any add-guest UI; mobile and tablet.

---

## 3. Pass 3 scope

Roadmap source: Project instructions, Pass 3: *guest list and guest management; adding and removing guests where supported; joining and leaving events; links and document viewing and management; event comments and supported interactions; relevant empty, loading, success and error states; do not treat RSVP, guest membership and joining as interchangeable.*

Reconciled with the contract, **in scope**:

| Area | Included |
| --- | --- |
| A. Participation | Guest list (host and guests); host remove guest; host add guest **only once D-2 is resolved**. **Join and leave are not included** (D-1, section 3.2): they are live-session admission operations (Pass 4B) |
| B. Resources | **Viewing** links and documents (with the metadata the contract returns); resource states and access |
| C. Discussions | Viewing event comments; posting an event comment; loading, refresh, pagination and failure states |
| D. Integration | Navigation inside the details pane; cache invalidation across details, resources, comments, guests, lists; preserve Phase 1/2 behaviour |

**Resource "management"** in the roadmap is satisfied by what Phase 2 already delivers: links and documents are created, replaced and cleared only through the event create/edit collections (the backend has no per-resource routes, guide §4.6). Pass 3 adds **no new resource write path**. It must make sure the Phase 2 write path refreshes the new resource view (P3-04).

**"Supported interactions" for comments** = post and read only. Everything else is not in the contract (section 2.1) and is out of scope.

### 3.1 Participation: concepts that must stay separate

| Concept | Created by | Meaning | Effect on views |
| --- | --- | --- | --- |
| **RSVP** | `POST rsvp` (Phase 2) | The viewer's answer; one per user/event | None on access, My events or guests |
| **Guest record** | Host `guests/add`, or `join` | Membership row, `is_online` true/false (hidden) | In My events (even offline); grants guest-list read; online guest gets full details/resources/comments |
| **Online** | `guests/add` (default true), `join`; cleared by `leave` or session end | Whether the guest counts as present | Gate for full details, resources, comments for locked/private/friends events |
| **Live participation** | `join` (side effect) | Live-session roster, roles, media | **Pass 4**; Pass 3 neither reads nor displays it |

Actions:

| Action | Who | Preconditions | Authoritative result | UI states | Affects |
| --- | --- | --- | --- | --- | --- |
| View guest list | Host or any guest record | Full details visible | `GET guests` (403 = no access) | loading, empty ("No guests yet"), loaded, 403 access state, error + retry, load more | none |
| Add guest (**gated on D-2**) | Host | A chosen user `pkid` from a source approved under D-2 (**none is approved yet**) | 201; refetch guest list | picker, submitting, success, 400 "already a guest", 404 user missing, 403 | guest list; added user's My events (server-side) |
| Remove guest | Host | Confirmation naming the **comment cascade** | 200; refetch guests and comments | confirm, submitting, success, 404 already gone (treat as gone), 403 | guest list, comments |
| Join (**not in Pass 3**, D-1) | n/a | Live-session admission: event not ended and `is_live`; passcode if locked | Reserved for Pass 4B | n/a | n/a |
| Leave (**not in Pass 3**, D-1) | n/a | Live-coupled; see section 3.2 | Reserved for Pass 4B unless P3-09 prerequisites are met | n/a | n/a |

### 3.2 Join and leave: what the evidence supports (D-1)

Evidence [guide]:
- `join` (§4.10) works only when the event has not ended and `is_live` is true (and, with an attached session, that session is `live` and the user is not blocked). The guide states: "A scheduled, not-live event cannot be joined merely to unlock its resources". It creates or reactivates **live participation** and rolls back guest changes on session errors. §8.7 lists it as the admission step of the attendee broadcast flow. That is live-session admission, which the roadmap assigns to Pass 4B ("Session admission and access handling").
- `leave` (§4.11) can be called whenever the caller has a guest record, live or not. It marks the record offline and deactivates live participation; §8.7 treats it as part of the attendee broadcast flow (event leave, socket unsubscribe, media disconnect).
- The only documented event-level membership writes outside a live session are the host's `guests/add` and `guests/remove`. No self-service, non-live join exists, and the passcode is only evaluated at `join` (§8.4: "entering a passcode is not a separate preview-unlock API").

Consequence (derived from the guide, **not verified live**): used outside a live session, `leave` would turn a guest offline, which removes full access to locked/private/friends events (details become a restricted preview, §4.8). The way back is closed: `guests/add` rejects an existing record "including an offline guest" (§4.13) and `join` needs the event to be live. A pre-live `leave` could therefore strand a guest until the event goes live.

**Resolution (D-1):**
- **Join is not a Pass 3 operation.** It is not reinterpreted as general event membership.
- **Leave is not a Pass 3 operation** for the same reason (live-coupled, and capable of stranding a guest).
- The genuine event-level membership operations the backend supports are the **guest list, host remove and host add**; those are Pass 3 (add gated on D-2).
- Join, leave, passcode entry and session admission stay in **Pass 4B**.
- The roadmap text lists "joining and leaving" under Pass 3. Reassigning them is a roadmap clarification that needs the owner's explicit instruction (EV-028), so P3-09 is kept as a **blocked** task with prerequisites rather than silently dropped.

Smallest decision or backend change to unblock P3-09 (owner chooses one): **(A, default)** confirm the deferral to Pass 4B, no backend change; **(B)** the backend provides and documents an event-level, non-live way for a guest to be online (or to come back online after leaving), a capability to be named by the backend owner, not an endpoint invented here; **(C)** accept a leave-only Pass 3 task knowingly, with the stranding risk above (not recommended).

---

## 4. End state (what a reviewer should see)

**Opening an event.** From Events or My events, selecting a card opens it in the right pane (`?event=<uuid>`), exactly as Phase 2. A viewer who cannot open the event sees the restricted preview and the existing "Some details are hidden" note. **No resources, comments or guest list are requested for a preview** (a preview never implies access; a missing field is not "empty").

**A full-access viewer** sees the Phase 2 details (cover, chips, schedule, address, tags, hosts, RSVP, host controls) plus a way to move between **Details, Comments, Links and docs, Guests** inside the pane (D-7). The selected section is in the URL (`&tab=`), so a refresh or shared link reopens it. Guests is offered, but its content is gated by the server: a viewer with no guest record sees "Only the host and guests can see the guest list", not an error.

**Links and docs.** Links show their name and address and open in a new tab with `rel="noopener noreferrer"`; only http(s) addresses are ever linked. Documents show name, type, size and upload date when the backend supplies them, and open the stored file URL. No per-link date is shown (the backend's date is the event's). Empty: "No links or documents yet" (hosts additionally get an Edit shortcut to the Phase 2 form). A resource whose URL cannot be made safe is omitted, not rendered as a dead link. If the request is denied (403) the section says it is available to people admitted to the event; if it fails, it offers Retry.

**Comments.** Newest first, each with avatar (initial fallback), full name, `Host` badge when the author is a host, the message, and a small relative time (assumption: the contract returns `created_at`; no design shows one). "Load more" appends older pages. A composer is shown to any viewer who has full access to the event. **The backend is authoritative for who may post** (guide §4.15: an online guest row is required; host status alone is not enough). The frontend therefore **does not pre-check or infer** comment authorization from host status, the guest list or any online status, and never hides or disables the composer on that basis. Every submission is sent to the backend and a rejection is handled: a 404 "has not joined" is shown as "Only people who have joined this event can post comments" (not as a missing event), a 403 or 400 is shown with its own message, and in every failure the typed text is kept. Posting disables the button, then **refetches the first page** (the create response has no id, author or time to insert) and clears the box on success. Empty: "No comments yet". Refresh: see D-12 (contract limitations: no documented length limit, no realtime for event comments).

**Guests.** A list of avatar, name, `@username`, `Host` badge for hosts; "Search guest" filters **the loaded pages only** and says so when more pages exist, with "Load more" available. Hosts also see a **Remove** action per guest with a confirmation that says the guest's comments are deleted too. **Add guest is not offered until D-2 is resolved.** A guest sees the list without host controls. The guest list does not show other people's RSVP or contact data (D-8).

**Join and leave.** Not offered in Pass 3 (D-1, section 3.2). A viewer of a live event sees the same live note as today. A viewer of a non-live restricted event sees the preview and can RSVP as before; there is no web path to full access except being added as a guest by a host (from the web once D-2 is resolved, or from another client). The Phase 2 preview note ("you'll be asked for [the passcode] when you join") stays true for Pass 4B.

**Edge cases.**

| Situation | Expected behaviour |
| --- | --- |
| No resources | Empty state in Links and docs |
| No comments | Empty state; composer shown if the viewer may post |
| Request fails / unreadable 2xx | Section-level error with Retry; the rest of the pane stays usable; a malformed body never becomes "empty" |
| Cannot access the full event | Preview only; no sub-resource requests |
| Access denied for one section (403) | Section-level access message; not a logout, not "event not found" |
| Resource unavailable (bad URL) | Omitted; if everything was dropped show the empty state, not an error |
| Not permitted action | Host-only controls (remove guest) are not offered to non-hosts, as a UI hint; the server's 403/404 is still handled and explained. For comments no control is hidden or disabled by inference; a rejected submission is explained and the text kept |
| Event deleted or hidden mid-session | Section request 404 → existing "This event isn't available" handling; sub-resource caches dropped |
| Account change or logout | All new caches are account + session scoped and cleared like the existing ones |

---

## 5. Boundaries

### In scope
Section 3 table: guest list, host remove guest, host add guest (only after D-2), viewing links and documents, viewing and posting event comments, pane navigation, cache invalidation, tests and documentation for these. **Join and leave are not in scope** (D-1); P3-09 is a blocked, gated task.

### Pass 4 (live events) — **not** in Pass 3
Live-session lifecycle (create, start, end, waiting/ended states); host **End event** control; attendee live room UI; **event `join` and `leave`** (live-session admission, D-1); session admission and access handling; sockets (`/live`, `live:join`, `event:live-session:available`, reconnection); live participants and presence; **live comments and reactions**; mic requests, speaker/co-host roles, moderation (mute, kick, block); media provider selection, credentials, browser permissions and connection. Pass 3 makes **no `join` or `leave` call** (the `socket` and `live_session_id` that `join` returns are Pass 4B's concern; Pass 4 reads `liveSessionId` from details).
Pass 3 **preserves** these hooks for Pass 4: `isLive`, `liveSessionId`, `liveSessionStatus` on full details; the delete guard for live events; the details-view live note.

### Other exclusions
Unrelated application features; broad refactors without a demonstrated Pass 3 need (the shared `eventsApi`, `bff.ts`, normalisers and cache helpers are extended, not redesigned); changes to Phase 1 discovery behaviour; re-implementing anything Phase 2 delivered (create/edit/delete/RSVP, collection semantics); new backend endpoints, fields or schema changes (any need is raised as an issue, not worked around); design-only features (description, Co Host, Date/Time per link, comment replies/reactions); server-side enforcement of nearby, privacy, or live-delete rules (EV-001, EV-002, EV-025 remain backend work).

---

## 6. Architecture and constraints

Do not introduce a new architecture. Follow the Phase 1/2 patterns.

| Topic | Convention to follow |
| --- | --- |
| Frontend → backend | Browser → `eventsApi` (axios `apiClient`, `/api/events/...`) → Next route handler (HTTP-only cookie token via `getAccessToken`) → Django (`DJANGO_API_URL`). The browser never calls Django. New routes sit beside `app/api/events/[eventId]/route.ts` (proposed paths: `app/api/events/[eventId]/{resources,comments,guests}/route.ts` and `.../guests/add|remove`, `.../join`, `.../leave`) |
| Route handlers | Check token (`unauthenticated()`), validate the id with `isEventId()` (malformed → `eventNotFound()` without an upstream call), forward only allow-listed bodies/queries, use `fetchOrError`/`envelope`, answer a 204 with `new NextResponse(null,{status:204})` (none expected here). Never log bodies |
| Types and normalisers | View models in `types/events/api.ts`; produced only by `lib/events/normalize.ts`-style functions that read `unknown` and copy a whitelist. A contract drift degrades to "item skipped" or an `EventPayloadError`, not a crash and not an empty-looking success |
| Validation | Pure builders/validators in `lib/events` (no Next imports), unit-tested; the server repeats the security-relevant ones |
| Errors | Extend `describeEventError` rather than adding a second mapper; keep 403 ≠ expired login and 404 ≠ always "event deleted" (read the endpoint context, guide §8.8) |
| Query keys | Add roots to `eventKeys` with account and `sessionGeneration` at positions 2 and 3 (so `keyBelongsTo` and logout cleanup keep working). Proposed: `resources`, `comments` (infinite; `limit` in key), `guests` (infinite; `limit` in key). Infinite queries carry `page` as `pageParam`, not in the key |
| Queries | `enabled` only when account is known, the id is valid **and details are `full`**; `retry` false for 403/404 as in `useEventDetails`; `staleTime` modest (30 s as details) |
| Mutations | `gcTime: 0`; scrub variables after success when they hold anything sensitive (passcode); invalidate rather than guess when a 2xx body is unreadable |
| Client state | No new zustand store is justified. Pane tab = URL (`tab` key added to `SELECTION_KEYS`, other params preserved, same rules as the existing keys). Search text and dialogs = component state |
| Components | Compose the existing pane (`EventDetailsView`) and shared primitives (`StateMessage`, `RetryButton`, dialogs, avatars). No new design language where a design is missing |
| Auth | Cookie token only; `isHost` from details is a **UI hint**; the server decides. Hide host-only controls for non-hosts, never rely on hiding |
| Tests | Beside the module; BFF tests in the node environment mocking `@/lib/cookies` and `@/lib/server-fetch`; hook and component tests as in `use-event-rsvp.test.tsx`; fixtures in `lib/events/__fixtures__` |

### Guarantees Pass 3 must preserve

| Guarantee | Effect on Pass 3 |
| --- | --- |
| Nearby = 25 km, no global fallback when location is unavailable | Pass 3 touches no discovery code. Any list refresh after guest changes uses the existing `invalidateQueries` on `nearbyRoot()`/`myEventsRoot()`; it must not add a fetch that bypasses the BFF pins |
| My events keeps `filter=my_events` | Add and remove guest change membership (a guest record, even offline, keeps the event listed), so invalidate `myEventsRoot()`; never add an unfiltered list call |
| Pagination: `hasNext` from `next` only; empty intermediate pages tolerated | The new paginated lists (comments, guests) use `next`, never counts or `results.length`, to decide "load more"; an empty page with a non-null `next` is not "the end" |
| Preview ≠ full | Sub-resource queries run only for `full`; a preview never fetches resources/comments/guests and a missing preview field is never "empty" |
| Sensitive fields whitelisted | Guest and comment author payloads are projected to a minimal set in normalisers (D-8/D-11). Host email/phone and the details `guests` array stay stripped. Nothing is added to the whitelist without a recorded reason |
| Passcodes never in URL, persistent storage, logs or query cache | Pass 3 collects **no passcode** (join is not in Pass 3). If P3-09 is later unblocked, a passcode goes in a POST body only, the mutation uses `gcTime: 0` and is reset after success and on dialog close, and it never appears in `?` params, `localStorage`, `console`, error messages or query keys; the BFF does not log bodies |
| Invalidation covers all affected data | See the matrix below; each task lists the keys it must invalidate |
| Collection update semantics (omit = keep, `[]` = clear, populated = replace all) | Untouched. After a successful edit, the **resources** view must refetch (it is a different endpoint from details) |
| Live-session lifecycle outside Pass 3 | Pass 3 makes **no live-adjacent call**: `join` and `leave` are excluded (D-1); nothing starts, ends, joins or connects a session |

### Cache invalidation matrix

| Event | Invalidate |
| --- | --- |
| Update event | `detail` (already), lists (already), **`resources`** (links/docs may have changed) |
| Delete event / 404 on any section | remove `detail`, `rsvp`, **`resources`, `comments`, `guests`** for that event; lists |
| Post comment | `comments` (refetch page 1) |
| Add guest | `guests` |
| Remove guest | `guests`, **`comments`** (cascade), and `detail` is unaffected |
| Join / leave (**not in Pass 3**; applies only if P3-09 is unblocked, or in Pass 4B) | `detail`, `resources`, `comments`, `guests`, `myEventsRoot()`, `nearbyRoot()` |
| RSVP (Phase 2) | unchanged; it does not touch any sub-resource |

---

## 7. Decisions and uncertainties

Each item states the evidence, the decision or recommended default, its **status**, and what it blocks. Statuses: **Resolved** (decided here, based on the evidence), **Blocked** (cannot be decided from the evidence; needs the owner or the backend), **Default** (accepted as the working assumption; confirm in P3-01).

| ID | Question | Evidence | Decision / default | Status | Blocks |
| --- | --- | --- | --- | --- | --- |
| **D-1** | Join/leave: Pass 3 membership or Pass 4B admission? | Section 3.2 [guide]: `join` needs `is_live`; `leave` is live-coupled and can strand a guest outside a live session; no non-live self-service membership exists | **Neither is a Pass 3 operation.** Pass 3 = guest list, host remove, host add (gated). Join, leave, passcode entry and session admission stay in Pass 4B | **Resolved**, with a roadmap clarification pending the owner's explicit instruction (EV-028) | P3-09 (blocked, see its prerequisites) |
| **D-2** | Where does a host find a user to add as a guest? | Section 7.1 [repo]: no candidate mechanism is documented or fit for this use | **No suitable mechanism confirmed.** Guest addition is a product/backend dependency. Owner decision 2026-10-25: web guest addition is **deferred** (section 7.3); the question stays open for any future implementation | **Unresolved; P3-08B Deferred** (owner decision) | P3-08B only |
| **D-3** | Who can post event comments? | Create needs an **online guest row**; host status alone is insufficient (guide §4.15); the web has no reliable membership or online signal (EV-026) | **The backend is authoritative.** The frontend neither pre-checks nor infers comment authorization (not from host status, the guest list or online status), shows the composer to any full-access viewer, sends every submission, and handles rejection (404 "has not joined", 403, 400) while keeping the typed text | **Resolved** | no |
| **D-4** | Replies, reactions, edit, delete for event comments? | Not in the contract | **Not built** | **Resolved** | no |
| **D-5** | Event description (shown in the design text layers) | No field in create/update/details (guide §3, §4.5) | **Not built**; raised as EV-029 | **Resolved** | no |
| **D-6** | `Co Host` label (design text layers) | Event guest `role` is only `host` or `guest`; co-host is a live-session role (guide §3.4, §5.1) | Show `Host` only; Co Host is Pass 4 | **Resolved** | no |
| **D-7** | How are Comments / Links and docs / Guests switched in the pane? | Tier B/C only (section 2.3): no switcher was seen | Accessible tab list in the details pane, state in `&tab=` (`comments`, `resources`, `guests`; default = details). An **assumption**; re-check against rendered frames and record deviations | **Default** | no |
| **D-8** | What of a guest is kept/shown? | Guest item has `rsvp_status`, `joined_at`, `user_id` | Keep `userId` (needed to remove), name, username, photo, role. Do **not** keep or show other people's RSVP or `joined_at` | **Default** | no |
| **D-9** | Link date | `date_added` is the event's creation date, not a link date | Do not display it. Documents show `size`, `file_type`, `date_uploaded` (where present) | **Default** | no |
| **D-10** | Document URL origin and opening | Media host unverified (EV-005); `resolveMediaUrl` already used for covers/documents | Plain `<a target="_blank" rel="noopener noreferrer">`; no `next/image`, no inline preview; never build paths from display names (guide §7) | **Default** | no |
| **D-11** | Comment/author projection | Author has `pkid,id,photo,full_name,username,role,joined_at` | Keep comment `id`, `message`, `createdAt`; author `name`, `username`, `photo`, `role`. Drop the rest | **Default** | no |
| **D-12** | Comment length and refresh | Guide §4.15: no explicit maximum for the comment field; create emits no socket event and the socket carries live comments only (§5.3, §6.2); live and event comments are independent stores | **Contract limitations, not web rules.** Length: the only enforced rule is the documented one (nonblank); the web adds **no character limit**, only the generic request-size guard the BFF already uses for JSON bodies (reported as "request too large", never as a comment-length rule); a product limit, if wanted, needs a product/backend decision. Refresh (**assumption**): initial load, refetch after the user's own post, and an explicit user-initiated refresh; no polling; the thread may be stale and the UI never presents it as live | **Resolved** as limitations plus one assumption; recorded in EV-030 | no |

**P3-01 outcome (2026-10-23):** the Defaults D-7 to D-11 and the D-12 refresh policy were recorded in `EVENTS.md` as assumptions A-16 to A-21 (D-7 = A-16, D-8 = A-17, D-9 = A-18, D-10 = A-19, D-11 = A-20, D-12 refresh = A-21), plus A-22 for UI with no design seen; the table above is otherwise unchanged. D-1 stays resolved as a deferral pending the owner's roadmap clarification (EV-028); D-2 stays blocked (EV-027). The status "Default" above is superseded in `EVENTS.md`: "Assumed (A-n)" for D-7, D-9, D-10 and the D-12 refresh, and **accepted by the owner on 2026-10-24** for D-8 (A-17) and D-11 (A-20).

### 7.1 D-2: candidate user-selection mechanisms (evidence)

The question was whether AppsCombo already has a reusable, authorized mechanism that suits selecting event guests. Checked in the repository on 2026-10-23:

| Candidate | Evidence [repo] | Why it is not adopted |
| --- | --- | --- |
| Messenger lookup `GET chats/users?search=` (`app/api/chats/users/route.ts`, `hooks/messenger/use-search-users.ts`; used by "New chat" and "Add group members") | The route comment says it was "confirmed via mobile, not in the guide". It hard-codes `page=1&limit=20` (no pagination). It returns `ChatListItem`: chat state (`unread_count`, last-message preview, `is_pinned`, `is_muted`, `is_blocked`, `has_blocked_me`) plus `pkid`, name, username, photo. The New chat dialog calls it a "global search". No document under `docs/messenger/` states its scope, who is discoverable, or its blocking rules | Chat-coupled response; undocumented scope and privacy rules; 20-result cap with no paging; it would put chat state into Events data. Messenger's "add members" dialog shows the **UI pattern** exists, not that the **data source** is appropriate for event guests |
| `GET users/list?page=` (`app/api/users/list/route.ts`, `userApi.getUsersList`) | Paginated, typed as `FullUser` (email, phone number, date of birth, etc.); no search parameter in use | Returns full profile data; no search; purpose and authorization unknown |
| Friend suggestions, followers, followings (`hooks/use-users.ts`) | Relationship lists | Whether a host may invite people outside their follow graph is a product question; no search; none is documented for events |
| Events guest list itself | `GET {id}/guests` | Contains only people already invited |

The backend side of `guests/add` checks only that the target user exists and has no guest record (guide §4.13); it has no block, friendship or discoverability rule, so nothing server-side narrows who a host can add. That makes the **choice of source a privacy decision**, not an implementation detail.

**Conclusion:** no suitable mechanism is confirmed. No Events-specific search endpoint is invented. Guest addition is recorded as a dependency requiring a product/backend decision (EV-027).

**Smallest decision needed (owner/backend), any one of:** (a) approve a **named existing mechanism** after the backend owner documents its contract (who is discoverable, blocked-user handling, fields, pagination) and the owner accepts projecting it to `{pkid, name, username, photo}` only; (b) ask the backend for an Events-appropriate invitee search/selection as separately approved backend work; (c) defer web guest addition (hosts add guests from other clients) and record that in `EVENTS.md`.

**Can be implemented before that decision:** the guest read layer (P3-02), the guest list (P3-07) and **remove guest** (P3-08A: it needs only the `user_id` already present in the list). **Must wait:** P3-08B (add guest: user picker, the lookup, the `guests/add` route, hook and UI).

**Permission boundary (unchanged by the decision):** add and remove are host-only on the server (403 "Only event hosts can add/remove guests"). The UI offers them only when `isHost` (a hint; hiding is not security), the BFF validates the id and forwards, and the server's 403 is explained, never bypassed.

### 7.2 D-2 discovery gate (P3-08B discovery task, 2026-10-25): outcome B, no suitable mechanism (D-2 unresolved)

Re-inspected the actual repository at `55d94e7` (P3-08A accepted by the owner) and the backend guide; nothing in section 7.1 was assumed. **No code was written**: no add-guest route, API method, hook, picker or UI exists, and none was added.

| Candidate | Route and source | Contract documented? | Suitable for choosing event guests? | What is missing |
| --- | --- | --- | --- | --- |
| Messenger lookup | `GET chats/users?page=1&limit=20&search=` via `app/api/chats/users/route.ts` (client `chatApi.searchUsers` in `lib/messenger/api.ts`, hook `hooks/messenger/use-search-users.ts`; consumed by `new-chat-dialog`, `create-group-dialog`, `add-group-members-dialog` and `forward-dialog`) | **No.** The route comment says "confirmed via mobile, not in the guide"; the shape is inferred from `ChatListItem` (`types/messenger/chat.ts`). Nothing in `docs/messenger/` states scope, discoverability or blocking rules | **No.** It is a chat-list view: `unread_count`, `last_message_preview`, `is_pinned`, `is_muted`, `is_blocked`, `has_blocked_me` come with `pkid`, name, username and photo. Page and limit are fixed (first 20 only). Reusing it would couple Events to chat state and to undocumented privacy rules | Who is searchable, how blocked users are treated, whether results beyond the first 20 exist, and written approval to project to `{pkid, name, username, photo}` |
| Users list | `GET users/list?page=` via `app/api/users/list/route.ts` (`userApi.getUsersList`, `hooks/use-users.ts`) | **No** (typed as `FullUser` in code, no document) | **No.** Returns email, phone, date of birth, country and other profile data; no search term is used; its purpose and authorization are unknown | A search parameter, a minimal projection and a stated purpose |
| Friend suggestions, followers, followings | `GET users/friend-suggestions` (`app/api/users/friend-suggestions/route.ts`) and the follower and following routes (`hooks/use-users.ts`) | **No** | **No.** Relationship lists with no search. Whether a host may invite people outside their follow graph is a product decision | A product decision on the invitee population |
| Events guest list | `GET {id}/guests` (guide §4.12) | **Yes** | **No.** It lists only people who are already guests | n/a |
| Events search for users | none | The guide lists no user-search endpoint for events (section 3 table, "not buildable") | n/a | n/a |

Guide §4.13 (`POST {event_id}/guests/add`) is documented: host only, body `{user_id}` (numeric `pkid`), 201 "Guest added successfully." with empty `data`; 400 missing id or existing guest record (including an offline guest); 404 absent event or target user; 403 "Only event hosts can add guests." It checks only that the target exists and is not already a guest, so **no server rule limits whom a host can add** (no block, friendship or discoverability check). The documented write is therefore ready; the missing piece is a source of `pkid` values.

**Outcome B. D-2 remains unresolved and P3-08B was gated at the time of this finding** (the owner then chose option (c), section 7.3). None of the candidates is documented, and none can be approved from repository evidence alone. This is a privacy decision (who may a host add without consent) as much as an engineering one.

**Minimum decision to unblock (owner/backend), any one of:** (a) approve a **named existing mechanism**, with its contract documented in writing (who is discoverable, blocked-user handling, returned fields, pagination or result cap) and approval to project results to `{pkid, name, username, photo}`; if that is `chats/users`, it must also be accepted that the Events picker would depend on a Messenger endpoint; (b) approve a **separate Events-appropriate invitee search** as backend work, documented in the guide; or (c) **defer web guest addition** (hosts add guests from other clients) and record that in `EVENTS.md`, which closes P3-08B as deferred. Until then Pass 3 can proceed with P3-09 (gated on D-1) and P3-10 as their own prerequisites allow.

**Not verified:** nothing here was run against a live backend; the 400/403/404 behaviour of `guests/add` is guide-derived.

### 7.3 Owner decision (2026-10-25): web guest addition is deferred

The owner reviewed section 7.2 and chose option (c) of the minimum-decision list: **P3-08B (add a guest) is Deferred and is not implemented in this pass.** This is not a pending implementation task. The evidence in sections 7.1 and 7.2 is unchanged and is the reason D-2 stays **unresolved**: the discovery investigation found no documented mechanism suitable for finding users to add, and the documented `POST guests/add` contract does not, by itself, establish who should be discoverable or eligible for invitation. No lookup is invented, and the Messenger search (`chats/users`) is not reused without an explicit contract and product approval.

**Reopening P3-08B** requires an approved, documented user-discovery contract (an existing mechanism documented per option (a), or a separate Events-appropriate search per option (b)) plus any product and backend decisions on who is discoverable, then the owner's explicit authorization. Until then there is no add-guest route, API method, hook, picker or UI. **P3-08A (remove a guest) is accepted and unaffected.**


### 7.2 Uncertainties and issues

| ID | Statement | Impact | Safe handling |
| --- | --- | --- | --- |
| **EV-026** | The web has no reliable signal for whether the viewer may post a comment: it needs an **online** guest row, details `guests` is stripped (EV-001), the guest list has no `is_online`, and a host may or may not have a row | Some viewers can type a comment and be told they cannot post | D-3: do not infer; submit and handle rejection. A backend viewer-capability or `is_online` flag would remove the guesswork |
| **EV-027** | No suitable user-selection mechanism is confirmed for adding guests (sections 7.1 and 7.2) | Host add-guest is deferred | **Deferred by owner decision 2026-10-25** (section 7.3); reopen only with an approved, documented user-discovery contract |
| **EV-028** | The roadmap lists "Joining and leaving events" in Pass 3, but the backend only supports them as live-session operations (section 3.2) | P3-09 cannot proceed; a roadmap clarification is pending | D-1: deferred to Pass 4B unless the prerequisites of P3-09 are met |
| **EV-029** | Pass 3 designs were inspected only as metadata/text layers (tier B); none was rendered and inspected; they include items the contract does not support | Fidelity cannot be judged at pixel level; some drawn items are not built | Section 2.3; re-inspect when rendered frames are available |
| **EV-030** | Contract limitations: no documented maximum length for event comments; no realtime for event comments | A very long comment may be accepted; the thread can be stale | D-12 |

Unverified-against-live items inherited from Phase 2 stay open (EV-004, EV-005, EV-022 to EV-025). All Pass 3 contract behaviour is [guide].

---

## 8. Common acceptance rules for every UI task

(Individual tasks add to these; do not repeat them in reports.)

1. Loading, empty, error (with Retry) and access-denied states exist for the data the task shows.
2. A request failure or unreadable 2xx is not rendered as empty.
3. Host-only controls render only for `isHost`; the server's 403/404 is still handled.
4. No passcode, token or other secret appears in a URL, storage, log or the query cache.
5. Keyboard operable, visible focus, labelled controls, errors announced (`role="alert"`/`role="status"`), consistent with Phase 2 components.
6. Existing Phase 1/2 tests that touch changed files still pass.

---

## 9. Implementation plan

Order resolves contract and data-model questions first, then read-only UI, then writes, then the gated tasks, then integration. Dependencies form a DAG with no cycles:
`P3-01 → P3-02 → P3-03 → {P3-04, P3-05, P3-07}`; `P3-05 → P3-06`; `P3-07 → P3-08A → P3-08B`; `{P3-04..P3-08A} → P3-10`; `P3-09` and `P3-08B` are **gated** (they start only when their prerequisites are met) and `P3-10` runs after every task that is enabled. P3-04, P3-05 and P3-07 are independent of each other once P3-03 is done. **Only P3-08B (D-2) and P3-09 (D-1) wait for decisions; nothing else does.**

Tasks use "files" only where the repo establishes them; proposed names are marked "proposed".

### P3-01 — Confirm defaults and record assumptions (documentation only)
- **Objective:** confirm or change the **Default** items of section 7 (D-7 to D-11) and record the Pass 3 assumptions under stable IDs, so later sessions cite them. D-1 to D-6 and D-12 are already resolved here and need only owner review; D-2 stays blocked until the owner picks a source.
- **Scope:** `docs/events/EVENTS.md` only. Each accepted default becomes a numbered assumption using the **next unused A- number at that time** (the numbers are assigned when written, never in advance). Keep EV-026 to EV-030 current; record the owner's answer to the D-1 roadmap clarification and to D-2 (or that they remain open). No code.
- **Dependencies:** owner review of section 7.
- **Acceptance:** every Default in section 7 is confirmed, changed or marked deferred in `EVENTS.md`; every A-/EV- ID referenced by the handoff resolves to a definition with status, impact and next action; D-1 and D-2 are recorded as decided or as still blocked (and which task each blocks); no code or test files changed (`git diff --stat` shows docs only).
- **Verification:** an identifier check (cited IDs against definitions) and `git diff --check`.
- **Stop:** when the decisions are recorded. Do not start P3-02.
- **Report:** decisions taken (and by whom), IDs added, anything still open and the task it blocks.

### P3-02 — Read-side foundation (no UI)
- **Objective:** the data layer for resources, comments and guests: types, normalisers, query keys, BFF GET routes, API client methods and an invalidation helper.
- **Scope:** `types/events/api.ts`; `lib/events/normalize.ts` (new normalisers for resources, a comments page, a guests page with the D-8/D-11 projections; `EventPayloadError` on unreadable bodies; http(s)-only links; `resolveMediaUrl` for documents; pagination `hasNext` from `next`); `lib/events/query-keys.ts` (resources/comments/guests roots, account + session scoped); `lib/events/api.ts`; three GET route handlers (proposed `app/api/events/[eventId]/{resources,comments,guests}/route.ts`) that pin/clamp `page` and `limit` with the existing parsing, validate the id and forward only those; `lib/events/errors.ts` additions only if a case is missing; a small `lib/events/cache.ts` helper that removes/invalidates all sub-resource keys for an event (used by later tasks).
- **Dependencies:** owner acceptance of D-8 and D-11. **Status: met on 2026-10-24.** The owner accepted D-8/A-17 and D-11/A-20 as worded in `EVENTS.md`. P3-02 is complete (`2d46430`) and was corrected by P3-02a (`f137303`): by owner decision the BFF also removes the unapproved fields, so they never reach the browser.
- **Acceptance:**
  - Each route: 401 without a session and no upstream call; malformed id → the normal 404 envelope without upstream; forwards the bearer token and only `page`/`limit`; passes upstream 403/404 through; a non-JSON upstream body does not crash.
  - Normalisers: resources keep only the whitelisted fields, drop links whose URL is not http(s) and documents with no usable URL, never read `data.event` as an id, never expose `date_added`; comments keep only id, message, createdAt and the projected author; guests keep only the D-8 fields; none retains email/phone or `rsvp_status`; a malformed body throws `EventPayloadError`, an empty array is an empty list.
  - Keys: first two slots after the root are account and `sessionGeneration`; `keyBelongsTo` works on them; another account's entry is never matched.
  - No component changes.
- **Verification:** new unit tests beside each module (normalisers incl. malformed and hostile inputs, keys, route tests in the node environment following `routes-write.test.ts`), then `npx vitest run` on the touched test files, `npx tsc --noEmit`, `npx next lint` on touched files. No full suite required.
- **Stop:** when the data layer is tested. Do not build UI.
- **Report:** common template plus the exact projections kept and dropped.

### P3-03 — Details pane sections and navigation
- **Objective:** let a full-access viewer move between Details, Comments, Links and docs, Guests inside the pane, with state in the URL, without adding data fetching yet.
- **Scope:** `lib/events/selection.ts` (add the `tab` key to `SELECTION_KEYS`; extend `parseSelection`/`selectionHref`, keep other params and the existing three modes), `hooks/events/use-event-selection.ts`, `components/events/event-details-view.tsx` (accessible tab list; section containers that render a placeholder body), `event-pane.tsx` only if needed. Preview shows no tabs.
- **Dependencies:** P3-02 (keys exist; no data used yet), D-7.
- **Acceptance:** `&tab=comments|resources|guests` selects the section; unknown values fall back to details; tab keys are not carried into create/edit modes; selecting a tab keeps `event` and unrelated params; changing event resets the tab; preview shows no tabs and cannot reach a tab by URL; keyboard arrow/Tab behaviour and `aria-selected`/`aria-controls` are correct; **all existing selection and pane tests still pass unchanged** (update only where the new key requires it).
- **Verification:** `selection.test.ts` additions; `event-details-view.test.tsx` and `event-pane.test.tsx` additions; touched-file lint and `tsc`. Mocked-backend browser check of tab switching and deep link if the environment allows.
- **Stop:** navigation works with placeholder bodies. Do not fetch or render real content.
- **Report:** common template plus any deviation from D-7.

### P3-04 — Viewing links and documents
- **Objective:** the Links and docs section with real data, and Phase 2 edits refreshing it.
- **Scope:** a resources query hook (proposed `hooks/events/use-event-resources.ts`) enabled only for full details; the section component; `hooks/events/use-event-mutations.ts` (`useUpdateEvent` invalidates `resources`; `useDeleteEvent` and its 404 path remove sub-resource keys via the P3-02 helper).
- **Dependencies:** P3-02, P3-03, D-9, D-10.
- **Acceptance:** links render name and address, open in a new tab with `rel="noopener noreferrer"`, only http(s); documents show name plus size/type/date only when present, open the stored URL, no `next/image`; no per-link date; empty state; 403 access message; error with Retry; loading skeleton; hosts see an Edit shortcut to `&edit=1` in the empty state; the Phase 2 edit form is unchanged and `details.links/documents` stay the form's source; after a successful edit the section shows the new data; after delete the keys are gone; no resources request for a preview.
- **Verification:** hook tests (enabled/disabled, 403, error, account scoping), component tests (each state, link safety), `use-event-mutations.test.tsx` additions for the new invalidation, `tsc`, touched-file lint.
- **Stop:** when viewing works and edit/delete keep it consistent. No new resource write path.
- **Report:** common template plus how consistency between the section and the edit form was checked.

### P3-05 — Reading event comments
- **Objective:** the Comments section, read-only.
- **Scope:** infinite query hook (proposed `hooks/events/use-event-comments.ts`) over the comments key, `next`-driven; section component with avatar fallback, name, `Host` badge, message, relative time; "Load more"; manual refresh.
- **Dependencies:** P3-02, P3-03, D-4, D-6, D-11.
- **Acceptance:** newest first as returned; load-more appends and de-duplicates by comment id; empty page with non-null `next` still offers load more; empty state; 403 access message (not "not found"); error with Retry that keeps already-loaded pages; message text rendered as text (no HTML injection); long words wrap; manual refresh refetches; no request for a preview; no reply/reaction/delete controls.
- **Verification:** hook tests (pagination, dedupe, 403/404/error, scoping), component tests for each state and an HTML-looking message, `tsc`, touched-file lint.
- **Stop:** read-only thread works. Do not add the composer.
- **Report:** common template plus the pagination behaviour observed in tests.

### P3-06 — Posting an event comment
- **Objective:** the composer and its mutation, with the backend as the authority on who may post (D-3).
- **Scope:** BFF POST (proposed: the `comments` route, same file as GET) with an allow-listed body `{message}`, trimmed and **nonblank** (the only documented rule; validation in `lib/events`); the generic request-size guard used by other JSON routes; `eventsApi` method; mutation hook that invalidates `comments` on success; composer inside the Comments section.
- **Dependencies:** P3-05, D-3, D-12.
- **Acceptance:**
  - Blank or whitespace-only input is rejected on the client and in the BFF without an upstream call. **No character limit is imposed** (D-12); an oversized body is reported as "request too large", never as a comment-length rule.
  - The composer is shown to any viewer with full access and is **not hidden or disabled by inferred authorization** (host status, guest list, online status).
  - Every submission is sent; success clears the box and refetches page 1 (nothing is inserted optimistically, the response has no id/author/time).
  - Rejections are handled and the typed text is always kept: 404 "has not joined" is shown as "Only people who have joined this event can post comments" and is not treated as a missing event; 403 and 400 show their own messages; 401 follows the shared auth flow; a network failure offers retry.
  - Double submit is prevented; BFF 401 and malformed-id behave like the other routes; message content is not logged.
- **Verification:** BFF route tests, validation tests, hook and component tests (success; each rejection incl. a host and a non-guest; double submit; text kept), `tsc`, touched-file lint. Mocked-backend browser check of post → appears.
- **Stop:** when posting works. No live comments, no socket.
- **Report:** common template plus how each rejection is surfaced.

### P3-07 — Guest list
- **Objective:** the Guests section, read-only.
- **Scope:** infinite query hook (proposed `hooks/events/use-event-guests.ts`); section component; client-side "Search guest" over **loaded** pages.
- **Dependencies:** P3-02, P3-03, D-8.
- **Acceptance:** avatar fallback, name, `@username`, `Host` badge for role `host`; search filters loaded rows case-insensitively and states "searching loaded guests" while `hasNext` is true, with Load more available; empty state; **403 shows "Only the host and guests can see the guest list"** (not an error, not logout); error with Retry; no rsvp status or contact data shown; no add/remove controls yet; no request for a preview.
- **Verification:** hook tests (pagination, 403, scoping), component tests (states, search, loaded-only wording), `tsc`, touched-file lint.
- **Stop:** list works. Do not add host actions.
- **Report:** common template.

### P3-08A — Remove a guest (host only)
- **Objective:** a host can remove a guest. Fully supported by the contract and independent of D-2.
- **Scope:** BFF POST (proposed: `guests/remove`) with body `{user_id}` validated as a positive integer; `eventsApi` method; mutation hook; a **Remove** action per guest row and a confirmation dialog (base: `alert-dialog`); invalidation per the matrix.
- **Dependencies:** P3-07.
- **Acceptance:** shown only when `isHost` (a hint; the server stays authoritative); the confirmation states that the guest's comments in this event are deleted too (guide §4.14); success refetches **guests and comments**; 404 "Guest not found" is treated as already removed; 403 is explained; a non-integer or missing id is rejected by the BFF without an upstream call; buttons are disabled while pending; no claim that removal disconnects live media (it does not).
- **Verification:** BFF route tests, hook tests (invalidates the right keys), component tests (confirm, cancel, success, each error), `tsc`, touched-file lint. Mocked-backend browser check.
- **Stop:** when removal works. Do not start P3-08B.
- **Report:** common template.

### P3-08B — Add a guest (host only) — **DEFERRED by owner decision (2026-10-25); do not start**
- **Status:** not implemented in this pass. D-2 is unresolved. Everything below is the plan that would apply only if the task is reopened under section 7.3 with an approved, documented user-discovery contract and the owner's explicit authorization.
- **Objective:** a host can add a guest chosen through an **approved** user-selection source.
- **Dependencies (prerequisites; all must hold, the session verifies each and stops if one fails):**
  1. D-2 is decided and recorded in `EVENTS.md` as (a) or (b) of section 7.1 (not (c), which closes the task as deferred).
  2. For (a): the backend owner has documented the chosen mechanism's contract (who is discoverable, blocked-user handling, returned fields, pagination), in writing, in the guide or an equivalent source in the repo; for (b): the new backend capability is documented.
  3. P3-08A is complete.
- **Scope when unblocked:** BFF POST (proposed: `guests/add`) with `{user_id}` validated as a positive integer; `eventsApi` method; mutation hook; the picker, projecting results to `{pkid, name, username, photo}` and discarding every other field; an add dialog; invalidation of `guests`.
- **Acceptance:** host-only controls; the picker debounces, requires a nonempty term, and shows loading, empty and error states; the server's 400 (already a guest, including an offline guest) is shown as "already a guest" and 404 (user not found) is explained; success refetches guests; no request is made to a source other than the approved one; no Events-specific search endpoint is invented; add does not claim to connect the person to live media.
- **Verification:** BFF route tests, hook tests, component tests (picker states, add success, 400/404/403), `tsc`, touched-file lint. Mocked-backend browser check.
- **Stop:** if any prerequisite fails, stop immediately and report which one (this is the expected outcome while D-2 is open). Otherwise stop when add works.
- **Report:** common template plus the exact request/response of the approved source as used.

### P3-09 — Event-level membership transitions (join / leave) — **BLOCKED; do not start**
- **Objective:** deliver only those event-level membership operations the **confirmed** contract genuinely supports, without live-session admission.
- **Why blocked:** section 3.2. `join` is live-only admission; `leave` is live-coupled and can strand a guest outside a live session. There is no documented non-live self-service membership operation.
- **Dependencies (prerequisites; all must hold, the session verifies each and stops if one fails):**
  1. The owner has recorded a D-1 choice in `EVENTS.md`: **(A)** defer join and leave to Pass 4B, which **closes this task as "moved to Pass 4B"** with nothing built (the default); **(B)** the backend has provided and documented an event-level, non-live path for a guest to be online or to come back online; or **(C)** the owner knowingly accepts a leave-only task and the stranding risk.
  2. For (B): the written contract names the operation, who may call it, its preconditions **without** `is_live`, its response, its effect on online state and on live participation, and the way back after leaving. For (C): the owner's acceptance names the warning the UI must show.
  3. The roadmap line that lists joining and leaving under Pass 3 has been clarified by the owner's explicit instruction (EV-028).
  4. P3-04 to P3-08A are complete.
- **Scope when unblocked:** only what the recorded choice allows. Never a `join` call for an event that is not live; passcodes only in a POST body (never in a URL, storage, log, error text, query key or surviving mutation cache); no session, socket, media or live-comment code; the `socket` and `live_session_id` in a `join` response are ignored.
- **Acceptance when unblocked:** every call matches a documented precondition; the pane refetches details, resources, comments, guests and lists per the matrix; a locked event may flip from full to preview without errors; an incorrect passcode (403) is not shown as a login or missing-event error; double submit prevented; the live note stays accurate.
- **Verification when unblocked:** BFF route tests (body-only passcode, error pass-through), validation tests, hook tests (scrub, invalidation), component tests (dialog states, preview↔full transition), `tsc`, touched-file lint, mocked-backend browser check.
- **Stop:** if any prerequisite fails, stop immediately and report which one (the expected outcome until the owner decides). Never proceed on an assumed contract.
- **Report:** common template plus which prerequisite option applied.

### P3-10 — Integration and acceptance (no new features)
- **Objective:** prove the pass as a whole and reconcile documentation.
- **Scope:** cross-feature tests for the invalidation matrix; Phase 1/2 regression tests where Pass 3 touched shared code; a mocked-backend browser walk-through of the section 4 journeys; the full test suite, `tsc`, lint and production build; `EVENTS.md`/`PROGRESS.md` reconciliation (what was built, evidence by category, issues, decisions); the final QA hand-off list. Fix only defects that break an acceptance criterion; log everything else.
- **Dependencies:** every enabled task (P3-01 to P3-07 and P3-08A). P3-08B and P3-09 are included only if their prerequisites were met; otherwise they are listed as blocked or deferred with the recorded owner decision. **P3-08B is Deferred (owner decision 2026-10-25, section 7.3) and is listed as such.**
- **Acceptance:** the section 11 checklist is satisfied, or each gap is listed as carried forward with its reason.
- **Verification:** `npx vitest run` (full), `npx tsc --noEmit`, `npx next lint`, `npx next build` (**the sandbox cannot fetch Google Fonts, so a build there fails before compiling; if so, record "build not run here" and ask the owner to run it, as in Phase 2**), mocked-backend browser checks. Live-backend verification is **not** required and must not be claimed.
- **Stop:** after the completion report. No Pass 4 work.
- **Report:** the final completion report described in section 11.

---

## 10. Execution protocol for every session

A session must:

1. Read this whole document, then `EVENTS.md` and `PROGRESS.md`.
2. Run `git status`, confirm branch/HEAD, and check the assigned task's dependencies and decisions (section 7) before touching code. If a needed decision is open, stop and ask.
3. Work **only** on the assigned task; preserve unrelated work and scope boundaries (section 5).
4. Reuse existing patterns (section 6); do not add a new state library, fetch layer or design language.
5. Not invent backend behaviour, fields or endpoints; anything the guide does not state is "unknown" and is raised, not assumed.
6. Add or update targeted tests for what it changed, beside the module.
7. Report only checks it actually ran, with results; mark inherited results "previously reported".
8. Document unrelated issues (add to the issue log) without fixing them, unless they block the task or create a security or data-integrity risk, in which case keep the fix minimal and explain it.
9. Stop when the assigned task is complete. **Completing a task does not authorise the next one; wait for an explicit instruction.**
10. Not commit or push unless the instruction says so.

If blocked: report the evidence, the impact, the options, and the smallest decision or action needed. Do not bypass the blocker by inventing a requirement.

### Handoff report (every task)
- Files changed.
- Behaviour implemented.
- Tests and checks actually run, with results (and what was not run).
- Known gaps and assumptions (with their A-/EV- IDs).
- Deviations from this handoff and why.
- The next task, **named but not started**.

---

## 11. Pass 3 completion criteria

Pass 3 is complete only when all are true, or the gap is listed in the final report with its reason and an owner decision:

**Features and journeys**
- [ ] Guest list works for hosts and guests, including search over loaded pages and pagination (P3-07).
- [ ] Hosts can remove guests; removal warns that the guest's comments are deleted (P3-08A).
- [ ] **Add guest** (P3-08B) is either implemented against an approved user-selection source **or** recorded in `EVENTS.md` as deferred/blocked by an explicit owner decision under D-2. *(Recorded as Deferred, 2026-10-25.)* It is never implemented against an unapproved source.
- [ ] **Join and leave** (P3-09) are either implemented per the prerequisites of P3-09 **or** recorded in `EVENTS.md` as moved to Pass 4B (or blocked) by the owner's explicit decision under D-1. No `join` call exists for a non-live event, and no join/leave code exists otherwise.
- [ ] Links and documents are viewable with correct metadata, safe links and access handling (P3-04).
- [ ] Event comments can be read and posted; the composer is not gated by inferred authorization and every rejection is handled with the text kept (P3-05, P3-06).
- [ ] Pane navigation is deep-linkable and preview viewers cannot reach restricted sections (P3-03).

**Access, privacy and safety**
- [ ] No sub-resource request is made for a restricted preview.
- [ ] Host-only controls appear only for hosts; server 403/404 are handled.
- [ ] Guest and comment data are projected to the D-8/D-11 whitelists; host contact data and details `guests` remain stripped; nothing from the guest-selection source is retained beyond `{pkid, name, username, photo}` if P3-08B ran.
- [ ] No passcode is handled by Pass 3 code unless P3-09 ran; if it did, none appears in URLs, storage, logs or the query cache (tests and review).

**States**
- [ ] Loading, empty, error with Retry, access-denied and recovery states exist for every new section and action.

**Integration**
- [ ] Phase 2 create/edit/delete/RSVP behave as before; the collection semantics are unchanged; edits refresh the resources view; delete clears sub-resource caches.
- [ ] Phase 1 discovery and My events behaviour is unchanged (25 km, no fallback, `filter=my_events`, pagination rules).
- [ ] The invalidation matrix is covered by tests.

**Verification (P3-10)**
- [ ] Targeted tests for every task are in place and pass; the full suite passes.
- [ ] `tsc --noEmit` and lint are clean; the production build result is recorded (run, or owner-run and labelled as such).
- [ ] A mocked-backend browser walk-through of the section 4 journeys is recorded (who ran it, what it covered).

**Documentation and boundaries**
- [ ] `EVENTS.md` and `PROGRESS.md` are reconciled: every cited A-/EV- ID resolves with status, impact and next action; decisions D-1 to D-12 are recorded as taken, blocked or open.
- [ ] No Pass 4 code exists: no session lifecycle, sockets, live comments/reactions, mic/moderation, media, join or leave code (grep-checked and stated in the report).

**Final report must contain:** the checklist above with evidence per line; tests and checks run (separated: unit/component, tsc/lint, build, mocked browser, **live backend: not verified unless real evidence exists**); open issues and decisions; the QA list.

**What may be carried forward transparently:** live-backend verification (every contract here is [guide]); production hosting/upload ceiling (EV-022); backend gaps (EV-001, EV-002, EV-025, EV-026); design fidelity gaps (EV-029); add guest and join/leave **only with a recorded owner decision**. **What may not:** unverified claims reported as verified, a missing state for a shipped feature, a restricted preview making sub-resource requests, or a task built on an unsupported assumption.

---

## 12. Recommended first task

**P3-01, P3-02 and P3-02a are complete** (`2880913`, `2d46430`, `f137303`). **P3-03 (details pane sections and navigation)** is next and needs the owner's explicit authorization; it fetches nothing. Neither D-1 nor D-2 blocks P3-03 to P3-08A.
