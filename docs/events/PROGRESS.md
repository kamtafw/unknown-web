# Events — progress and reconciliation

**Current record: Phase 2 closeout, 2026-10-22; Pass 3 checkpoint in section G** (after E2-RECONCILE-01). Pass 2 is **implemented and closed out for delivery** at checkpoint `a96887b`;
by the owner's decision, in-depth verification is deferred to QA or a later session. It is **implemented and owner-smoke-tested, not verified against the live backend**.
**Next pass: Pass 3** (participation, resources, discussions). Pass 3 and Pass 4 are **not started**. Nothing in this file says the Events experience is complete.
The sections after "Historical record" are the earlier checkpoint reports, kept for history; where they conflict with this section, this section wins.

## A. Repository state (verified 2026-10-22)

| Item | Value |
| --- | --- |
| Repo / branch | `kamtafw/unknown-web`, `feat/events-phase1` |
| HEAD | `a96887b` `feat(events): checkpoint phase 2 implementation` (parent `72cd4e2`; 70 files, +6,541 / −16) |
| Remote | `origin/feat/events-phase1` was at `a96887b`: in sync (checked 2026-10-22 before the closeout commit). The closeout commit (docs only) comes on top of it; see git log for its SHA |
| Working tree | clean before the closeout edits; the closeout changes `docs/events/{EVENTS,PROGRESS,PHASE-2-HANDOFF}.md` only |
| Separate clone | `/home/claude/unknown-web` is at `72cd4e2` (its local `origin` ref is stale) with 24 uncommitted entries from a **parallel Phase 2 attempt (lib and BFF helpers only, no UI)** (files dated 2026-10-20 08:39 to 08:44, e.g. `lib/events/{fields,forward,respond,schedule,uploads,form}.ts`, `app/api/events/mutations.test.ts`). The published branch implements the same ground with different modules (`validation`, `request`, `bff`, `stream`); no relevant work was found to be missing from origin. **Not imported, not modified, not cleaned**; the owner decides whether to keep or archive it. |

## B. Evidence categories (kept separate)

| Category | Result | Who ran it / source |
| --- | --- | --- |
| Unit and component tests (Vitest) | 63 files, 834 tests passed | last reported by the previous task (E2-VERIFY-01); **not re-run** in this task, the tree is unchanged since (clean, HEAD = pushed commit) |
| ESLint | no warnings or errors | same |
| `tsc --noEmit` | passed | same |
| Production build (`next build`) | succeeded | **user-reported**, in the owner's environment. It failed in the sandbox only because Google Fonts is unreachable. Not reproduced here |
| Mocked-backend browser smoke tests | all passed | **user-reported**: details, previews, host/guest views, create/edit, collections, delete, RSVP. No test log, scripts or screenshots are in the repo, so the exact steps and viewports are not recorded |
| Live-backend verification | **none** | no evidence anywhere in the repo or docs that any call reached the deployed backend |
| Not tested at all | see section D | |

## C. Status of Pass 2 deliverables

Statuses: VC = Verified complete, IVI = Implemented, verification incomplete, PI = Partially implemented, NI = Not implemented, BL = Blocked.
"Verified complete" needs live-backend evidence wherever behaviour depends on the backend; none exists, so nothing that depends on the backend reaches VC.

