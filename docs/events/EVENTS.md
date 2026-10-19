# EVENTS.md — Pass 1 / Phase 1: Discovery and My Events

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
`app/api/events/{nearby,my-events,my-location}/route.ts`; `hooks/events/*`; `components/events/*`;
`app/(events)/events/{layout,page,my-events/page}.tsx`; `TopBar` "Event" → `/events`.

## Design assumptions

Figma could not be read: the first attempts were blocked by the page (`ROBOTS_DISALLOWED`), and
after the Figma connector was added every call returned the Starter-plan tool-call limit. No frame
was inspected, so **nothing here is verified against the designs**.

- A-1 Layout: own route group (like Messenger, D-004), shared `TopBar`, one centred `max-w-6xl` column; no Social sidebar. Route-based "Discover | My Events" pill tabs.
- A-2 Card: 16:9 cover, name, schedule, address + distance, up to 3 tags, first host, privacy/RSVP chips, "Live" and "Passcode" badges. Not a link yet (details = Pass 2).
- A-3 Times are shown exactly as stored, 24-hour `HH:MM`; never shifted through the browser timezone.
- A-4 Copy for location states, empty states and errors is placeholder text in the app's tone.
- A-5 Grid: 1 / 2 / 3 columns at default / `sm` / `xl`; skeletons while loading; infinite scroll.

## Issue log

| ID | Description | Where | Impact | Blocks phase? | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| EV-001 | Backend returns full event objects for restricted events through nearby/list/search (links, documents, hosts incl. email/phone, guests) | `location/nearby`, `list`, `search` | Confidentiality; web can only avoid keeping/showing them | No (security, backend-side) | Web whitelists fields. Backend must filter responses. Optional later: slim in the BFF so contact data never reaches the browser | Open |
| EV-002 | Nearby-only and 25 km are not server-enforced; list/search without `filter` return all events | backend | Direct API callers bypass the rule | No | BFF pins radius and filter; backend change needed for real enforcement | Open |
| EV-003 | Nearby `count`/`total_pages` include expired/orphan locations; pages can be empty with `next` set | `location/nearby` | Pagination could stop early | No | Handled (follow `next`, auto-advance, cap 50 empty pages) | Resolved |
| EV-004 | Event times have no timezone; backend "expired" filter uses its own clock (UTC per guide) | nearby filtering, display | An event may vanish up to ~1 h early/late for UTC+1 users | No | Confirm backend timezone semantics; display as stored | Open |
| EV-005 | Event cover/host-photo host unverified against `next.config.ts` allowed hosts | `event-card.tsx` | Broken images if the host differs | No | Cards use `unoptimized` so nothing throws; confirm host and add `remotePatterns` | Open |
| EV-006 | Figma inaccessible (rate-limited) | UI | Design fidelity unverified | **UI fidelity only** | Re-run UI pass against frames when access works | Open |
| EV-007 | `QueryProvider` default `staleTime` is `10000 * 60 * 5` (50 min), likely a typo for 5 min | `providers/query-provider.tsx` | Stale data for hooks that rely on the default | No | Events hooks set their own `staleTime`; fix separately | Deferred |
| EV-008 | Playwright config targets port 4000 and an `e2e/` dir that does not exist; dev server uses 5000 | `playwright.config.ts` | No e2e coverage possible today | No | Document only | Deferred |
| EV-009 | `TopBar` category nav is `hidden md:flex`; how small screens reach Events/Messenger is untraced | `top-bar.tsx` | Events may be unreachable on mobile widths | No | Needs design input | Deferred |
| EV-010 | Dead-looking `components/navigation/sidebars/*` (links to non-existent routes) | repo | None for Events | No | Document only | Deferred |

## Verification record

See the Phase 1 completion report. Live backend behaviour has **not** been tested.