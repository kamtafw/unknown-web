# EVENTS.md — Pass 1 (Discovery and My Events) and Pass 2 (Details and core management)

**Status: Pass 1 complete** (accepted by the project owner after reviewing the rendered output, including
typography). **Pass 2 implemented and closed out for delivery** at implementation checkpoint `a96887b`
(branch `feat/events-phase1`). The owner chose to defer in-depth verification to QA or a later session, so
Pass 2 is "implemented, owner-smoke-tested, not verified against the live backend".

**Pass 3 checkpoint (2026-10-24):** P3-01 through P3-03 are complete on the dedicated `feat/events-pass3`
branch. P3-04 (resource viewing and edit/delete cache consistency) is implemented on that branch; the owner
must run local validation before it is accepted. P3-05 and later tasks have not started. The full scope,
task order, decisions and acceptance criteria remain in `docs/events/PHASE-3-HANDOFF.md`. See
`docs/events/PROGRESS.md` for the evidence record; `docs/events/PHASE-2-HANDOFF.md` is the historical Pass 2 brief.

Pass 1 scope: nearby discovery (`/events`) and My Events (`/events/my-events`).
Pass 2 scope: see "Pass 2: what was built". Guests, join/leave, links and documents management,
comments (Pass 3) and live sessions (Pass 4) are **not** implemented.

Status legend: **Guide** = taken from `events-api-web-implementation-guide.md`, not tested against
the deployed backend. **Verified** = exercised by an automated test in this repo (mocked
transport) — never a live-backend check.

## Behaviour implemented

| Rule | Where it is enforced |
| --- | --- |
| Discovery only ever calls `events/location/nearby`, always with `radius_km=25` | `lib/events/server.ts` `buildNearbyQuery` (client value ignored), `app/api/events/nearby/route.ts` |
| No global fallback when location fails | `use-nearby-events` is disabled without coordinates (no request); no list/search route exists for discovery |
| My Events always carries `filter=my_events`, incl. search | `buildMyEventsRequest` (client `filter` never read), `app/api/events/my-events/route.ts` |
| Both nearby response shapes; pagination by `next` only | `normalizeNearbyData`; `shouldAdvancePastEmptyPage` keeps going past empty pages |
| Nearby search stays inside nearby | local filter (`lib/events/search.ts`); remaining pages are scanned (cap 25) and the UI reports `complete` / `partial` |
| Caches scoped to account + session generation | `lib/events/query-keys.ts` (`pkid`, `sessionGeneration`); nearby and My Events use separate roots |
| Only needed fields retained | `normalizeEvent` copies a fixed whitelist; host email/phone, guests, links, documents are never read |
| Page size configurable | `NEXT_PUBLIC_EVENTS_PAGE_SIZE`, default 20, clamped to 1..100 (`lib/events/constants.ts`) |

Files: `types/events/api.ts`; `lib/events/{constants,location,server,normalize,pagination,search,format,query-keys,api}.ts`;
`app/api/events/{nearby,my-events,my-location}/route.ts`; `hooks/events/*` (incl. `use-last-location`); `stores/events-location-store.ts`; `components/events/*`;
`app/(events)/events/{layout,page,my-events/page}.tsx`; `TopBar` "Event" → `/events` (the only TopBar change).
Layout pieces: `events-pane` (shared left pane), `events-tabs`, `location-row`, `event-list`, `event-card`, `event-room-placeholder`.

## Design source and fidelity

Figma itself is not reachable from this environment (page blocks automated fetching; the connector hits the
Starter-plan tool-call limit). The **supplied exports** are the source of truth: Events tab (room open as attendee),
My events tab (room open as host), and a cropped passcode modal. The frames are 1440 × 1024 at 2×.

**Taken from the designs (measured on the exports unless noted):**
- Two flat white panes on a `#FAFBFC` page; left pane 399 px wide with 24 px padding (351 px content); right pane is the selected-event area; 1 px divider between them. Both panes scroll independently (the left list scrolls inside its pane; the header stays put).
- Left pane order: location row (muted "Location" label left, pin + place right) → search ("Search…", white, 1 px border, blue magnifier, 45 px) → segmented "Events | My events" (44 px, muted track, white shadowed pill) → list.
- List item: borderless; cover at 352 : 132; orange padlock in a white circle (top right, no text) for passcode events; bold title; address left; right side is red uppercase "LIVE NOW!" **or** "**May 19** 10:00 - 20:00"; 1 px divider between items.
- No page title; no "Discover" wording; no scope text or large refresh control.

