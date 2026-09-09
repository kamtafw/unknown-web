# ADR-003 — Temporary Socket Authentication During Development

**Status:** Temporary / Pending backend decision

## Context

The web application intentionally stores the access token in an httpOnly `ac_token` cookie so browser JavaScript cannot access the normal API credential. This works correctly for the existing HTTP BFF architecture (see ADR-001), but direct browser Socket.IO connections require an authentication mechanism that has not yet been finalized.

Two production candidates are currently under discussion with the backend:

1. Cookie-based Socket.IO authentication using the existing httpOnly authentication cookie.
2. A socket-specific, short-lived authentication ticket/credential obtained through an authenticated HTTP flow.

Neither has been confirmed yet.

## Decision

Until the backend contract is finalized, development will temporarily authenticate the Socket.IO connection using the normal access token in the Socket.IO query parameter.

```
Normal HTTP path (unchanged):

Browser
  ↓
httpOnly ac_token cookie
  ↓
Next.js BFF
  ↓
Django

Temporary Socket.IO path (this ADR):

Browser
  ↓
GET /api/messenger/socket-credential  (reads the httpOnly cookie server-side)
  ↓
development-only socket credential returned to client JS
  ↓
Socket.IO query parameter
  ↓
socket.appscombo.com
```

This is a development unblocker only.

## Why

- It allows realtime Messenger development and smoke testing to continue immediately.
- It matches an authentication shape already used by the mobile implementation, and the implementation guide itself names this exact fallback as an acceptable temporary compatibility constraint if the backend only accepts the query parameter.
- It avoids blocking M1 and subsequent Messenger milestones on an unresolved backend architecture decision.
- The temporary mechanism can be replaced behind the socket lifecycle/auth abstraction (ADR-002, `lib/messenger/socket-auth.ts`) once the backend decision is made.

## Security constraint

This must not be treated as production-ready authentication.

Putting the normal access token in a Socket.IO query parameter can expose the credential through infrastructure/server/proxy logging and other request-observability paths. Therefore:

- Do not present this as the final security model.
- Do not document the query-param approach as the recommended production architecture.
- Do not make other Messenger features depend directly on query-param construction.
- Keep socket authentication behind a single abstraction (`socketAuthProvider` in `lib/messenger/socket-auth.ts`) so replacing the credential mechanism later is localized to one file.
- Do not weaken the existing httpOnly-cookie HTTP authentication architecture merely to accommodate the temporary socket implementation — `GET /api/messenger/socket-credential` is the one deliberate, clearly-marked exception, not a precedent for anything else.

## Implementation detail

The rest of Messenger does not know the socket currently authenticates through a query parameter:

```
socketAuthProvider.getConnectAuth()
  → lib/messenger/socket-manager.ts (MessengerSocketManager)
  → socket.io-client
```

Feature hooks call `messengerSocket.on(...)` / `.emit(...)` / `.joinRoom(...)`. None of them construct a connection URL. The eventual migration to a production mechanism is a change to `socket-auth.ts` only.

## Exit condition

This temporary decision is retired once the backend confirms and implements one of the production mechanisms:

- cookie-based Socket.IO authentication, or
- socket-specific short-lived ticket/credential.

At that point, replace the implementation behind `socketAuthProvider` and update this ADR's Status to reflect the final decision.

## M0 implication

With this temporary development decision in place, M0 no longer needs to remain blocked on the final production authentication mechanism:

- socket auth **production decision** = Pending
- socket auth **temporary development implementation** = Implemented (`lib/messenger/socket-auth.ts`, `app/api/messenger/socket-credential/route.ts`)
- the production decision remains an explicit M0 architecture follow-up, tracked in `02-risk-register.md` risk #1
- the socket consolidation smoke test proceeds using this temporary auth mechanism
- this ADR gets updated — not deleted — when the final backend decision arrives
