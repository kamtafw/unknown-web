# P4-07B to P4-07D — Live participant state

**Status:** implemented on `feat/events-p4-07a-participant-data`; owner-run validation pending. This checkpoint continues directly from the owner-validated P4-07A data layer.

## P4-07B — Participant query hook

Added `hooks/events/use-event-live-participants.ts`.

- Uses TanStack Query v5 `useInfiniteQuery` and the existing `eventKeys.liveParticipants` factory.
- The cache scope is account, login-session generation, session id, page size and optional role. Page number remains the `pageParam`.
- The query is enabled only when the caller has a valid live-session state, the session is currently `live`, and an authenticated account is known. A missing, invalid, waiting or ended session does not fetch.
- The API call receives the TanStack abort signal.
- The next page is requested only when the normalized backend page has `hasNext`, which is derived solely from the backend `next` link.
- Flattening preserves server order and keeps the first row for each numeric user `pkid`, preventing duplicate users across pages.
- 401, 403 and 404 are not retried. A malformed successful response continues to fail through the existing API normalizer; it is never presented as an empty roster.

Tests: `hooks/events/use-event-live-participants.test.tsx`.

## P4-07C — Socket presence reconciliation

Extended `lib/events/socket-events.ts` to handle the guide's raw `live:participant:joined` and `live:participant:left` events.

The guide §6.2 documents:
- Joined: `session_id`, `user`, `role`, `participant_count`.
- Left: `session_id`, `user`, `participant_count`.
- User snapshot identity includes numeric `pkid`.

The socket payload does not contain the full HTTP participant row (it does not document the participant row id, all five participant-state booleans, or `joined_at`). Therefore the client deliberately does **not** synthesize or optimistically insert a roster row from a socket event.

Instead:
1. Validate the raw event, positive session id, user pkid, nonnegative server count, and the documented role for a join.
2. Resolve the session only against cached live-session/detail entries for the current account and login-session generation. A matching session cache is required; session id alone is not enough.
3. Deduplicate repeated delivery by event type, session id, user pkid and server participant count.
4. Apply the server-provided `participant_count` to the matching live-session cache only when its direction is plausible relative to the currently cached count (join cannot roll it backwards; leave cannot roll it forwards). Ambiguous/out-of-order events do not overwrite a newer count.
5. Invalidate the matching live-session query and only participant roster queries for that account, login generation and session. Active queries reconcile through the canonical HTTP API.
6. After socket reconnect, participant queries in the current account/login generation are invalidated alongside existing event/live-session roots because missed events are not documented as replayed.

This does not locally increment or decrement the count. The count comes from the backend event or canonical live-session HTTP read. HTTP participant pages remain the canonical roster. D4-7 remains unresolved and untouched; no personal-room subscription event or behavior has been invented.

Tests: `lib/events/live-participant-socket-events.test.ts`, plus the existing `lib/events/socket-events.test.ts` regression suite.

## P4-07D — Participant roster UI

Added `components/events/event-live-participants-section.tsx`, mounted by `EventLiveSessionStatus` only after the canonical session read succeeds and reports `live`. The section uses `hooks/events/use-event-live-room.ts` to join the session room only when the read confirms `is_joined` and supplies the exact validated `/live` + `live:join` descriptor; it uses the existing `createEventRoomRevalidator` for reconnect authorization. Temporary transport status changes do not tear down room intent.

The read-only roster:
- Shows the backend's canonical session participant count, not a page-derived count.
- Displays user name, username, photo fallback and live-session role.
- Separately labels application presence (`is_active`) and media connectivity (`media_connected`).
- Shows microphone publication, moderator mute state and camera publication as distinct state.
- Provides loading, empty, initial-error/retry, refresh-error and backend-driven Load more states.
- Uses the P4-07B hook; socket events trigger HTTP reconciliation rather than injecting incomplete rows.

No moderation actions, guest management, media controls, personal-room behavior or new backend fields were added.

Tests: `components/events/event-live-participants-section.test.tsx`, `hooks/events/use-event-live-room.test.tsx`, and updated `components/events/event-live-session-status.test.tsx` and `components/events/events-socket-provider.test.tsx`.

## Verification and limits

- P4-07A focused tests, TypeScript, ESLint and Events regression suite: **owner-reported passed** on 2026-10-30.
- P4-07B to P4-07D tests, TypeScript, ESLint and Events regression suite: **not executed in this implementation environment**; owner must run the commands in the closeout message.
- Deployed backend participant endpoint and live socket delivery: **not verified** here.
- No claim is made that the socket server delivered participant events during a live session.
- D4-7 personal-room delivery remains a separately documented backend dependency and does not block this session-room participant work.
