# Events web listener and host lifecycle

**Scope:** admitted web listeners for mobile-hosted sessions, plus host lifecycle API controls. Browser microphone publishing and Events Socket.IO integration remain out of scope. No backend changes are included.

## Implemented baseline

### Join and listen

- Authenticated `POST /api/events/[eventId]/join` BFF route validates the event id and optional four-digit passcode, forwards the request to Django, and logs only response shape/type metadata in development.
- `eventsApi.joinEvent` extracts a positive `live_session_id` when the response supplies one.
- `useJoinEvent` prevents duplicate in-flight submissions and invalidates this account/session's event detail, live-session read, Nearby, and My Events caches after admission. If join omits a session id, it attempts the event-specific live-session read.
- Event details expose a join control for non-host viewers of live events. Locked events collect the passcode in a password field; the value is sent only in the POST body and is not logged or persisted.
- After admission, the production Events component mounts the listener using the returned live session id.
- The authenticated media-credentials BFF calls the backend-issued `/live/sessions/{id}/media/credentials` endpoint with `X-Platform: web` and `X-App-Version: 0.1.0`. It validates the response, disables caching, and never logs credential values. The backend remains responsible for deciding whether this viewer is admitted.
- The listener lazy-loads `livekit-client`, connects as a listener, subscribes to remote audio tracks, removes detached audio on unsubscribe/disconnect/unmount, and provides playback retry and connection retry actions.
- No media token, passcode, or raw credential response is persisted. Credentials are held in memory only for the LiveKit connection.

### Host lifecycle foundation

- `POST /api/events/[eventId]/live-session` creates or retrieves the attached waiting session. It sends `X-Platform: web` and `X-App-Version: 0.1.0`, matching the current `package.json` version.
- `POST /api/events/[eventId]/live-session/start` proxies the documented start transition with the same platform/version headers. The API route exists, but the UI deliberately does not call it.
- `POST /api/events/[eventId]/live-session/end` ends a waiting or live session without a request body or platform/version headers.
- The lifecycle BFF routes preserve backend authorization and transition errors, use no-store requests, and sanitize successful responses. The end response only exposes event id, `is_live`, session id, and synchronization status.
- Event details show lifecycle controls only for the event host. Create/end actions have an in-flight guard, confirmation before ending, no optimistic status changes, and account/session-scoped invalidation of event details, live-session state, Nearby and My Events.
- A created session stays waiting until started elsewhere. **Starting from the web remains unavailable until a supported web host media path exists.** The backend guide says `X-Platform: web` selects P2P even when LiveKit is enabled, so enabling a Start button now could mark the event live without usable web audio publishing.
- Ended/cancelled attached sessions cannot be restarted by the documented API. The UI does not imply otherwise or attempt to create a replacement session automatically.

## Owner-run validation

Run from a clean checkout of this branch:

```bash
npx tsc --noEmit
npx eslint "app/api/events/[eventId]/join" "app/api/events/[eventId]/live-session" "app/api/events/[eventId]/live-session/start" "app/api/events/[eventId]/live-session/end" "app/api/events/routes-live-session-lifecycle.test.ts" "app/api/events/live-sessions/[sessionId]/media-credentials" "hooks/events/use-join-event.ts" "hooks/events/use-event-live-session-controls.ts" "components/events/event-join-control.tsx" "components/events/event-live-audio-listener.tsx" "components/events/event-live-session-controls.tsx" "components/events/event-details-view.tsx"
npx vitest run app/api/events
git diff --check
```

The GitHub editing environment did not execute these commands. Do not treat this branch as locally validated until they pass. End-to-end listener playback has been confirmed by the owner on the actual Events page against a mobile-hosted session. Lifecycle mutations still need local automated validation and a live-backend smoke test.

## Boundaries and follow-up

- Joining an event and obtaining media credentials are separate steps. The backend remains authoritative for eligibility and passcode validation.
- The listener is receive-only. No microphone permission or publishing is implemented.
- The browser necessarily receives the backend-issued LiveKit token to establish the media connection. Token expiry and authorization are backend responsibilities.
- The listener targets the LiveKit credential response shape. The documented web provider selection is still a backend dependency; do not spoof a mobile platform or assume P2P signalling is enabled.
- The host lifecycle UI is not a substitute for media controls. Browser publishing and the intended web media provider must be resolved before web Start is enabled.