**Implementation assumptions (not established by the designs):**
- A-1 Right pane shows a neutral "No event selected" placeholder when nothing is selected. *(The Phase 1 text said cards were not selectable; **superseded in Pass 2**: cards are links that open the event in this pane via `?event=<uuid>`.)* Below `lg` see A-15.
- A-2 Below `lg` only the left pane shows, full width, 16 px side padding (24 px from `sm`). No mobile/tablet design exists; this is a conservative collapse.
- A-3 The 25 km scope is not drawn in the design: it is a `title` tooltip plus screen-reader text ("Within 25 km of") on the location row. A small refresh icon appears next to the place only once a location exists.
- A-4 Location row falls back to "Current location" when the address lookup fails (the address is cosmetic), "Finding location…" while locating and "Not available" when location failed; a stale address is never shown without a current location.
- A-5 Time shown exactly as stored, 24-hour `HH:MM`, never shifted through the browser timezone. Date is "MMM d" (adds the year for other years; shows "MMM d – MMM d" for multi-day events). The design only shows a single-day event in the current year.
- A-6 Padlock, pin and clock glyphs are redraws/lucide equivalents: the design's icon assets were not exported (the design uses a dashed "15" clock and a person-pin).
- A-7 Loading skeleton, empty, error and location-permission states have **no design**; they use the app's established state pattern (rounded icon tile, bold title, muted copy, pill buttons) flattened into the left pane.
- A-8 Work Sans (the app font) could not be loaded in the sandbox used for visual checks (Google Fonts unreachable), so **I did not compare typography glyph-for-glyph**; sizes/weights follow the design numbers. The project owner later reviewed the real rendering and accepted it.
- A-9 My events shows the Location row too (as in the design) but it is a **read-only reflection**: it shows the place Events discovery last resolved, or a neutral "Not set" (muted text and pin) when none has been. It has no 25 km text, no tooltip and no refresh, because My events is not distance-limited and never asks the browser for location.

**Pass 2 implementation assumptions (no design established them; added at Pass 2 closeout; status: assumed, not design-confirmed):**
- A-10 Shape of the create/edit flow. The Create event frame's text layers gave the sections (thumbnail, location, name, duration, links, documents). Where the form lives and how an edit behaves are assumptions: the form opens in the right pane (`?create=1`, or `?event=<id>&edit=1`); an edit sends only what changed (omitted collection = keep, `[]` = clear, populated = replace all); the schedule is always sent as a complete set; on an already-locked event an empty passcode field keeps the current code. Evidence: `lib/events/request.ts`, `components/events/event-form.tsx`.
- A-11 Privacy and passcode controls have no design: a public/private choice that applies only when there is no passcode, and a four-digit passcode field. A passcode forces private. The passcode is a string and lives only in form state and the request body, never in a URL, storage or the query cache. Evidence: `components/events/form/access-field.tsx`, `lib/events/cache.ts`.
- A-12 Date and time use the native inputs shown inside the design's pill look ("DD - MM - YYYY", "8:00"). Values are `YYYY-MM-DD` / `HH:MM`, sent as `HH:MM:SS`, never converted through a timezone. Evidence: `components/events/form/fields.tsx`.
- A-13 RSVP has no design: a segmented radio group (Going / Interested / Not going) in the app's pill style. State is `set`, `none` or `unknown`; a restricted preview omits the viewer's answer, so it shows "answer not shown", never "you have not responded". RSVP creates no guest row, does not join, and does not add to My events. Evidence: `components/events/rsvp-control.tsx`, `hooks/events/use-event-rsvp.ts`.
- A-14 Delete has no design: a confirmation dialog. A live event, or one whose session is live, cannot be deleted from the web app (the BFF repeats the check and answers 409 `event_live`). Evidence: `components/events/delete-event-dialog.tsx`, `app/api/events/[eventId]/route.ts`.
- A-15 Below `lg` there is no design: the right pane replaces the list while an event or the create form is open, extending A-2. Evidence: `components/events/events-shell.tsx`.

**Deliberately omitted from cards (not in the designs, or unsafe to show yet):** distance, hashtags, host, privacy and RSVP chips, and the attendee avatar stack (see EV-011).

## Issue log

