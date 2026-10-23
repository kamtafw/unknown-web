# Events — Phase 2 handoff

> **Historical document.** Written before Pass 2 started. **Superseded at Pass 2 closeout:** Pass 2 is implemented
> (checkpoint `a96887b` on `feat/events-phase1`), the Phase 2 documentation was committed, and the Create event design
> was found in Figma (text layers). What was built, the assumptions (A-10 to A-15), issues (EV-019 to EV-025) and the
> verification record are now in `docs/events/EVENTS.md` ("Pass 2: what was built") and `docs/events/PROGRESS.md`.
> The next pass is **Pass 3**. Statements below that say Pass 2 is not started, give HEAD `5bcbdb9`, or say no create/edit design exists are
> stale; the rest is kept for context and for the guide's contract notes.

For the next Claude session (and any developer picking this up). Phase 1 (Pass 1) is complete and accepted.
**Nothing from Pass 2 had been implemented when this was written.** Read this, then `docs/events/EVENTS.md` (issue log, assumptions,
verification record). The backend reference is the Project doc `events-api-web-implementation-guide.md` ("the guide").
Everything the guide says is **documented, not verified against the deployed backend**. No live-backend call has ever been made from this work.

---

## A. Project and repository context

**Repository state when this was written**
- Repo `kamtafw/unknown-web`, branch `feat/events-phase1`, HEAD `5bcbdb9` (`origin/feat/events-phase1` is at the same commit).
- Earlier Phase 1 commits: `2a9b6bf` (discovery and My events), `2cf054f` (two-pane layout correction).
- Working tree at that time: `docs/events/EVENTS.md` modified and `docs/events/PHASE-2-HANDOFF.md` new, both **uncommitted**. Re-run `git status` before relying on this.

**Stack and conventions** (from `package.json` and the code)
- Next.js 15.2.8 App Router, React 19, strict TypeScript, Tailwind v4 (oklch tokens, `--primary` `#6D8BCF`), shadcn "new-york" components, lucide icons, Work Sans.
- TanStack Query v5, zustand v5, axios, zod 3 + react-hook-form (+ `@hookform/resolvers`), `socket.io-client`, `date-fns` and `dayjs`, `input-otp`, `sonner`, `uploadthing`.
- Tests: Vitest 3 + happy-dom + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Scripts: `npm test` (watch), `npx vitest run`, `npx next lint`, `npx tsc --noEmit`, `npx next build`. The `dev` script is `next dev --turbopack -p 5000`.
- Playwright config targets port 4000 and a missing `e2e/` directory (EV-008). There is no e2e suite. Visual checks so far were ad hoc Chromium scripts kept **outside** the repo.
- Existing UI primitives relevant to Pass 2: `components/ui/{dialog,alert-dialog,form,input,label,popover,input-otp,skeleton,sonner,button,scroll-area}.tsx`. There is no date/time picker, select or file-upload component in `components/ui`.

**Request flow (browser → Django)**
1. Browser code calls `eventsApi.*` (`lib/events/api.ts`), which uses the shared axios `apiClient` against same-origin `/api/events/*`.
2. A Next route handler under `app/api/events/*/route.ts` reads the HTTP-only access cookie with `getAccessToken()` (`lib/cookies.ts`); no token → 401 JSON.
3. The handler builds the upstream path/query with pure helpers in `lib/events/server.ts` (client-supplied scope values are ignored), then calls `proxyJson` (`lib/server-fetch.ts`) against `DJANGO_API_URL` (`lib/server-config.ts`; env, default `https://dev.appscombo.org/api/v1`) with `Authorization: Bearer <token>`, `cache: "no-store"`.
4. The axios interceptor (`lib/axios.ts`) refreshes once on a 401 through `/api/auth/refresh` and retries; it also toasts on network/gateway errors.
5. Responses are normalised in `lib/events/normalize.ts` into whitelisted types (`types/events/api.ts`) before reaching hooks/components.

**Account and cache scoping**
- `stores/auth-store.ts` exposes `user.pkid` and `sessionGeneration` (bumped on login as a different user and on logout).
- Every Events query key includes both: `eventKeys` in `lib/events/query-keys.ts` (roots `["events","nearby"]` and `["events","my-events"]`, then `accountId`, `sessionGeneration`, params). New queries and mutations must follow this.
- `stores/events-location-store.ts` is display-only state (label, account + generation tagged, not persisted). It must never feed a request or cache key.

