# EVENTS.md — Pass 1 / Phase 1: Discovery and My Events

**Status: Phase 1 complete** (accepted by the project owner after reviewing the rendered output, including
typography). Branch `feat/events-phase1`, last implementation commit `5bcbdb9`. Next: Pass 2, see
`docs/events/PHASE-2-HANDOFF.md`.

Scope: nearby discovery (`/events`) and My Events (`/events/my-events`). Details, create/edit,
RSVP, participation and live sessions are later passes and are **not** implemented.

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
- A-1 Right pane shows a neutral "No event selected" placeholder; cards are not selectable yet (opening an event is Pass 2). It is hidden below `lg` (1024 px).
- A-2 Below `lg` only the left pane shows, full width, 16 px side padding (24 px from `sm`). No mobile/tablet design exists; this is a conservative collapse.
- A-3 The 25 km scope is not drawn in the design: it is a `title` tooltip plus screen-reader text ("Within 25 km of") on the location row. A small refresh icon appears next to the place only once a location exists.
- A-4 Location row falls back to "Current location" when the address lookup fails (the address is cosmetic), "Finding location…" while locating and "Not available" when location failed; a stale address is never shown without a current location.
- A-5 Time shown exactly as stored, 24-hour `HH:MM`, never shifted through the browser timezone. Date is "MMM d" (adds the year for other years; shows "MMM d – MMM d" for multi-day events). The design only shows a single-day event in the current year.
- A-6 Padlock, pin and clock glyphs are redraws/lucide equivalents: the design's icon assets were not exported (the design uses a dashed "15" clock and a person-pin).
- A-7 Loading skeleton, empty, error and location-permission states have **no design**; they use the app's established state pattern (rounded icon tile, bold title, muted copy, pill buttons) flattened into the left pane.
- A-8 Work Sans (the app font) could not be loaded in the sandbox used for visual checks (Google Fonts unreachable), so **I did not compare typography glyph-for-glyph**; sizes/weights follow the design numbers. The project owner later reviewed the real rendering and accepted it.
- A-9 My events shows the Location row too (as in the design) but it is a **read-only reflection**: it shows the place Events discovery last resolved, or a neutral "Not set" (muted text and pin) when none has been. It has no 25 km text, no tooltip and no refresh, because My events is not distance-limited and never asks the browser for location.

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
| EV-014 | Designs show host-only items (pencil edit icon on a card, floating "create event" button, "End event", fifth action icon) and the event room (host header, comments, reactions, actions) | right pane, My events cards | Not part of this phase | No | Later phases; right pane is a placeholder | Deferred |
| EV-015 | Passcode modal export is a cropped body: no container, close control, error/loading states; button reads "Very passcode" (probably "Verify passcode"); helper text is lowercase with a trailing comma | passcode dialog | Needed in the join flow, not discovery | No | Pass 2/4. `components/ui/input-otp.tsx` is a candidate base; passcode stays a string | Deferred |
| EV-016 | No designs for loading, empty, error, location-permission, "load more", dark mode, tablet or mobile | Events | States use the app's pattern (A-7); responsive is a conservative collapse (A-2) | No | Request designs; revisit | Open (design) |
| EV-017 | `--primary` token is `#6D8BCF`; the design's blue samples as `#6A88D1` | `app/globals.css` | ~3 units per channel; imperceptible | No | Not changed (global theme) | Deferred |

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
EV-001 (restricted-event over-disclosure), EV-002 (nearby/25 km not server-enforced), EV-004 (timezone semantics), EV-011 (online-attendee count / avatar preview).

## Deferred / open, non-backend
EV-005, EV-006 (partly), EV-007, EV-008, EV-009 (decision), EV-010, EV-012, EV-014, EV-015, EV-016, EV-017, EV-018.

## Verification record

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