| ID | Description | Where | Impact | Blocks phase? | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| EV-001 | Backend returns full event objects for restricted events through nearby/list/search (links, documents, hosts incl. email/phone, guests) | `location/nearby`, `list`, `search` | Confidentiality; web can only avoid keeping/showing them | No (security, backend-side) | Web whitelists fields. Backend must filter responses. Optional later: slim in the BFF so contact data never reaches the browser | Open |
| EV-002 | Nearby-only and 25 km are not server-enforced; list/search without `filter` return all events | backend | Direct API callers bypass the rule | No | BFF pins radius and filter; backend change needed for real enforcement | Open |
| EV-003 | Nearby `count`/`total_pages` include expired/orphan locations; pages can be empty with `next` set | `location/nearby` | Pagination could stop early | No | Handled (follow `next`, auto-advance, cap 50 empty pages) | Resolved |
| EV-004 | Event times have no timezone; backend "expired" filter uses its own clock (UTC per guide) | nearby filtering, display | An event may vanish up to ~1 h early/late for UTC+1 users | No | Confirm backend timezone semantics; display as stored | Open |
| EV-005 | Event cover/host-photo host unverified against `next.config.ts` allowed hosts | `event-card.tsx` | Broken images if the host differs | No | Cards use `unoptimized` so nothing throws; confirm host and add `remotePatterns` | Open |
| EV-006 | Figma not reachable (rate-limited / robots); designs supplied as exports | UI | Typography/radii/shadows measured from exports only; passcode modal and all non-happy-path states have no design | No | Supplied exports used as source of truth; re-check against Figma Dev Mode when available | Partly resolved |
| EV-007 | `QueryProvider` default `staleTime` is `10000 * 60 * 5` (50 min), likely a typo for 5 min | `providers/query-provider.tsx` | Stale data for hooks that rely on the default | No | Events hooks set their own `staleTime`; fix separately | Deferred |
| EV-008 | Playwright config targets port 4000 and an `e2e/` dir that does not exist; dev server uses 5000 | `playwright.config.ts` | No e2e coverage possible today | No | Document only | Deferred |
| EV-009 | Events is **not reachable through navigation below 768 px**. Confirmed in renders at 390, 767 and 768 px: the TopBar category nav (`nav.hidden.md:flex`, Social / Messenger / Event / storefront buttons using `router.push`) is hidden at 390 and 767 and visible at 768. Nothing else leads to `/events`: `components/dashboard/mobile-nav.tsx` is not rendered anywhere in the app, the logo is not a link, and the account menu has no category links. The only `/events*` links on screen are the in-pane Events / My events tabs, which exist only once the user is already on Events. The same gap applies to Social and Messenger | `components/dashboard/top-bar.tsx`, `app/(events)/events/layout.tsx` | Mobile users can open Events by URL only; they also cannot leave it for Social or Messenger except via browser back | No (shared TopBar left unchanged, as instructed) | **Proposal, not implemented:** (1) smallest, scoped: in the Events layout only, add a `md:hidden` row above the pane with three links (Social `/home`, Messenger `/messenger`, Events current). It touches no shared styling and disappears at 768 px where the TopBar nav takes over. (2) Proper fix, needs a design: a shared mobile navigation (bottom bar or the existing unused `MobileNav`) for Social, Messenger and Events together. Option 1 does not make Events reachable *from* Social or Messenger on mobile; only option 2 does | Open (proposal awaiting decision) |
| EV-010 | Dead-looking `components/navigation/sidebars/*` (links to non-existent routes) | repo | None for Events | No | Document only | Deferred |
| EV-011 | Design shows an avatar stack + "40+" count per event. The list payload's `guests` includes offline guests, and no online-attendee count/avatar contract exists | `list`, `search`, `location/nearby` | Cannot show attendees truthfully | No | Stack **omitted**; `guests` is neither read nor kept. **Backend requirement:** an online-attendee count and a small avatar preview (with consistent privacy rules) on list/nearby items | Open (needs backend) |
| EV-012 | Shared `TopBar` differs from the design: height 65 px vs 79 px; search is a pill with a blue circular button, italic placeholder "What are you looking for"; category icons are outlined circles with black glyphs; the ring is drawn on the 4th (storefront) icon while on Events (probably a design error: Events is the 3rd); bell badge | `components/dashboard/top-bar.tsx` | Events pages sit ~15 px higher than the design | No | **Unchanged on purpose** (shared with Social and Messenger). Decide separately after checking impact | Deferred |
| EV-013 | Design shows the Location row on My events too | `my-events-list.tsx`, `use-last-location.ts`, `stores/events-location-store.ts` | My events row now matches the design | No | **Option 2 implemented.** Discovery stores the resolved place label in a small in-memory zustand store; My events reads it. No geolocation call on My events; "Not set" when nothing was resolved; the My events request and cache keys are untouched. Store holds only the label, tagged with account and session generation (other account or login session sees nothing); not persisted. It is cleared when discovery's location is no longer ready (finding, denied, unavailable, timeout, unsupported). **Limitations:** the label is kept for the page session once resolved (no expiry), so after leaving Events it can show a place the user has since left; a full reload shows "Not set" until discovery resolves again; My events cannot refresh it | Resolved |
| EV-018 | In `next dev`, entering My events by client-side navigation sends `GET /api/events/my-events?page=1` twice (a direct visit sends it once). The same happens at committed HEAD before the EV-013 change, so it is not a regression | `use-my-events` / provider defaults | Duplicate request in development; not investigated in a production build | No | Check in a production build before treating as a defect | Deferred |
| EV-014 | Designs show host-only items (pencil edit icon on a card, floating "create event" button, "End event", fifth action icon) and the event room (host header, comments, reactions, actions) | right pane, My events cards | Floating create button **implemented in Pass 2**; edit is reached from the details view. "End event", comments, reactions and the room are not implemented | No | Pass 3 (comments) and Pass 4 (End event, room) | Partly resolved |
| EV-015 | Passcode modal export is a cropped body: no container, close control, error/loading states; button reads "Very passcode" (probably "Verify passcode"); helper text is lowercase with a trailing comma | passcode dialog | Needed in the join flow (Pass 3/4); Pass 2 only sets a passcode in the form (A-11) | No | Pass 3/4. `components/ui/input-otp.tsx` is a candidate base; passcode stays a string | Deferred |
| EV-016 | No designs for loading, empty, error, location-permission, "load more", dark mode, tablet or mobile | Events | States use the app's pattern (A-7); responsive is a conservative collapse (A-2) | No | Request designs; revisit | Open (design) |
| EV-017 | `--primary` token is `#6D8BCF`; the design's blue samples as `#6A88D1` | `app/globals.css` | ~3 units per channel; imperceptible | No | Not changed (global theme) | Deferred |
| EV-019 | The create form gets coordinates only from the browser's location. The guide documents reverse geocoding (`my-location`) but no place search or forward geocoding, and no picker design exists | `components/events/form/location-field.tsx`, `hooks/events/use-form-location.ts` | A host can only create an event where their device is. Location is requested only when the button is pressed, and no default place is substituted | No | Product decision: address search or a map picker needs a design and a backend lookup. Do not invent an endpoint | Open (product/backend) |
| EV-020 | Pass 2 designs: only the Create event frame's text layers were readable in Figma (screenshots were rate-limited). No frames identified for restricted preview, RSVP, privacy/passcode, delete confirmation, or create/edit on small screens | create/edit form, preview, RSVP, delete | That UI is assumed (A-10 to A-15) | No | Request the designs, compare and adjust | Open (design) |
| EV-021 | A restricted preview omits the viewer's RSVP answer | `components/events/rsvp-control.tsx` | The current answer cannot be shown from a preview | No | Handled with a three-way state (A-13). Confirm the intended UX with design | Resolved in code, UX unconfirmed |
| EV-022 | Production upload limits are provisional: the deployed request path (host, proxy, body limit) was never confirmed (no Dockerfile, `vercel.json` or CI in the repo; only a comment in `middleware.ts`). Web-side assumptions: 5 documents, 10 links, 20 hashtags (50 characters each), 20 MiB combined (`NEXT_PUBLIC_EVENTS_MAX_UPLOAD_BYTES`). Cover (JPEG/PNG, 2 MiB) and document (10 MiB, MIME list) limits come from the guide | `lib/events/constants.ts`, the BFF multipart path | An upload may be rejected by the host, or the web limits may differ from the backend's | No | Confirm the hosting path and real ceiling in QA; adjust the env value | Open |
| EV-023 | (a) A multipart body is streamed, not parsed, so the BFF cannot apply field-level rules; it checks only content type, declared length and the byte cap. (b) The design draws a Date and Time per link; the backend has no such field, so none is offered | `lib/events/server.ts` `checkMultipartRequest`, `components/events/form/links-field.tsx` | (a) For multipart, the form's builder and the backend are the only guardrails. (b) Links show name and address only | No | (a) QA to exercise malformed multipart against the live backend. (b) Tell design | Open |
| EV-024 | Clearing documents in a multipart update (`documents="[]"` sent alongside uploads) is **not confirmed** by the available backend contract. JSON `[]` is documented as clear; existing document URLs cannot be re-sent | `lib/events/request.ts` | Possibly a wrong result when removing all documents in the same request that uploads a cover | No | Verify against the backend; if unsupported, split into two requests or ask backend | Open (assumption) |
| EV-025 | The backend does not refuse deleting a live event and does not end the session (guide §4.7, §9). The web app blocks it in the UI and with a BFF 409 `event_live`. That is a courtesy for requests through the web app, not a security boundary: a direct API call bypasses it and the state can change between check and delete | `app/api/events/[eventId]/route.ts`, `delete-event-dialog.tsx` | A live event can be deleted by a direct API call | No (security/data-integrity concern, backend-side) | Backend should enforce the rule. Ending a session is Pass 4 | Open (needs backend) |
| EV-026 | *(Pass 3 planning)* The web has no reliable signal for whether the viewer may post an event comment. The backend requires an **online** guest row (host status alone is insufficient); details `guests` is stripped (EV-001), the guest list has no `is_online`, and a host may or may not have a row | Pass 3 comments (planned) | Some viewers can type a comment and be told they cannot post | No | Handoff D-3: the backend is authoritative; the frontend does not infer authorization, shows the composer to any full-access viewer, submits, and handles rejection with the text kept. A backend viewer-capability or `is_online` flag would remove the guesswork | Open (planned) |
| EV-027 | *(Pass 3 planning)* No suitable user-selection mechanism is confirmed for **adding guests** (`guests/add` needs a numeric `pkid`). Checked 2026-10-23: the Messenger lookup `chats/users?search=` is chat-coupled (returns chat state incl. `is_blocked`/`has_blocked_me`), has no documented scope or privacy rules, is capped at 20 results with no paging, and is only "confirmed via mobile"; `users/list` returns full profile data and has no search; follower/suggestion lists are a product question. `guests/add` itself applies no block or discoverability rule | Pass 3 host add-guest (P3-08B) | Add guest is deferred from the web Pass 3 scope; choosing a source would require a separate product/backend decision | No (P3-08B deferred) | Owner decision 2026-10-23, D-2 option (c): defer web guest addition. Do not build the user picker or call `guests/add` from the web in Pass 3. Guest list and host remove-guest remain in scope; revisit only after a separately approved user-selection contract | Deferred by owner (2026-10-23) |
| EV-028 | *(Pass 3 planning)* The roadmap lists "Joining and leaving events" in Pass 3 and "Session admission and access handling" in Pass 4B, but the backend supports them only as live-session operations: `join` requires `is_live` and creates live participation; `leave` marks the guest offline and deactivates live participation, and used outside a live session could strand a guest (`guests/add` rejects an offline record and `join` needs a live event; derived from the guide, not verified). There is no documented non-live self-service membership operation | Pass 3 join/leave (P3-09); roadmap wording | Keeping join/leave in Pass 3 would risk conflating event membership with live-session admission and could strand a guest | No (P3-09 removed from Pass 3) | Owner decision 2026-10-23, D-1: confirm roadmap clarification. Join, leave, passcode entry and session admission are deferred to Pass 4B. Do not start P3-09 in Pass 3; no non-live membership endpoint is invented | Resolved — owner confirmed deferral to Pass 4B (2026-10-23) |
| EV-029 | *(Pass 3 planning)* The Pass 3 frames (Comments, Links and Docs, Guest, host and attendee lanes) were inspected **only as Figma metadata and text layers** (evidence tier B). None was rendered and inspected: the one image rendered could not be downloaded and later calls hit the plan limit. The Phase 1 exports (tier A) were not re-viewed. The frames contain leftover messenger copy and draw items the contract does not support: an event description, `Co Host` labels, `Search guest` as a search, a Date/Time per link | Pass 3 design fidelity | Pixel fidelity cannot be judged; those items are not built; the section switcher, composer, timestamps and all states are assumptions | No | Handoff section 2.3 and D-5/D-6/D-7: re-inspect when rendered frames are available; raise the mismatches with design/backend. Owner accepted D-7 on 2026-10-23; tab navigation remains an explicit assumption until rendered frames can be reviewed | Open (design; D-7 default accepted) |
| EV-030 | *(Pass 3 planning)* Contract limitations for event comments: the backend sets **no maximum length** (only nonblank), and there is **no realtime** (create emits no socket event; the socket carries live comments, a separate store) | Pass 3 comments (planned) | A very long comment may be accepted; the thread can be stale | No | Handoff D-12: the web imposes no length rule of its own (only the generic request-size guard); a product limit needs a product/backend decision. Assumed refresh: initial load, refetch after the user's own post, explicit user refresh; no polling; never presented as live | Open (limitation; assumption recorded) |