**Events routes and layout**
- `/events` (nearby discovery) and `/events/my-events`, in the `app/(events)` route group. `app/(events)/events/layout.tsx` renders the shared `TopBar` (unchanged except the Event icon href), `DashboardAuthBootstrap`, a 399 px left pane (the page content) and `EventRoomPlaceholder` on the right (hidden below 1024 px).
- The Social sidebar is deliberately not used for Events.

**File map**

| Area | Files |
| --- | --- |
| Types | `types/events/api.ts` |
| Pure logic + tests | `lib/events/{constants,location,server,normalize,pagination,search,format,query-keys,api}.ts` (each has a `.test.ts`) |
| Route handlers | `app/api/events/{nearby,my-events,my-location}/route.ts`, `app/api/events/routes.test.ts` |
| Hooks | `hooks/events/{use-geolocation,use-nearby-events,use-my-events,use-event-address,use-last-location}.ts` (+ tests; `use-event-address` has none) |
| Store | `stores/events-location-store.ts` |
| Components | `components/events/{events-pane,events-tabs,location-row,location-state,event-card,event-list,event-room-placeholder,nearby-discovery,my-events-list}.tsx` (tests for all except `location-state`, `event-list`, `event-room-placeholder`) |
| Pages | `app/(events)/events/{layout,page,my-events/page}.tsx` |
| Docs | `docs/events/EVENTS.md`, this file |

---

## B. Completed work (Phase 1)

- **Foundation:** types, helpers, query keys, BFF routes, API utilities and hooks, route/nav foundation (commit `2a9b6bf`).
- **Layout and design corrections** (`2cf054f`): two-pane layout, scrolling panes, segmented Events / My events control, search field, borderless cards (352 : 132 cover, padlock, title, address, date/time or "LIVE NOW!"), dividers and spacing, conservative responsive collapse.
- **Nearby discovery:** browser geolocation with distinct states (finding, denied/blocked, unavailable, timeout, unsupported); nothing is requested without coordinates; `radius_km=25` pinned in the BFF; both nearby response shapes normalised; pagination by `next` only, advancing past empty pages (caps in `lib/events/constants.ts`); local nearby search with a "complete / partial" indicator. Address lookup via `my-location` is cosmetic.
- **My events:** separate route, hook, cache root and BFF route; always `filter=my_events`, including search; needs no location.
- **Location row on My events (EV-013, Option 2), commit `5bcbdb9`:** reuses the label discovery last resolved; never requests location; "Not set" when none; label cleared when discovery's location stops being ready; scoped to account + session generation; in memory only. Limitation: no expiry, so it can go stale within a page session.
- **Tests and verification actually run** (details and the browser scenarios are in `EVENTS.md` → Verification record):
  - Focused Events suites: 20 files, 215 tests passed.
  - Full suite: 43 files, 594 tests passed.
  - `npx tsc --noEmit` clean, `npx next lint` clean, `npx next build` succeeded.
  - Chromium with mocked API and geolocation: two-pane layout, zero `/api/events/*` calls when location is blocked, no geolocation call on My events, `page=2` follows `page=1`, no horizontal overflow at 390 / 767 / 768 / 820 / 1440 px.
  - **Not verified:** the live backend, Figma frames directly, dark mode, a real browser permission prompt, a production-mode run of EV-018. The project owner reviewed real rendering including typography and accepted it; this work could not load Work Sans.

---

## C. Decisions that carry forward

1. **Supplied Figma exports are the source of truth.** Figma itself was never reachable (EV-006). Where a design is missing, use the app's design language and record an assumption `A-n` in `EVENTS.md` rather than stopping.
2. **Two-pane layout** with a neutral "No event selected" right pane. Cards are not selectable yet; opening an event is Pass 2.
3. **Nearby discovery and My events stay separate** (routes, hooks, cache roots, BFF routes). Nearby is location-gated; My events is not.
4. **25 km and no global fallback.** The radius and `filter=my_events` are pinned server-side in the BFF. The UI and API layer have no path to unfiltered list/search for discovery. Do not add one for any new feature (for example an event picker).
5. **Account/session-scoped caches and a field whitelist.** `normalizeEvent` copies fixed fields only: host email/phone, `guests`, links and documents are not kept from list/nearby payloads (EV-001).
6. **Avatar stack omitted** until a backend contract provides an online-attendee count and safe avatar preview (EV-011). Do not render raw `guests` or derive a count from them.
7. **Shared TopBar styling unchanged** (EV-012). The only edit is the Event icon href.
8. **My events location row** is display-only and read-only, as in B.
9. **Mobile navigation** is not fixed (EV-009); a scoped proposal awaits the owner's decision.

