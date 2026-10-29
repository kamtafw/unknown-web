# Events web join and listener handoff

**Scope:** event admission plus listener-only LiveKit connection for a mobile-hosted live event. No microphone publishing, event lifecycle controls, Events Socket.IO integration, or backend changes are included.

## Implemented on `feat/events-web-join`

- Authenticated `POST /api/events/[eventId]/join` BFF route. It validates the event id and optional four-digit passcode, forwards the request to Django, and logs only response shape/type metadata in development.
- `eventsApi.joinEvent` calls the BFF and extracts a positive `live_session_id` when the response supplies one.
- `useJoinEvent` prevents duplicate in-flight submissions and invalidates this account/session's event detail, live-session read, Nearby, and My Events caches after admission. If join omits a session id, it attempts the event-specific live-session read.
- Event details expose a join control for non-host viewers of live events. Locked events collect the passcode in a password field; the value is sent only in the POST body and is not logged or persisted.
- After admission, the production Events component mounts the listener using the returned live session id.
- The authenticated media-credentials BFF calls the backend-issued `/live/sessions/{id}/media/credentials` endpoint with `X-Platform: web` and `X-App-Version: 0.1.0`. It validates the response, disables caching, and never logs credential values. The backend remains responsible for deciding whether this viewer is admitted.
- The listener lazy-loads `livekit-client`, connects as a listener, subscribes to remote audio tracks, removes detached audio on unsubscribe/disconnect/unmount, and provides playback retry and connection retry actions.
- No media token, passcode, or raw credential response is persisted. Credentials are held in memory only for the LiveKit connection.

## Owner-run validation

Run from a clean checkout of this branch:

```bash
npx tsc --noEmit
npx eslint "app/api/events/[eventId]/join" "app/api/events/live-sessions/[sessionId]/media-credentials" "hooks/events/use-join-event.ts" "components/events/event-join-control.tsx" "components/events/event-live-audio-listener.tsx" "components/events/event-details-view.tsx"
npx vitest run app/api/events
git diff --check
```

The GitHub editing environment did not execute these commands. Do not treat the branch as locally validated until they pass. End-to-end playback should still be confirmed against a mobile-hosted session using the production-equivalent backend configuration.

## Boundaries and follow-up

- Joining the event and obtaining media credentials are separate steps. The backend remains authoritative for eligibility and passcode validation.
- The current listener is receive-only. No microphone permission, publishing, or host controls are implemented.
- The BFF returns only the fields needed to connect; the browser necessarily receives the backend-issued LiveKit token to establish the media connection. Token expiry and authorization are backend responsibilities.
- The listener currently targets the LiveKit credential response shape. If the backend chooses P2P for `X-Platform: web`, that platform selection needs to be aligned with the intended web media provider before broad rollout.
- Keep the current scope focused on a reliable listener experience before adding publishing or host controls.