## Pass 3 owner decisions and assumptions (P3-01; 2026-10-23)

The project owner reviewed the Pass 3 decision gate. These decisions govern Pass 3 implementation; they do not claim that the live backend has been verified.

| Decision | Owner's decision | Consequence for Pass 3 |
| --- | --- | --- |
| D-1 — join/leave | **Confirmed: defer join, leave, passcode entry and session admission to Pass 4B.** The roadmap clarification is approved. | P3-09 is removed from Pass 3 and must not start. Do not invent a non-live membership endpoint or treat RSVP, guest membership and live participation as equivalent. EV-028 is resolved as an owner decision. |
| D-2 — add guest | **Option (c): defer web guest addition.** | Do not implement P3-08B or use an unapproved user lookup. Guest-list reading and host remove-guest remain in scope. Revisit add-guest only after a separate product/backend decision approves a suitable user-selection contract. EV-027 is deferred by owner. |
| D-7 — pane navigation | Accept the recommended default: accessible tab list in the details pane; URL state `?tab=comments`, `?tab=resources`, or `?tab=guests`; Details is the default. | Accepted as an implementation assumption, not as pixel-verified design. See A-16 and EV-029. |
| D-8 — guest projection | Accept the recommended default: keep only `userId`, name, username, photo and role; do not keep or show other guests' RSVP status or `joined_at`. | See A-17. |
| D-9 — link/document metadata | Accept the recommended default: do not display link `date_added`; document `size`, `file_type` and `date_uploaded` may be shown when present. | See A-18. |
| D-10 — document opening | Accept the recommended default: use a plain link with `target="_blank"` and `rel="noopener noreferrer"`; no inline preview or `next/image`; resolve media URLs with `resolveMediaUrl` and never construct paths from display names. | See A-19. |
| D-11 — comment projection | Accept the recommended default: keep comment `id`, `message`, `createdAt` and author name, username, photo and role; drop other author fields. | See A-20. |
| D-12 — comment length and refresh | Retain the already documented contract interpretation: nonblank only, no invented character limit; initial load, refresh after own post, and explicit user refresh; no polling or live claim. | This was already resolved in the handoff and is recorded in EV-030; no new owner default was required for P3-01. |

