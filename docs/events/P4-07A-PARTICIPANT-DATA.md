# P4-07A — Live participant data layer

**Status:** implemented on `feat/events-p4-07a-participant-data`; owner confirmed focused tests, TypeScript, ESLint and the Events regression suite all passed on 2026-10-30. Live-backend verification remains pending.

## Contract source

This implementation follows the Events API guide, not inferred mobile behavior:

- **Guide §5.1:** a live participant has integer `id`, user snapshot `user`, live role `role`, Boolean `is_active`, `is_muted`, `media_connected`, `microphone_published`, `camera_published`, and timestamp `joined_at`.
- **Guide §5.1 user snapshot:** UUID `id`, numeric `pkid`, `username`, `first_name`, `last_name`, and `profile_photo`.
- **Guide §5.3:** `GET /api/v1/live/sessions/{session_id}/participants`; standard pagination; optional role filter limited to `host`, `co_host`, `speaker`, or `listener`; results are oldest joined first. A private session read requires the session host, an active participant, or a nondeclined session invite. Invalid role is 400, missing session is 404, and denied access is 403.

The guide does not document any additional participant fields for this endpoint. The BFF therefore does not pass arbitrary future fields through.

## Web data flow

1. Browser calls `GET /api/events/live-sessions/{sessionId}/participants?page=&limit=&role=`.
2. The BFF validates a positive safe-integer session id, applies the existing page/limit policy (page defaults to 1; limit defaults to the configured Events page size and is capped at 100), and accepts only the four documented role values.
3. The BFF calls Django at `/live/sessions/{sessionId}/participants` with only `page`, `limit`, and the optional validated `role`. It uses the access cookie server-side and `cache: no-store`.
4. Upstream 403 and 404 responses retain their status/body. An unreadable successful response becomes a controlled 502.
5. Before returning a successful response, the BFF allow-lists participant fields and the documented user snapshot. Contact data, permissions, credentials, invite/scheduling metadata, and unknown fields are removed.
6. The client normalizer converts the wire objects to `LiveParticipant` view models. A malformed row makes the page unreadable; it is not silently dropped and presented as an empty roster.

## Client model and pagination rules

- `LiveParticipant` is deliberately distinct from `EventGuest`. Event guest membership, live application participation, and media connection are separate concepts.
- The normalized user exposes numeric `userId` (the documented `pkid`), UUID `userUuid`, display name, username, and safe resolved photo URL.
- Live role and all five participant state fields are retained. The backend's oldest-first order is preserved; the client does not sort the page.
- `hasNext` comes only from a nonempty backend `next` link. It is not inferred from `count`, `total_pages`, or page length. An empty page with a next link remains pageable.
- The page does **not** manufacture a roster count. `participant_count` from the canonical live-session state remains the session-level count; page length and pagination metadata are not substitutes.
- The query-key factory scopes by account, login-session generation, session id, page size, and optional role. Page number stays out of the key because the next task will use it as an infinite-query page parameter.

## Scope boundary

P4-07A delivers the BFF route, response sanitizer, domain types, normalizer, API client method, query-key factory, and focused tests.

It does not add a query hook, socket event merge/deduplication, participant count updates, roster UI, or moderation controls. Those remain later P4-07 tasks. In particular, `live:participant:joined` and `live:participant:left` are not merged here; P4-07C must reconcile them against the canonical HTTP roster and must use the server-provided `participant_count`.

D4-7 remains a separately documented backend dependency for personal lifecycle notifications. It does not block this authenticated, session-authorized HTTP participant read.

## Mobile implementation evidence

The connected GitHub installation available during this task exposed `kamtafw/unknown-web` and `kamtafw/book-flight`; it did not expose an AppsCombo mobile repository. Consequently, the mobile `use-live.ts` implementation could not be inspected in this task. No claim of mobile implementation parity is made. The web contract above is grounded in the supplied backend guide only.

## Verification status

Automated tests cover BFF validation and forwarding, response minimization, malformed-response handling, normalization, pagination, API-client behavior, and account/session-scoped query keys. The owner reports the focused tests, TypeScript, ESLint and Events regression suite all passed on 2026-10-30. No request has been made to the deployed backend, so live contract verification remains pending.
