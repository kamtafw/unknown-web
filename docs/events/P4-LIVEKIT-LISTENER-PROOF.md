# P4 listener-only LiveKit proof (historical)

**Status:** The temporary proof UI has been retired. Its successful mobile-host-to-web-listener test informed the production Events integration. Use `P4-WEB-JOIN-LISTENER.md` for the current implementation and validation instructions.

## Decisions

- The production Events media-credentials route now sends `X-App-Version: 0.1.0` and `X-Platform: web`, matching the current web package version.
- Listener-only proof for an existing mobile-created session.
- Listener-only playback is now integrated into the production Events join flow. No publishing, host controls, backend changes, or mobile changes are included.

## Implementation

- The former `app/dev/livekit-listener/` proof UI has been deleted.
- `components/events/event-live-audio-listener.tsx` now owns the listener experience in the production Events view.
- `app/api/events/live-sessions/[sessionId]/media-credentials/route.ts` is an authenticated BFF bridge for the production listener; it forwards the credential POST, validates required fields, and disables caching.

## Limitations and review points

- GitHub API writes do not run package install, TypeScript, lint, or Vitest. Treat this as a review candidate until checks pass.
- The route expects the documented success envelope and validates `data.server_url`, `data.token`, `data.room`, and `data.identity`, then returns those four fields to the authenticated browser. It logs response shape only, never credential values.
- `livekit-client@2.20.1` is in `package.json`; the lockfile must be regenerated using the repository package manager.
- The credentials token is returned to the authenticated browser for connection and must never be logged or persisted.
- Browser-origin support, a successful LiveKit connection, and audible remote playback are unverified and require an authorized staging session.

## Owner-run checks

```bash
npm install
npm test -- --run app/api/events/live-sessions
npx tsc --noEmit
npx eslint 'app/api/events/live-sessions/[sessionId]/media-credentials/route.ts' app/dev/livekit-listener
git diff --check
```

Run the production Events join flow using an authorized mobile-created staging session. Verify admission, connection, room/identity, remote audio reception, audible playback, autoplay retry, reconnection, and cleanup after navigation.