Accepted defaults become assumptions with stable IDs:

- **A-16 — Pass 3 pane navigation:** use an accessible tab list for Details, Comments, Links and docs, and Guests; persist the selected non-details tab in the URL as `?tab=comments`, `?tab=resources`, or `?tab=guests`. Details is the default. This is an implementation assumption until the Pass 3 frames can be rendered and reviewed (EV-029).
- **A-17 — Guest data minimisation:** retain only `userId` (for host removal), name, username, photo and role. Do not retain or display another guest's RSVP status or `joined_at`.
- **A-18 — Resource metadata:** do not display a link's `date_added` because it is the event creation date, not the link date. For documents, show `size`, `file_type` and `date_uploaded` only when supplied.
- **A-19 — Document navigation and media URLs:** open documents through a plain `<a target="_blank" rel="noopener noreferrer">` link; do not use `next/image` or inline previews. Resolve URLs through `resolveMediaUrl`; never derive a media path from a display name.
- **A-20 — Comment data minimisation:** retain comment `id`, `message` and `createdAt`; for the author retain only name, username, photo and role. Drop other author fields.

## Final decisions (end of Phase 1)

Layout and behaviour:
- Supplied Figma exports are the source of truth; Figma itself was never reachable (EV-006).
- Two-pane layout (399 px left pane, flat white panels). The right pane is a neutral "No event selected" placeholder; cards are not selectable yet. Hidden below 1024 px (A-1, A-2).
- Nearby discovery and My events are separate: different routes, hooks, cache roots and BFF routes. Nearby is location-gated; My events needs no location.
- 25 km radius and `filter=my_events` are pinned in the BFF and cannot come from the browser. No global fallback exists anywhere in the UI or API layer.
- Caches are keyed by account `pkid` and `sessionGeneration`. Events are normalised through a field whitelist (host contact data, `guests`, links and documents are never kept).
- Avatar stack omitted until a safe backend contract exists (EV-011). Distance, hashtags, host, privacy and RSVP chips are not shown on cards.
- Shared `TopBar` styling unchanged; the only edit is the Event icon → `/events` (EV-012).
- My events location row (EV-013, Option 2): reuses the label discovery resolved, never requests location, shows "Not set" when none (A-9).
- Mobile navigation (EV-009) is **not** fixed: a scoped proposal is documented, awaiting a decision.