| Pass 2 item | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Full details and restricted previews (union, `hosts` marker, whitelist) | IVI | `lib/events/normalize.ts`, `app/api/events/[eventId]/route.ts` GET, `event-details-view.test.tsx`, `routes-write.test.ts` (guests and host contact removed, preview unchanged); smoke (user-reported) | contract from the guide only; no live response seen |
| Host and guest views | IVI | `event-details-view.tsx`, `event-pane.test.tsx`; smoke (user-reported) | role detection depends on backend fields as documented, unverified live |
| Create | IVI | `app/api/events/create/route.ts`, `lib/events/{validation,request,form-model}.ts`, `event-form.test.tsx`, `server-write.test.ts`; smoke (user-reported) | no live create; coordinates only from browser location + `my-location` (no place search exists in the guide) |
| Edit | IVI | `[eventId]/route.ts` PATCH, `request.ts` diffing, `use-event-mutations.test.tsx` | no live PATCH |
| Scheduling (`HH:MM:SS`, end not before start) | IVI | `validation.test.ts`, `server-write.test.ts` | backend timezone unknown (EV-004) |
| Privacy and passcodes (4-digit string, locked forces private, never in URL, cache or storage) | IVI | `access-field.tsx`, `routes-write.test.ts` ("passcode … never in the URL"), `cache.test.ts` | form UI is an assumption (A-11) |
| Cover image, links, documents | IVI | `cover-field.tsx`, `links-field.tsx`, `documents-field.tsx`, `stream.test.ts`, multipart tests in `routes-write.test.ts` | upload limits (5 docs, 10 links, 20 MiB) are provisional; production host unknown (EV-022) |
| Resource-collection semantics (omit = keep, `[]` = clear, populated = replace) | IVI for links and tags; **PI for documents** | `request.test.ts`, `server-write.test.ts` | clearing `documents` inside multipart relies on an unverified assumption (EV-024); existing document URLs cannot be re-sent |
| Delete with confirmation | PI | `delete-event-dialog.tsx`, DELETE route tests (204, live refusal, fail-closed) | BFF live guard is a courtesy; the **backend does not refuse a live delete** (EV-025), so the server-side rule is missing. Ending a session is Pass 4 |
| RSVP and supported states (`set`, `none` or `unknown`, independent of join and guest membership) | IVI | `rsvp-control.tsx`, `use-event-rsvp.test.tsx`, `routes-write.test.ts` | UI is an assumption (A-13); unknown-state rule is derived from the guide |
| Phase 1 guarantees (25 km, no global fallback, scoped caches) | IVI (regression) | Phase 1 tests still pass inside the 834 | the diff removed Phase 1 lines only in files that Pass 2 had to change (layout now renders `EventsShell`; list items wrapped in `EventLink`) |
| Pass 2 documentation (`EVENTS.md`: EV-019+, A-10+) | Done at closeout | `EVENTS.md` now defines A-10…A-15 and EV-019…EV-025 and has a "Pass 2: what was built" section | (earlier finding: these IDs were cited in code but undefined) |
| Pass 3 (guests, join/leave, resources, comments) | NI | no code | |
| Pass 4 (live: 4A to 4D) | NI | no code | needs a media-provider decision first |

Counts that back the table (test titles inspected in this task, not re-run): `routes-write.test.ts` covers GET/POST/PATCH/DELETE/RSVP including 401s, malformed ids,
multipart limits and fail-closed delete; `server-write.test.ts` covers the request builders; `stream.test.ts` 4 tests; `event-form.test.tsx` 12, `event-pane.test.tsx` 6, `rsvp-control.test.tsx` 6,
`delete-event-dialog.test.tsx` 5, `event-details-view.test.tsx` 4, `events-shell.test.tsx` 1; hooks: details 8, mutations 9, RSVP 10.
The `components/events/form/*` fields have no test files of their own; they are exercised only through `event-form.test.tsx`.

## D. Not tested, or verified only through assumptions

- Any call to the deployed backend (all contracts are "documented, not verified").
- Multipart behaviour on the real host: body-size ceiling, streaming passthrough (`duplex: "half"`), and the `Content-Length` cap.
- `documents="[]"` clearing in a multipart update (EV-024).
- Server-side refusal of deleting a live event (EV-025).
- Backend timezone for schedules (EV-004); real media host (EV-005).
- Real browser geolocation prompt for the create form; dark mode; widths other than those the owner smoke-tested (not recorded).
- Accessibility beyond what Testing Library asserts (no keyboard or screen-reader pass recorded).

## E. Blockers, decisions and assumptions

