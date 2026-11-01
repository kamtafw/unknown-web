# P4-08C — Live Comments and Reactions Realtime

**Status:** Realtime delivery verified by the owner in the dev browser (2026-11-01): live comments and reactions reached other participants. The owner also confirmed canonical comment responses appear once and active reaction counts stay consistent across users. Initial counts after hard reload exposed a missing room-summary read; that read is now implemented, with browser re-verification pending.  
**Branch:** `feat/events-p4-08-live-comments-reactions`

## Behavior

- Realtime handlers use the independent EventsSocketManager. Messenger's socket and its legacy P2P missing-session exception are not used.
- The live room component joins only when the event-specific live-session read says the viewer is an active participant, the session is live, and the backend supplied a valid `/live` + `live:join` descriptor.
- Before a join, the Events transport is connected. Reconnect room restoration continues to use the manager's existing HTTP-backed participation revalidator.
- `live:comment` requires a session identifier matching the active session and invalidates the canonical HTTP comments query. The socket comment body is not parsed or inserted.
- Session identifiers accept the mobile helper's documented candidate fields: `session_id`, `sessionId`, `room_id`, or `roomId`, from the root or one `data` envelope. Positive numeric strings are accepted as mobile does. Missing, malformed and mismatched IDs are ignored.
- `live:reaction` requires the active session ID and a normalisable reaction. It applies the server's `emoji_count` exactly; no local increment is performed.
- Reaction `event_id` values are deduplicated within the active session subscription and bounded to 300 remembered IDs. The recent cache is also bounded to 30 entries. The server ID's global-versus-session uniqueness domain remains unknown, so no cross-session identity assumption is made.
- A socket connect (initial or reconnect) invalidates both the live comments query and the room-summary query, reconciling missed comments and reaction aggregates through HTTP.
- The room summary is fetched from `GET /live/sessions/{sessionId}`; the BFF exposes only `id` and the six `reaction_counts` values. Participant, invite and media fields are stripped.
- The room-summary query is scoped by account, login generation and session, refetches on mount, and is invalidated on socket reconnect.
- Listener cleanup is tied to the component/session/account lifecycle.

## Files

- `app/api/events/live-sessions/[sessionId]/route.ts` (sanitized room-summary GET)
- `lib/events/live-server.ts` (`sanitizeLiveSessionRoomPayload`)
- `lib/events/live-normalize.ts` (`normalizeLiveSessionRoom`)
- `lib/events/live-api.ts` (`getRoom`)
- `lib/events/live-socket-events.ts`
- `lib/events/live-socket-events.test.ts`
- `types/events/live.ts` (`LiveSessionRoomState`)

## Remaining limitations

- The mobile source confirms `GET live/sessions/{sessionId}` returns a `LiveRoom` with `reaction_counts: Record<LiveReactionEmoji, number>`. The web implementation now reads this endpoint through an authenticated BFF route and validates all six non-negative integer counts.
- The owner has verified live comment and reaction delivery in the dev browser. Raw socket frames were not supplied, so undocumented payload details and the reaction event-ID uniqueness domain remain subject to the parser's explicit guards.
- The new initial-count read has not yet been re-tested in the owner's browser after hard reload.
- Comment ordering, rate-limit thresholds and ended-session error semantics remain unverified.
