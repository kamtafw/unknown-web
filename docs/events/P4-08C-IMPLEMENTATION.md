# P4-08C — Live Comments and Reactions Realtime

**Status:** Implemented; owner reports focused tests, TypeScript, ESLint and `git diff --check` all pass (2026-10-31). Live backend/browser verification remains pending.  
**Branch:** `feat/events-p4-08-live-comments-reactions`

## Behavior

- Realtime handlers use the independent EventsSocketManager. Messenger's socket and its legacy P2P missing-session exception are not used.
- The live room component joins only when the event-specific live-session read says the viewer is an active participant, the session is live, and the backend supplied a valid `/live` + `live:join` descriptor.
- Before a join, the Events transport is connected. Reconnect room restoration continues to use the manager's existing HTTP-backed participation revalidator.
- `live:comment` requires a session identifier matching the active session and invalidates the canonical HTTP comments query. The socket comment body is not parsed or inserted.
- Session identifiers accept the mobile helper's documented candidate fields: `session_id`, `sessionId`, `room_id`, or `roomId`, from the root or one `data` envelope. Positive numeric strings are accepted as mobile does. Missing, malformed and mismatched IDs are ignored.
- `live:reaction` requires the active session ID and a normalisable reaction. It applies the server's `emoji_count` exactly; no local increment is performed.
- Reaction `event_id` values are deduplicated within the active session subscription and bounded to 300 remembered IDs. The recent cache is also bounded to 30 entries. The server ID's global-versus-session uniqueness domain remains unknown, so no cross-session identity assumption is made.
- A socket connect (initial or reconnect) invalidates the live comments query to reconcile missed comment events through HTTP.
- Listener cleanup is tied to the component/session/account lifecycle.

## Files

- `lib/events/live-socket-events.ts`
- `lib/events/live-socket-events.test.ts`
- `types/events/live.ts` (`LiveSessionRoomState`)

## Remaining limitations

- Exact server payload samples have not been verified against the dev backend. The parser follows the mobile client's session-ID and reaction-envelope behavior.
- The mobile client also reads `GET live/sessions/{sessionId}` (`useGetLiveRoom`), whose `LiveRoom` model includes `reaction_counts`. The P4-08A web layer did not yet expose that room-summary read, so this UI currently starts counts at zero and becomes authoritative as server reaction events or successful reaction responses arrive. This is a known integration gap, not evidence that the backend has no aggregate endpoint.
- Comment ordering, reaction event-ID uniqueness, rate-limit thresholds and ended-session error semantics remain unverified.
