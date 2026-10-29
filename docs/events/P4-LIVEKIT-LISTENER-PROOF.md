# P4 listener-only LiveKit proof

**Status:** Implementation candidate committed for owner-run verification; no local build or live media test has been run from this environment.

## Decisions

- Use `X-App-Version: 1.0.0` and `X-Platform: web`, as required by the backend contract used for this web flow. The package currently declares `0.1.0`; this header intentionally follows the agreed API contract rather than the package version.
- Listener-only proof for an existing mobile-created session.
- No lifecycle controls, publishing, production Events integration, backend changes, or mobile changes.

## Implementation

- `app/dev/livekit-listener/page.tsx`: development harness surface, guarded in production.
- `app/dev/livekit-listener/livekit-listener-harness.tsx`: lazy-loads `livekit-client`, requests credentials through the BFF, connects, checks room/identity, and reports audio-track subscription/playback.
- `app/api/events/live-sessions/[sessionId]/media-credentials/route.ts`: authenticated development-only BFF bridge; forwards the documented credential POST with platform/version headers, validates required credential fields, and disables caching.

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

Then run the app and open `/dev/livekit-listener`. Use an authorized mobile-created staging session and verify connection, room/identity, remote audio track reception, audible playback, and disconnect cleanup. Report exact outputs before proceeding.
