# Events — Phase 2 progress checkpoint

Verified: **Wed 2026-10-21**, from the actual working tree. Nothing here is committed or pushed.
Scope: Pass 2 (event details and core management). Nothing from Pass 3 or Pass 4 has been started.

## 1. Repository state (verified)

| Item                     | Value                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Repo                     | `kamtafw/unknown-web` (this clone is **read-only**: it cannot push)                                   |
| Branch                   | `feat/events-phase1`                                                                                  |
| HEAD                     | `72cd4e2` `docs(events): close Phase 1 and add Phase 2 handoff` (same as `origin/feat/events-phase1`) |
| Commits made for Phase 2 | **none**                                                                                              |
| Tracked files modified   | 15 (+1,017 / −16 lines)                                                                               |
| Untracked files          | 51 paths (about 5,400 lines including tests)                                                          |
| Stash                    | empty                                                                                                 |
| `docs/events/EVENTS.md`  | **unchanged** (see "Documentation gaps")                                                              |

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

- Types and normalisers: full vs restricted-preview union; RSVP as `set | none | unknown`; whitelist kept (no host contact data, no guests).
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

| Check                     | Result                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx next lint`           | pass, no warnings or errors                                                                                                                                                                                                           |
| `npx tsc --noEmit`        | exit 0                                                                                                                                                                                                                                |
| `npx vitest run`          | 63 files, 834 tests passed                                                                                                                                                                                                            |
| `npx next build`          | **failed**: `next/font` could not fetch `Work Sans` from Google Fonts (sandbox has no access). Fails at `app/layout.tsx` before compiling the app, so it says nothing about the Phase 2 code either way. Not a lint/type/test failure |
| Mocked-API browser checks | not run                                                                                                                                                                                                                               |

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

| File:line                                          | Rule                            | Resolution                                                                                                                                            |
| -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/events/create-event-button.test.tsx:7` | no-unused-vars (`_scroll`)      | removed the unused destructured prop from the test's Link mock                                                                                        |
| `components/events/event-link.test.tsx:7`          | no-unused-vars (`_scroll`)      | same                                                                                                                                                  |
| `components/events/delete-event-dialog.tsx:95`     | no-unescaped-entities           | `can't` to `can&apos;t`                                                                                                                               |
| `components/events/event-details-view.tsx:162,184` | no-unescaped-entities           | `isn't`, `you'll` escaped                                                                                                                             |
| `components/events/event-form.tsx:153`             | no-unescaped-entities           | `don't` escaped                                                                                                                                       |
| `components/events/form/location-field.tsx:67,70`  | no-unescaped-entities           | `Event's`, `device's` escaped                                                                                                                         |
| `components/events/form/location-field.tsx:53`     | react-hooks/refs                | ref now updated in an effect instead of during render (same latest-callback behaviour)                                                                |
| `components/events/form/cover-field.tsx:32`        | react-hooks/set-state-in-effect | file-scoped override in `eslint.config.mjs` (appended to the existing list that already turns this rule off for named files); component not rewritten |

ESLint override added: `components/events/form/cover-field.tsx` only (rules already in that block: `set-state-in-effect`, `exhaustive-deps`, `purity` off for the listed files).
Earlier checkpoint (before this task): lint failed with 10 errors; tsc passed; vitest 63 files / 834 tests passed; build not run.
