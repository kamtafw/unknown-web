# P4-08A — Live Comments and Reactions HTTP Data Layer

**Status:** Implemented on `feat/events-p4-08-live-comments-reactions`; local verification and owner review pending.  
**Scope:** HTTP BFF routes, request/response sanitisation, web view models, normalisers, API client methods and isolated query keys. No hooks, socket subscriptions, cache mutations or UI are included in P4-08A.

## Route mapping

| Browser BFF route | Upstream mobile-observed route | Method |
|---|---|---|
| `/api/events/live-sessions/{sessionId}/comments/list?page=&limit=` | `/live/sessions/{sessionId}/comments/list?page=&limit=` | GET |
| `/api/events/live-sessions/{sessionId}/comments` | `/live/sessions/{sessionId}/comments` | POST |
| `/api/events/live-sessions/{sessionId}/reactions` | `/live/sessions/{sessionId}/reactions` | POST |

All routes require the existing httpOnly-cookie access token and forward it server-side. Upstream authorization, not-found, rate-limit and other HTTP errors are passed through by the shared BFF helper. The browser never receives the access token.

## Implemented behavior

- Session IDs are accepted only as positive safe integers. Invalid route IDs are rejected before an upstream request.
- Comment list forwards only validated/defaulted `page` and `limit`; the shared pagination parser clamps limit to the existing maximum of 100.
- Comment create accepts only `content`, trims it and rejects blank content. No maximum length is imposed or claimed; the mobile client has no local cap and backend enforcement/Unicode semantics remain unresolved.
- Reaction create accepts only the six mobile-observed values: `👍 ❤️ 😂 😮 👏 🔥`.
- Successful comment and reaction responses are fail-closed: an unreadable documented shape becomes a controlled 502, not a false success.
- Comment and reaction authors are reduced to `id`, `pkid`, first/last name, username and profile photo. Email, phone, presence and unknown fields are removed in the BFF before data reaches the browser.
- The client normalises the mobile wire fields into web camelCase view models. Malformed comments/reactions are dropped; malformed page/result envelopes throw `EventPayloadError`.
- Reaction counts are represented only as the server-provided `emoji_count`; no client-side increment logic exists in this data layer.
- Live-session query keys are account-, login-generation-, session- and page-size-scoped, under a separate root from Pass 3 event discussion comments and Messenger.

## Files added

- `types/events/live.ts`
- `lib/events/live-normalize.ts`
- `lib/events/live-server.ts`
- `lib/events/live-api.ts`
- `lib/events/live-query-keys.ts`
- `app/api/events/live-sessions/[sessionId]/comments/list/route.ts`
- `app/api/events/live-sessions/[sessionId]/comments/route.ts`
- `app/api/events/live-sessions/[sessionId]/reactions/route.ts`
- Focused tests for the three BFF routes, normalisation, request validation/sanitisation, API methods and query keys.

## Explicitly not implemented in P4-08A

- React Query hooks, infinite-query cache insertion and duplicate prevention (P4-08B).
- Independent Events socket handling for `live:comment` and `live:reaction`, session validation and reaction-event deduplication (P4-08C).
- UI integration (P4-08D).

## Remaining contract uncertainties

The exact `live:comment` socket payload, comment ordering, comment maximum length and Unicode counting, ended-session error semantics, reaction throttle thresholds, and `event_id` uniqueness domain remain unconfirmed. These do not change the observed HTTP request shapes above. No live backend request has been made as part of this implementation.

## Verification gate

The authoring environment committed files through the GitHub repository API and did not execute the project. Owner-side checks are still required:

```powershell
npx vitest run app/api/events/live-sessions/routes.test.ts lib/events/live-normalize.test.ts lib/events/live-server.test.ts lib/events/live-api.test.ts lib/events/live-query-keys.test.ts
npx tsc --noEmit
npx eslint types/events/live.ts lib/events/live-normalize.ts lib/events/live-server.ts lib/events/live-query-keys.ts lib/events/live-api.ts app/api/events/live-sessions
git diff --check
```

A dev-backend smoke test should separately verify the three upstream paths, response envelopes, user projection, and reaction 429 passthrough. Until then, this is mobile-contract-aligned implementation, not live-backend verification.
