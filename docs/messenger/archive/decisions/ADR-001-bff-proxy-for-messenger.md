# ADR-001 — BFF Proxy Pattern for Messenger HTTP

## Context

Messenger needs to call the same Django backend (`DJANGO_API_URL`) that every existing web feature already calls. The web app has an established pattern for this: `app/api/**/route.ts` Next.js Route Handlers read the httpOnly `ac_token` cookie server-side, attach `Authorization: Bearer <token>`, and forward to Django via `lib/server-fetch.ts`'s `proxyJson`. Client JS never sees the token.

## Problem

Should Messenger's `chats/*`, `groups/*`, `statuses/*` (and later `schedules/*`, `calls/*`, `live/*`, `communities/*`) HTTP calls follow this same pattern, or call Django directly from the browser?

## Constraints

- The httpOnly cookie architecture is load-bearing for the whole app's auth model, not just Messenger — it can't be bypassed for one feature without weakening it everywhere.
- Two-week delivery window — introducing a second HTTP client pattern would cost time without a corresponding benefit.

## Options Considered

### Option A — Extend the existing BFF proxy pattern

Pros: Zero new auth surface, reuses `getAccessToken()` / `proxyJson()` / `apiClient` retry-on-401 handling already battle-tested by every other feature; consistent codebase.
Cons: None identified — this isn't actually a close call.

### Option B — Call Django directly from the browser for Messenger only

Pros: One fewer network hop.
Cons: Requires exposing the access token to client JS (defeats the httpOnly cookie's purpose), a second CORS configuration on the Django side, and a parallel auth-refresh implementation. Directly contradicts the project's own instruction not to create a parallel authentication mechanism.

## Decision

Option A. Every Messenger HTTP endpoint gets a matching `app/api/chats/...` (etc.) Route Handler, built exactly like the existing `app/api/users/*` / `app/api/socials/*` routes.

## Why

There's no real trade-off here — this is "follow the pattern that already exists and already works" rather than a genuine architecture choice between comparable options.

## Trade-offs

None beyond the standard BFF cost (one extra hop per request), which every other feature already pays.

## Consequences

- Enables: Messenger inherits the existing 401-refresh-retry flow, error toasting, and timeout handling for free.
- Makes harder: nothing identified.

## Revisit Conditions

Only if the backend team indicates Django itself will start accepting browser-originated requests with a different auth model app-wide — at that point this would be an app-wide decision, not a Messenger-specific one.