1. **Hosting is unconfirmed** (no Dockerfile, `vercel.json` or CI; only a comment in `middleware.ts`). Upload limits stay provisional until the owner confirms it.
2. **Backend gaps to raise:** live delete not refused (EV-025); multipart document clearing undocumented (EV-024).
3. **Designs:** the Create event frame's text layers were readable in Figma, but screenshots were rate-limited, so the form was built from those layers and the supplied exports. Preview, RSVP, privacy/passcode and delete UI have no design (A-11, A-13, A-14).
4. **Assumptions:** A-10 to A-15 and the issues EV-019 to EV-025 are now recorded in `EVENTS.md` (status assumed or open; none design- or backend-confirmed).
5. **Pass 4 prerequisite:** per the guide, web-created sessions get P2P and legacy signalling can be disabled; the provider must be confirmed against browser broadcasting before 4D.
6. **Schedule:** the six-day delivery target set on 2026-10-21 covers Pass 3 and Pass 4; no estimate has been verified.

## F. Documentation discrepancies found (all corrected at closeout)

1. `EVENTS.md` lacked A-10…A-15 and EV-019…EV-025: added. Existing IDs and history were preserved.
2. `PHASE-2-HANDOFF.md` gave HEAD `5bcbdb9`, said the docs were uncommitted and that no create/edit design existed: marked as a historical document with a superseding note.
3. `EVENTS.md` said "Next: Pass 2" and that cards are not selectable (A-1): corrected, with the old text marked as superseded.
4. Earlier sections of this file said "Nothing here is committed or pushed" and HEAD `72cd4e2`: superseded by section A.
5. EV-014 and EV-015 in `EVENTS.md` were updated to their Pass 2 status (create button implemented; passcode modal still Pass 3/4).

## G. Next pass

**Planning status (revised 2026-10-23; see the 2026-10-24 checkpoint below): Pass 3 was planned, not started.** The complete scope, task plan (P3-01 to P3-10, with P3-08A/B), decisions (D-1 to D-12) and completion checklist are in `docs/events/PHASE-3-HANDOFF.md`; the Pass 3 issues are EV-026 to EV-030 in `EVENTS.md`. No Pass 3 code exists. Decisions made on 2026-10-23 from the documented contract and repo evidence:
- **D-1 (join/leave): resolved to a blocker.** `join` is live-session admission (needs `is_live`) and `leave` is live-coupled; neither is a genuine event-level membership operation, so both stay out of Pass 3 and belong to Pass 4B. P3-09 is blocked with explicit prerequisites; the roadmap line that lists them under Pass 3 needs the owner's explicit clarification (EV-028).
- **D-2 (guest addition): blocked.** No existing user-selection mechanism is confirmed suitable (the Messenger lookup is chat-coupled and undocumented for this use); no Events search endpoint is invented. Guest list and remove guest proceed; add guest (P3-08B) waits for an owner/backend decision (EV-027).
- **Comments:** the backend is authoritative for who may post; the frontend does not infer authorization (EV-026). No length rule and no realtime exist in the contract (EV-030).
- **Designs:** the Pass 3 frames were seen only as metadata/text layers; none was rendered and inspected (EV-029).
**Pass 3 checkpoint (2026-10-23, superseded by the 2026-10-24 checkpoint below):** **P3-01 was completed** (documentation only; commit `2880913` on branch `docs/events-p3-01-confirm-defaults`, cut from `main` `7044b18`, which merged `feat/events-phase1` at `745b4c7`; application code unchanged since the Phase 2 checkpoint `a96887b`). It recorded assumptions A-16 to A-22 and a decision table in `EVENTS.md`. P3-02 was then waiting for the owner's acceptance of D-8 and D-11. D-1 and D-2 remain open and block only P3-09 and P3-08B. Section A above is the Phase 2 closeout record and is correct as history.

**Pass 3 checkpoint (2026-10-24):** the owner accepted D-8/A-17 and D-11/A-20 as worded. **P3-02 is complete** (`2d46430`, branch `feat/events-p3-02-read-foundation`): types, normalisers, query keys, `eventsApi` read methods, three GET routes and a cache helper; no UI. A review found the routes forwarded unapproved fields to the browser, so the owner approved BFF-level minimisation and **P3-02a** implemented it (`f137303`, with sanitisers, fail-closed 502 for unreadable successful bodies, and route tests over the real `server-fetch`). Checks at that checkpoint (mocked transport, no live backend): full Vitest 64 files / 932 tests passed, `tsc --noEmit` exit 0, ESLint on the touched files exit 0; `next build` and browser checks not run. Review findings EV-031 to EV-033 are logged in `EVENTS.md`. **P3-03 was then implemented** (`549bfca`, branch `feat/events-p3-03-details-sections`, accepted by the owner 2026-10-24): `tab` URL state, an accessible Radix tab list for a full event (none for a restricted preview, which ignores `tab`), placeholder section bodies; a tab change replaces the history entry. D-1 (P3-09) and D-2 (P3-08B) stay open.