Carry forward into Phase 2:
- Keep using the BFF → `eventsApi` → hooks pattern, the `eventKeys` factory, and account + session-generation scoping for every new query and mutation.
- Details responses have two shapes (full vs restricted preview, both HTTP 200). Model them as a discriminated type and never treat missing preview fields as empty data.
- Passcodes are strings (leading zeros), write-only, never in URLs or persistent caches.
- Event times carry no timezone (EV-004): display as stored, validate the whole schedule, and establish the deployed timezone before the create form.
- Do not treat RSVP, guest membership and joining as the same thing.
- Missing designs: use the app's design language and record assumptions (A-n), as in Phase 1.
- The My events location label is display-only state; it must never feed a request or a cache key.

## Backend dependencies (open)
EV-001 (restricted-event over-disclosure), EV-002 (nearby/25 km not server-enforced), EV-004 (timezone semantics), EV-011 (online-attendee count / avatar preview), EV-019 (location lookup for create), EV-024 (multipart document clearing), EV-025 (live event delete not refused), EV-026 (no viewer online-guest flag; a Pass 3 planning item). EV-027 is a deferred product/backend consideration, not a Pass 3 blocker after the owner decision; EV-028 is resolved by the roadmap clarification.

## Deferred / open, non-backend
EV-005, EV-006 (partly), EV-007, EV-008, EV-009 (decision), EV-010, EV-012, EV-014, EV-015, EV-016, EV-017, EV-018, EV-020 (design), EV-021, EV-022 (hosting and limits), EV-023, EV-027 (web guest addition deferred by owner), EV-028 (join/leave deferred to Pass 4B by owner), EV-029 (Pass 3 design evidence), EV-030 (comment contract limitations).

