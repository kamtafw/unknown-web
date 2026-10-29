# Events web join and listener handoff

**Scope:** event admission plus listener-only LiveKit connection, built on the existing Pass 4 listener proof. No microphone publishing, event lifecycle controls, Events Socket.IO integration, or backend changes are included.

## Implemented on `feat/events-web-join`

- Authenticated `POST /api/events/[eventId]/join` BFF route. It validates the event id and optional four-digit passcode, forwards the request to Django, and logs only response shape/type metadata in development.
- `eventsApi.joinEvent` calls the BFF and extracts a positive `live_session_id` when the response supplies one.
- `useJoinEvent` prevents duplicate in-flight submissions and invalidates this account/session's event detail, live-session read, Nearby, and My Events caches after admission. If join omits a session id, it attempts the event-specific live-session read.
- Event details expose a join control for non-host viewers of live events. Locked events collect the passcode in a password field; the value is sent only in the POST body and is not logged or persisted.
- The listener component requests media credentials through the existing BFF, lazy-loads `livekit-client`, connects as a listener, subscribes to remote audio tracks, and removes audio elements/disconnects on unmount.
- The media-credentials BFF remains development-only by design. The event admission control is available in production, but it explicitly does not start the listener there. Enabling production media credentials requires a separate security review of the authenticated media route and its upstream contract.

## Required owner-run checks

Run from a clean checkout of this branch:

```bash
npm test -- --run 'app/api/events/[eventId]/join/route.test.ts'
npm test -- --run app/api/events/routes-live-session.test.ts
npx tsc --noEmit
npx eslint 'app/api/events/[eventId]/join' 'hooks/events/use-join-event.ts' 'components/events/event-join-control.tsx' 'components/events/event-live-audio-listener.tsx' 'components/events/event-details-view.tsx' 'app/api/events/live-sessions/[sessionId]/media-credentials/route.ts'
git diff --check
```

The GitHub API editing environment did not execute these commands. Do not treat this branch as locally validated until they pass. The listener still requires a second participant publishing audio from an authorized mobile-created LiveKit session to verify audible playback end to end.

## Known boundaries

- Joining the event and obtaining media credentials are separate steps. The backend remains authoritative for eligibility and passcode validation.
- No LiveKit token, passcode, or raw credentials response values should be logged or persisted.
- The current listener is receive-only. No microphone permission, publishing, or host controls are implemented.
- The development media-credentials route returns 404 in production intentionally. Do not remove that guard as part of this change without reviewing production auth, headers, response validation, and token exposure.