**P3-04 implemented and accepted by the owner (2026-10-24; final commit `a9b4c95`, branch `feat/events-p3-04-resources-view`, cut from `549bfca`; not merged).** The Links and docs section now reads the P3-02 resources API: `hooks/events/use-event-resources.ts` (account, session and event scoped key; no retry on 401/403/404), `components/events/event-resources-section.tsx` (skeleton, empty state with a host Edit shortcut, error states, separate Links and Documents lists; names rendered as text; anchors only for http(s), `target="_blank"` with `rel="noopener noreferrer"`; no per-link date; document type, size and date only when present), mounted from `components/events/event-details-view.tsx` only while that section of a full event is active, so a preview or `tab=resources` on a preview makes no request. `hooks/events/use-event-mutations.ts`: a successful edit invalidates only that event's resources for the same account and session (`invalidateEventSubResources`); delete (and its 404 path) removes them (`removeEventSubResources`). 403 and 404 are worded by the section (EV-033 for resources); `lib/events/errors.ts` is unchanged. Checks run in this session (mocked transport, no live backend): targeted Vitest 40 files / 527 tests passed; full Vitest 66 files / 997 tests passed; `tsc --noEmit` exit 0; ESLint on the 8 touched files exit 0. `next build` was attempted and failed only because Google Fonts could not be fetched in the sandbox (no network); not verified. No browser check. Limitations: no rendered Figma frame (EV-029), so the section follows A-19/A-22 and the existing pill/row styling; media host unconfirmed (EV-005); a document's size/type/date format is as documented, unverified live. The owner authorised P3-05 next.