## Pass 2: what was built (implementation checkpoint `a96887b`)

"Implemented" = code exists and is covered by automated tests. "Owner-smoke-tested" = the project owner reported passing mocked-backend browser smoke tests (no steps or log are in the repo). Nothing was verified against the live backend.

| Area | What exists | Main files |
| --- | --- | --- |
| Full details and restricted preview | One discriminated union: a response is "full" only when it has a `hosts` array, anything else is a preview (both HTTP 200). The BFF strips other people's contact data and the guest list before the browser sees it | `lib/events/normalize.ts`, `app/api/events/[eventId]/route.ts`, `components/events/event-details-view.tsx` |
| Host and guest views | Edit and delete controls for the host only; the server stays authoritative and its 403 is handled | `event-details-view.tsx`, `event-pane.tsx` |
| Create and edit | JSON unless a file is attached, then multipart. Whole-schedule validation (`HH:MM:SS`, end not before start), coordinate pair, name; locked forces private; `is_live` never sent. The backend's 400 is shown and input is kept | `lib/events/{validation,request,form-model,errors}.ts`, `event-form.tsx`, `components/events/form/*`, `app/api/events/create/route.ts` |
| Privacy and passcodes | Four-digit string (leading zeros survive); never in URLs, storage or the query cache | `access-field.tsx`, `use-event-mutations.ts`, `cache.ts` |
| Cover, links, documents | Cover JPEG/PNG up to 2 MiB; documents up to 10 MiB with the guide's MIME list; links validated as http(s); multipart streamed under a byte cap | `cover-field.tsx`, `links-field.tsx`, `documents-field.tsx`, `lib/events/{stream,bff}.ts` |
| Resource-collection semantics | Omitted = keep, `[]` = clear, populated = replace all. Existing document URLs cannot be re-sent, so documents are kept, cleared or replaced by uploads (EV-024) | `lib/events/request.ts` |
| Delete | Confirmation dialog; blocked while the event or its session is live (BFF 409 `event_live`, fail-closed if the state cannot be checked); 204 handled (EV-025) | `delete-event-dialog.tsx`, `[eventId]/route.ts` |
| RSVP | `going` / `interested` / `not_going`; state `set` / `none` / `unknown`; independent of join and guest membership | `rsvp-control.tsx`, `use-event-rsvp.ts`, `app/api/events/rsvp/route.ts` |
| Selection and URL state | `?event=<uuid>`, `&edit=1`, `?create=1`; list items are links; floating create button on My events; `useSearchParams` under a Suspense boundary | `lib/events/selection.ts`, `use-event-selection.ts`, `events-shell.tsx`, `event-link.tsx`, `create-event-button.tsx` |
| Phase 1 guarantees | 25 km radius, no global fallback, account + session-generation cache keys, field whitelist: unchanged | `lib/events/{server,query-keys}.ts` |