---

## D. Outstanding issues (status as in `EVENTS.md`; none marked resolved without evidence)

| ID | Summary | Status |
| --- | --- | --- |
| EV-001 | Backend returns full event objects (links, documents, hosts incl. email/phone, guests) for restricted events via nearby/list/search. | Open, backend |
| EV-002 | Nearby-only and 25 km are not server-enforced; unfiltered list/search return everything. | Open, backend |
| EV-003 | Nearby counts include expired/orphan locations; empty pages with `next`. | Resolved in web (handled) |
| EV-004 | Event times carry no timezone; backend uses its own clock (UTC per guide). | Open, backend/product |
| EV-005 | Cover/host-photo host unverified against `next.config.ts` allowed hosts; cards use `unoptimized`. | Open. **Matters more in Pass 2** (cover uploads) |
| EV-006 | Figma unreachable; exports used. | Partly resolved |
| EV-007 | `QueryProvider` default `staleTime` is `10000 * 60 * 5` (50 min), likely a typo. Events hooks set their own. | Deferred |
| EV-008 | Playwright config targets port 4000 and a missing `e2e/`. | Deferred |
| EV-009 | Events unreachable through navigation below 768 px (category nav is `hidden md:flex`; `MobileNav` unused; logo not a link). Proposed Events-layout-only `md:hidden` switcher **not implemented**; a shared mobile nav needs a design. | Open, awaiting decision |
| EV-010 | Unused `components/navigation/sidebars/*` linking to non-existent routes. | Deferred |
| EV-011 | Avatar stack needs backend online-attendee count + avatar preview. | Open, backend |
| EV-012 | Shared TopBar differs from the design (height, search pill, icon styling, ring on the 4th icon, bell badge). | Deferred, left unchanged on purpose |
| EV-013 | My events location row. | Resolved (Option 2, see B) |
| EV-014 | Designs show host-only items (edit pencil, floating create button, End event, a fifth action icon) and the event room. | Deferred to later passes |
| EV-015 | Passcode modal export is a cropped body (no container, close, error/loading states; button reads "Very passcode"). | Deferred; needed in Pass 2/4 join flow |
| EV-016 | No designs for loading, empty, error, permission, "load more", dark mode, tablet or mobile. | Open (design) |
| EV-017 | `--primary` `#6D8BCF` vs sampled design blue `#6A88D1`. | Deferred |
| EV-018 | In `next dev`, client-side navigation to My events sends the first request twice. Present at the previous commit too; **not checked in a production build**. | Deferred |

---

## E. Phase 2 scope (Pass 2: event details and core management)

Source: the Project instructions' roadmap plus the guide. Not implemented.

**Goal:** the core event lifecycle outside live sessions, without violating backend rules.

**In scope (per the roadmap)**
- Full event details and restricted previews; host and guest views.
- Create and edit: validation, scheduling, location, privacy, passcodes, cover image, links, documents; resource-collection update semantics.
- Delete with confirmation.
- RSVP and its supported states.
- Loading, submission, validation, upload and failure states.

**Out of scope (later passes):** guest list and management, join/leave, links/documents *viewing* management and comments (Pass 3); anything live (Pass 4). RSVP, guest membership and joining are different concepts and must not be merged.

**Rules the roadmap and guide already fix**
- Details can return HTTP 200 with a **restricted preview** (`id`, `name`, dates, times with seconds, `is_locked`, `is_live`, `privacy`, `cover_image`, `live_session_id`, flat `address`, flat `hashtags` only). Model full vs preview as a discriminated type; never read missing preview fields as empty data or as permission (guide §3.3, §4.8, §8.4).
- Passcodes are four ASCII digits, **strings**, write-only, never in URLs or persistent caches (§4.5, §8.4, §8.5).
- Create/update times need `HH:MM:SS`; responses give `HH:MM` (preview may include seconds) — normalise both (§2, §4.5).
- Create needs both `latitude` and `longitude`; update moves the location only when both are sent. Request coordinates are lat/lng; returned arrays are lng-first (§2, §4.5, §4.6).
- Locked forces privacy to `private`. The backend rejects start time after end time even for multi-day events, and partial updates bypass merged-schedule checks, so the form must validate the whole schedule (§4.5, §4.6).
- Update collections: omitted = keep, `[]` = clear, populated = replace the whole collection; existing document URLs cannot be resent (§4.6, §8.5).
- Delete returns 204 with no body; host only; the backend does not end a running live session first (§4.7).
- RSVP: `POST rsvp`, 201 for create and replace; event must exist and not have ended; it does not join, create a guest row, or add the event to My events (§4.9).
- After create/update/delete, invalidate nearby, My events, details and resources (§8.5).