**P3-05 implemented and accepted by the owner (2026-10-24; final commit `5319f96`, branch `feat/events-p3-05-comments-read`, cut from `a9b4c95`; not merged).** The Comments section of a full event is a read-only thread over the P3-02 comments data layer: `hooks/events/use-event-comments.ts` (infinite query on `eventKeys.comments`, scoped by account, session, event and page size; page param from the backend `next` link only, so an empty page with a `next` still offers Load more; backend order kept, pages appended and de-duplicated by comment id, nothing re-sorted; no retry on 401/403/404; failures keep loaded pages and report a phase: initial, next-page or refresh) and `components/events/event-comments-section.tsx` (skeleton, empty, populated; avatar with initial fallback, name, `Host` badge for a host author only, plain-text message that wraps, relative time; Refresh and Load more with pending states; no composer, reply, reaction, edit, delete or other controls). It is mounted from `components/events/event-details-view.tsx` only while Comments is the active section of a full event, so a restricted preview, including `tab=comments`, makes no request. EV-033 for comments: a 403 shows a comments-specific access message (not the backend's reused live-session text, no sign-in prompt), a 404 is "comments aren't available" on first load and "no more comments could be loaded" on a later page (the guide says a comments 404 can be a missing event or an invalid page), and a failed or unreadable response is never shown as empty; `lib/events/errors.ts` is unchanged. No polling, socket or optimistic comment (A-21, EV-030): the thread is as fresh as the last load or Refresh. Checks run in this session (mocked transport, no live backend): full Vitest 69 files / 1046 tests passed; `tsc --noEmit` exit 0; ESLint on the 7 touched code files exit 0; `next build` attempted and failed only because Google Fonts could not be fetched in the sandbox, so the build is not verified; no browser check. Limitations: no rendered Figma frame (EV-029), so the layout follows A-22 and the existing row styling; the backend contract is documented, not verified live (timestamp offset format, what a first page with no comments returns, 404 page semantics); relative time uses the browser clock. The owner authorised P3-06 next.

**P3-06 implemented and accepted by the owner (2026-10-25; final commit `d73238f`, branch `feat/events-p3-06-comments-post`, cut from `5319f96`; not merged).** The first Pass 3 write path. BFF: `POST` in `app/api/events/[eventId]/comments/route.ts` to the documented `comments/create` (event id validated; only the trimmed `message` forwarded; blank or non-string message rejected with 400 and no upstream request; the generic 256 KB JSON guard from `lib/events/bff.ts` answers 413 `request_too_large` as a request-size error; no comment length limit anywhere (EV-030); upstream 400/401/403/404 pass through unchanged; a 2xx that is not the documented `data.message` body is a 502, never success; comment text is never logged). Shared helpers added in `lib/events/bff.ts` (`readJsonBody`, `fetchSanitizedPost`; `fetchSanitizedGet` behaves as before), `lib/events/server.ts` (`buildCommentBody`, `sanitizeCommentCreatePayload`), `lib/events/validation.ts` (`normalizeCommentMessage`). Client: `eventsApi.postEventComment`; `hooks/events/use-post-event-comment.ts` (duplicate submits ignored, resolves true only after the server accepted); `lib/events/cache.ts` `refreshCommentsFromFirstPage` (trims this event's cached thread, for the same account and session only, to page 1 and refetches it; **no optimistic insert**, because the 201 has no id, author or time, A-20); `components/events/event-comment-composer.tsx` inside `event-comments-section.tsx`. The composer is shown to every viewer of a full event and is **not gated by inferred authorization** (host status, guest list, online status): the backend decides (D-3). A restricted preview has no composer and makes no comments request. Failures keep the typed text: 400 "couldn't be posted"; 401 "session has expired" (the shared auth flow still applies); 403 "you don't have permission to comment" (no live-session wording, no sign-in prompt); 404 "Only people who have joined this event can post comments" (not a missing event; the selected event is untouched); 413 "too large to send" (a size message, not a length rule); network and server failures offer a retry with the text kept. EV-033 is resolved for comment posting in mocked tests. The composer is shown with a loaded thread (empty or populated), not while the first page of the thread failed to load. Checks run in this session (mocked transport, no live backend): full Vitest 72 files / 1139 tests passed; `tsc --noEmit` exit 0; ESLint on the 19 touched code files exit 0; `git diff --check` clean; `next build` attempted and failed only because Google Fonts could not be fetched in the sandbox, so the build is not verified. **Not done: no browser check of post then appears (no mocked-backend browser harness here) and no live-backend check.** Limitations: composer layout and copy are assumptions (A-22, no rendered Figma frame, EV-029); the documented 201/400/403/404 behaviour is not verified live; the BFF size guard reads the body before measuring it, as the existing create/update guard does; the thread is as fresh as the last load or Refresh (A-21). The owner authorised P3-07 next.

**P3-07 implemented and accepted by the owner (2026-10-25; branch `feat/events-p3-07-guests-read`, cut from `d73238f`; implementation `f0275ff`, final `6e2c365`; not merged).** The Guests section of a full event is a read-only guest list over the P3-02 guest data layer: `hooks/events/use-event-guests.ts` (infinite query on `eventKeys.guests`, scoped by account, session, event and page size; the next page comes from the backend `next` link only, never from the row count; backend order kept and rows de-duplicated by user id; no retry on 401/403/404; failures keep the loaded pages and report a phase) and `components/events/event-guests-section.tsx` (skeleton, empty, populated; avatar with initial fallback, name, `@username` when it adds information, a `Host` badge for role `host` only; Load more with a pending state). **"Search guest"** filters only the rows loaded so far, case-insensitively on name and username, makes no request, says "Searching loaded guests" while more pages exist and keeps Load more available; rows from later pages join the active filter, and clearing the search leaves pagination untouched. A first load answered with 403 shows "Only the host and guests can see the guest list." (a status message, not an error, no retry, no sign-in prompt); 404 is "The guest list isn't available", 401 "session expired" (the shared auth flow still applies), other failures offer Retry, and a failure or unreadable response is never an empty list. RSVP status, join date, contact details and online status are not retained (A-17) and not shown; there are no add or remove controls (P3-08A/B are not started). It is mounted from `components/events/event-details-view.tsx` only while Guests is the active section of a full event, so a restricted preview, including `tab=guests`, and the other tabs make no guest request; the Guests placeholder was removed. `lib/events/errors.ts` is unchanged and nothing in the data layer or BFF changed. Checks run in this session (mocked transport, no live backend): full Vitest 74 files / 1189 tests passed; `tsc --noEmit` exit 0; ESLint on the 7 touched code files exit 0; `git diff --check` clean; `next build` attempted and failed only because Google Fonts could not be fetched in the sandbox, so the build is not verified. **Not done: no browser check (no mocked-backend harness) and no live-backend check.** Limitations: layout and copy are assumptions (A-22, no rendered Figma frame, EV-029); the guest-list contract (403 for non-members, `next` pagination, newest-joined-first order) is guide-derived, not verified live; search covers loaded guests only. The owner authorised P3-08A next.

**P3-08A implemented (2026-10-25, branch `feat/events-p3-08a-remove-guest`, cut from `6e2c365`; implementation commit `4c079c0`; awaiting owner review, not merged).** Hosts can remove a guest from a full event. BFF: `POST app/api/events/[eventId]/guests/remove/route.ts` to the documented `guests/remove` (event id validated; `user_id` must be a positive safe integer, otherwise 400 `invalid_guest` with no upstream request; only `user_id` is forwarded; the 256 KB JSON guard applies; a 2xx that is not the documented success envelope is a 502, never success; upstream 401/403/404 pass through unchanged so a host-only 403 and a "Guest not found" 404 stay distinguishable; nothing sensitive is logged). Builders `buildGuestRemoveBody` and `sanitizeGuestRemovePayload` are in `lib/events/server.ts`. Client: `eventsApi.removeEventGuest`; `hooks/events/use-remove-event-guest.ts` (duplicate submits ignored; **a 404 whose message says "Guest not found" is treated as already removed**, matched on the message text because the guide documents no distinct code, and every other 404 is an error; no optimistic row removal); `lib/events/cache.ts` gains `refreshFromFirstPage` (`refreshCommentsFromFirstPage` now calls it, behaviour unchanged), so on success page 1 of this event's guests **and comments** is refetched for the same account and login session only, because the guide says removal deletes that guest's comments. UI: `components/events/remove-guest-dialog.tsx` and a per-row **Remove** action in `event-guests-section.tsx`, shown only when `isHost` (a hint; the server decides; `event-details-view.tsx` passes it). The confirmation names the guest, says their comments in this event are deleted too and that it can't be undone, and makes no claim about live media. Keep guest closes without a request; confirm and dismissal are disabled while pending; success toasts ("was removed" or "was already removed"); failures stay in the dialog with local wording (403 host-only, event-not-available, session expired, connection, server, retry). `lib/events/errors.ts` is unchanged. P3-07 behaviour (next-link pagination, loaded-row search, Load more, Host badge, 403 message, no guest fetch for restricted previews) is preserved. Checks (mocked transport, no live backend): full Vitest 79 files / 1251 tests passed; `tsc --noEmit` exit 0; ESLint on all touched code files exit 0; `git diff --check` clean; `next build` failed only on the Google Fonts fetch, so the build is not verified. **Not done: no browser check and no live-backend check.** Limitations: the 403/404/200 behaviour and the comment cascade are guide-derived, not live-verified; the "Guest not found" match relies on message text; dialog copy is an assumption (A-22). D-2 stays open; P3-08B, P3-09 and P3-10 are not started.

**Pass 3 — Participation, Resources, and Discussions** (per the roadmap). Not started. Before building:
- Pass 3 starts with repository and contract checks against the guide (guest list, guest management, join/leave, links and documents management, comments), and keeps RSVP, guest membership and joining as separate concepts.
- Carry-forward items for QA or a later session (not prerequisites): live-backend verification of Pass 2 (EV-024, EV-025, EV-004), the hosting and upload ceiling (EV-022), and a keyboard/screen-reader pass.
- Pass 4 still needs a media-provider decision (guide: web-created sessions get P2P; legacy signalling can be disabled) before 4D.

---

# Historical record (superseded where it conflicts with the sections above)

## Earlier checkpoint (2026-10-21, pre-commit): Phase 2 progress

Verified: **Wed 2026-10-21**, from the actual working tree. Nothing here is committed or pushed.
Scope: Pass 2 (event details and core management). Nothing from Pass 3 or Pass 4 has been started.

## 1. Repository state (verified)

| Item | Value |
| --- | --- |
| Repo | `kamtafw/unknown-web` (this clone is **read-only**: it cannot push) |
| Branch | `feat/events-phase1` |
| HEAD | `72cd4e2` `docs(events): close Phase 1 and add Phase 2 handoff` (same as `origin/feat/events-phase1`) |
| Commits made for Phase 2 | **none** |
| Tracked files modified | 15 (+1,017 / −16 lines) |
| Untracked files | 51 paths (about 5,400 lines including tests) |
| Stash | empty |
| `docs/events/EVENTS.md` | **unchanged** (see "Documentation gaps") |

How this was reconstructed: the work was produced across earlier segments of this session whose
conversation is no longer in context. The state below comes from file contents, file timestamps
(Oct 20 03:44 to Oct 21 01:27) and the task list, not from memory of the work.

## 2. Files changed

**Modified (tracked):** `app/(events)/events/layout.tsx`, `components/events/{event-list,events-pane,my-events-list}.tsx`,
`components/events/my-events-list.test.tsx`, `lib/events/{api,constants,normalize,query-keys,server}.ts`,
`lib/events/{api,constants,normalize}.test.ts`, `types/events/api.ts`, `vitest.setup.ts` (adds a
`useSearchParams` stub to the shared `next/navigation` mock).

**New, BFF:** `app/api/events/[eventId]/route.ts` (GET details, PATCH update, DELETE with live guard and 204),
`app/api/events/create/route.ts`, `app/api/events/rsvp/route.ts`, `lib/events/{bff,stream}.ts`
(streaming multipart passthrough with a Content-Length cap).

**New, domain/lib:** `lib/events/{validation,request,form-model,errors,cache,selection}.ts`.

**New, hooks:** `hooks/events/use-event-{details,mutations,rsvp,selection}.ts`, `hooks/events/use-form-location.ts`.

**New, UI:** `components/events/{events-shell,event-pane,event-details-view,event-form,rsvp-control,delete-event-dialog,event-link,create-event-button}.tsx`,
`components/events/form/{fields,cover-field,location-field,access-field,tags-field,links-field,documents-field}.tsx`,
`components/ui/switch.tsx`.

**New, tests:** one `.test` per module above (routes, stream, server-write, request, validation, errors, cache,
selection, hooks, and the components), plus `lib/events/__fixtures__/form.ts`.

## 3. Status by area

**Complete (implemented, unit-tested, type-checks):**
- Types and normalisers: full vs restricted-preview union; RSVP as `set`, `none` or `unknown`; whitelist kept (no host contact data, no guests).
- Request builders and validation: `HH:MM:SS`, passcode as a 4-digit string, locked forces private, schedule validated whole
  (including the backend's "end time not before start time even on a later day"), coordinate pair, cover/document type and size,
  collection semantics (omit = keep, `[]` = clear, populated = replace all), JSON unless a file is attached.
- BFF routes: UUID validation, DELETE 204 handled without `NextResponse.json`, live-delete guard (409 `event_live`) that
  re-checks details first, multipart streamed (not buffered) with a size cap, RSVP body validation.
- API client, query keys (account + session scoped), hooks, RSVP state resolution (list-cache seed only for the same account/session), passcode scrubbing after success.
- UI: selection via `?event=` / `&edit=1` / `?create=1`; right pane (placeholder, create form, details, preview, edit);
  selectable list items; floating create button on My events; RSVP control; delete confirmation with live explanation;
  create/edit form (cover, location button, name, duration, access/passcode, tags, links, documents).
- Phase 1 guarantees untouched: no change to the 25 km radius, no-global-fallback, or nearby/My events routes and cache roots.

**Partial / known defects:**
- Lint errors from the previous checkpoint are **resolved** (E2-VERIFY-01, see section 7).
- Form assumes limits that differ from my earlier proposal: `MAX_DOCUMENTS = 5`, `MAX_LINKS = 10`, total upload default
  20 MiB (`NEXT_PUBLIC_EVENTS_MAX_UPLOAD_BYTES`). These are provisional UI/BFF limits, not verified against the host.
- One `act(...)` warning in `use-event-rsvp.test.tsx` ("keeps each account's answer apart"); the test passes.

**Not implemented / not done:**
- `docs/events/EVENTS.md` updates: new issue entries (EV-019+), assumptions (A-10+), verification record.
  Code comments already cite **A-10…A-15, EV-024, EV-025**, which do not exist in `EVENTS.md` yet.
- `npx next build` has **not** been run on the current tree.
- Mocked-API browser checks (Chromium) for the new screens have **not** been run.
- Nothing has been tested against the live backend (it is unreachable from this sandbox).
- Pass 3 (guests, join/leave, comments, resource viewing) and Pass 4 (live): not started.

## 4. Checks actually run

Latest run (E2-VERIFY-01, Oct 21 evening). Earlier checkpoint results are in section 7.

| Check | Result |
| --- | --- |
| `npx next lint` | pass, no warnings or errors |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 63 files, 834 tests passed |
| `npx next build` | **failed**: `next/font` could not fetch `Work Sans` from Google Fonts (sandbox has no access). Fails at `app/layout.tsx` before compiling the app, so it says nothing about the Phase 2 code either way. Not a lint/type/test failure |
| Mocked-API browser checks | not run |

## 5. Blockers and open items

1. **Delivery:** this clone cannot push. Nothing is committed. A commit/push path needs your approval (and `add_repo` with push access).
2. **Production host unknown:** no Dockerfile, `vercel.json` or CI config in the repo; `middleware.ts` only mentions Vercel and Coolify in a comment.
   Real upload ceiling is unverified; limits above are provisional and need your confirmation.
3. **Backend unverified:** every contract is from the guide. Open backend gaps: live delete is not refused server-side (EV-025, the BFF guard is not a
   security boundary); `documents` cleared inside a multipart request is an unverified assumption (EV-024).
4. **Designs:** only the Create event frame's text layers were available; screenshots were rate-limited. Privacy/passcode, preview, RSVP and delete UI are assumptions to document.
5. **Time horizon:** live sessions (Pass 4) need a media-provider decision (the guide says web hosts get P2P, and legacy signalling can be disabled) before they can be scheduled realistically.

## 6. Current task and next task

Current task: Phase 2 verification gate. Lint, tsc and tests are green; **production build is unverified** (environment limit). Phase 2 is **not** complete.

Next assignment: get `next build` to run where Google Fonts is reachable (or with the font stubbed locally, outside the repo), then run the
mocked-backend smoke test of create, details, edit and delete, then update `EVENTS.md` (EV-019+, A-10+).

## 7. E2-VERIFY-01: lint resolution

| File:line | Rule | Resolution |
| --- | --- | --- |
| `components/events/create-event-button.test.tsx:7` | no-unused-vars (`_scroll`) | removed the unused destructured prop from the test's Link mock |
| `components/events/event-link.test.tsx:7` | no-unused-vars (`_scroll`) | same |
| `components/events/delete-event-dialog.tsx:95` | no-unescaped-entities | `can't` to `can&apos;t` |
| `components/events/event-details-view.tsx:162,184` | no-unescaped-entities | `isn't`, `you'll` escaped |
| `components/events/event-form.tsx:153` | no-unescaped-entities | `don't` escaped |
| `components/events/form/location-field.tsx:67,70` | no-unescaped-entities | `Event's`, `device's` escaped |
| `components/events/form/location-field.tsx:53` | react-hooks/refs | ref now updated in an effect instead of during render (same latest-callback behaviour) |
| `components/events/form/cover-field.tsx:32` | react-hooks/set-state-in-effect | file-scoped override in `eslint.config.mjs` (appended to the existing list that already turns this rule off for named files); component not rewritten |

ESLint override added: `components/events/form/cover-field.tsx` only (rules already in that block: `set-state-in-effect`, `exhaustive-deps`, `purity` off for the listed files).
Earlier checkpoint (before this task): lint failed with 10 errors; tsc passed; vitest 63 files / 834 tests passed; build not run.