**Boundaries.** Pass 2 ends at event details, create/edit/delete and RSVP. **Pass 3** (not started): guest list and guest management, adding and removing guests, joining and leaving, links and documents management, comments. **Pass 4** (not started): live-session lifecycle, admission and realtime, live interactions, media (4A to 4D), which needs a media-provider decision first. RSVP, guest membership and joining stay separate concepts.

**Verification record (Pass 2), by category.** Nothing below was newly executed at closeout.

| Category | Result | Source |
| --- | --- | --- |
| Unit and component tests | 63 files, 834 tests passed | previously reported (E2-VERIFY-01) |
| ESLint, `tsc --noEmit` | clean, exit 0 | previously reported |
| Production build | succeeded | reported by the owner (it failed in the sandbox only because Google Fonts is unreachable) |
| Mocked-backend browser smoke tests | passed: details, previews, host/guest views, create/edit, collections, delete, RSVP | reported by the owner; steps not recorded |
| Live-backend verification | **not done** | no evidence exists |
| Known untested | multipart on the real host, `documents="[]"` clearing, live-delete rejection, backend timezone (EV-004), media host (EV-005), geolocation prompt in the create form, dark mode, accessibility | open gaps: EV-022 to EV-025 |

## Verification record (Phase 1)

Final Phase 1 run (this repo, mocked network; **no live backend call was made**):

| Check | Result |
| --- | --- |
| `npx vitest run lib/events hooks/events components/events app/api/events` | 20 files, 215 tests passed |
| `npx tsc --noEmit` | exit 0, no output |
| `npx next lint` | no warnings or errors |
| `npx vitest run` | 43 files, 594 tests passed (previous run: 42 files, 568) |
| `npx next build` | succeeded; Events routes in the route table |

Chromium checks (mocked API, mocked geolocation, dev server):

| Scenario | Result |
| --- | --- |
| /events (location granted) | one geolocation call; nearby request carries `latitude`/`longitude`, `page`, `limit`; the 25 km radius is added by the BFF and covered by the route tests (browser never sends it) |
| Events → My events (client navigation) | no new geolocation call; row shows the resolved place without scope text or refresh; list loads |
| Direct visit to /events/my-events | zero geolocation calls; row shows "Not set"; My events loads with `filter` forced server-side |
| Location denied on Events, then My events | Events: "Not available" and zero `/api/events/nearby` requests (no global fallback); My events: "Not set", list still loads |
| Paged nearby (page 1 with `next`, page 2) | `page=2` requested after `page=1`; nearby requests never include a client radius |
| EV-009 at 390 / 767 / 768 px | category nav hidden at 390 and 767, visible at 768; no horizontal overflow at any of the three |

Account/session scoping is covered by tests (query keys; `use-last-location`: another account or session generation sees nothing; discovery clears the store on denial).

Not verified by me: typography with the real Work Sans font (the sandbox cannot load it; the project owner reported checking rendered typography and accepted it), any Figma frame directly, the live backend, dark mode, a real browser permission prompt, a production-mode run of the duplicate My events request (EV-018), and widths other than 390 / 767 / 768 / 820 / 1440. The Chromium checks used `next dev -p 5000` without `--turbopack` (the `dev` script uses it).

### Earlier layout-fidelity run
`tsc` exit 0; lint clean; 42 files / 568 tests; build passed; blocked-location render made zero `/api/events/*` requests; no horizontal overflow at 390, 820, 1440.