**Likely files:** new `types/events/api.ts` additions (details union, form payloads, RSVP); `lib/events/{normalize,server,api,query-keys,format}.ts` plus tests; new route handlers for details, create, update, delete, rsvp (and multipart handling); `hooks/events/*` for details and mutations; new components for the details view (host/guest/preview), create/edit form, delete confirmation and RSVP control; the layout's right pane (replacing `EventRoomPlaceholder`) and a route for a selected event; `docs/events/EVENTS.md`. Exact structure is for the plan; do not pre-build abstractions for Pass 3 or 4.

**Acceptance criteria (draft, to be agreed in the plan)**
1. A user can open full details or a restricted preview from a card; the two shapes render distinctly and the preview never shows resources or host controls.
2. A host can create an event (all supported fields), edit it, and delete it after confirmation; non-hosts see no host controls and server 403s are handled.
3. Validation covers the complete schedule, coordinate pairs, passcode format, cover and document limits (cover JPEG/PNG ≤ 2 MiB; documents ≤ 10 MiB with the allowed MIME list in guide §7) before submit, and the backend's 400 is still surfaced with form input preserved.
4. RSVP works for `going` / `interested` / `not_going` and is independent of join/guest state.
5. Targeted tests for each normaliser, request builder, route handler, hook and component; `tsc`, lint, full Vitest and build pass against the Phase 1 baseline (43 files / 594 tests) and any pre-existing failure is distinguished from a regression.
6. No change to the nearby-only, 25 km, no-fallback, cache-scoping or whitelist rules.

**To verify before implementing (do not assume):**
- **Timezone** the deployed backend uses for event times, and what the form should show (EV-004).
- **How the create form obtains coordinates.** The guide documents only reverse geocoding (`my-location`). There is no documented place search or forward geocoding, and no design for a location picker. Options (browser location, map, address search) need a product decision; do not invent an endpoint.
- **Multipart through the BFF.** Existing handlers proxy JSON only. Confirm that a Next 15 route handler can forward `multipart/form-data` (indexed `documents[0].doc_file` fields, `links[0].url`, `hashtags[0]`) and what body-size limits apply in the deployed environment. The existing `uploadthing` dependency is not the events backend's upload path.
- **Media host** for covers and documents against `next.config.ts` (EV-005); relative media paths must be resolved.
- **How to identify host controls** on the client: guide §8.4 says to compare the host UUID or numeric `pkid` from full data; the server stays authoritative. Check the `user` shape in `stores/auth-store.ts` (`pkid`, `id`).
- **Restricted-preview RSVP:** previews omit `viewer_rsvp_status`, so the current RSVP cannot be shown there from details alone. Confirm the intended UX.
- **Passcode creation/edit rules** (guide §4.6: explicit-empty rejected while locked; unlocking does not reset privacy or erase the stored code) against real responses.
- **Delete while live:** the backend does not end the live session; decide how Pass 2 guards a live event (disable or block) without implementing Pass 4.
- **Designs available:** per `EVENTS.md`/EV-014/EV-015, only the room views (attendee and host) and a cropped passcode modal exist. No create/edit form, restricted-preview, RSVP or delete-confirmation designs were identified. Ask for them, but continue with documented assumptions where they are missing.
- Routing: where a selected event lives (for example `/events/[id]` or a query param) is undecided; resolve in the plan.

---

## F. Recommended next-session workflow

1. Read this file and `docs/events/EVENTS.md`.
2. Inspect the current repository state (`git status`, branch, HEAD) and the Pass 2 section of the Project roadmap; check only the files Pass 2 touches.
3. Verify the existing implementation and the guide's contracts relevant to Pass 2 (sections 3.1–3.4, 4.5–4.9, 7, 8.4–8.5, 9). Do not call endpoints that mutate data without asking.
4. List missing information and blockers (see the verify-first list above), using an `EV-nnn` issue log entry for each, continuing numbering at EV-019.
5. Present a scoped implementation plan with files and acceptance criteria for approval.
6. **Wait for approval before editing code.**

Do not repeat Phase 1 work, reopen the visual review, or begin with a broad repository audit. Do not start Pass 3 or Pass 4 items.
