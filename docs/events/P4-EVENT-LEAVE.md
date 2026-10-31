# Event Leave (P4 follow-up)

## Scope

Implements the documented event-level leave operation:

- Browser calls the same-origin BFF route: `POST /api/events/{eventId}/leave`.
- BFF authenticates from the HttpOnly access-token cookie, validates the event UUID, and forwards a bodyless POST to Django `/events/{eventId}/leave`.
- Only the documented HTTP 200 success envelope with `success: true` and empty `data` is treated as success. Malformed 2xx responses become 502; backend errors retain their status and message.
- The client mutation calls the HTTP endpoint first. A failed/ambiguous HTTP result does not optimistically mark the viewer as having left.
- After confirmed success, the Events socket manager leaves the current live room, the LiveKit listener unmounts and disconnects, and account/session-scoped event, live-session, participant and list queries are invalidated.
- The host broadcast is never ended by this action. Socket-room departure is not treated as persistent event leave.

## Membership and UI

The live-session read distinguishes an active live participant from an event guest. For a full event, the guest-list endpoint is also used as the membership signal: the backend permits that read to hosts and users with a guest record, and returns 403 when the viewer has no guest record. Hosts do not receive the guest leave control.

- An active live participant sees the audio listener and **Leave event**.
- A guest with a retained guest record can leave even when the live session is no longer active.
- During a live session, an inactive guest is offered the normal join flow rather than being trapped behind a second leave action.
- Restricted previews do not trigger a guest-list request. A live restricted preview can still join; after joining, the local session id supports the leave action.

## Important backend consequence

The documented leave operation retains the guest record and therefore does not remove the event from My Events. The guest-list endpoint also does not expose an online/offline field to this client. The UI suppresses the leave control for the current mounted view after a confirmed leave. After a reload of an ended event, the retained guest record can make the idempotent leave control appear again. This is consistent with the available API contract, but the post-leave presentation should be confirmed with the PM. Do not infer that the guest record was deleted.

## Validation status

Code and focused tests have been added, but no local test run or live-backend verification is claimed from this branch.

Run from the repository root:

```powershell
npx vitest run "app/api/events/[eventId]/leave/route.test.ts" hooks/events/use-leave-event.test.tsx components/events/event-join-control.test.tsx components/events/event-details-view.test.tsx hooks/events/use-event-guests.test.tsx hooks/events/use-join-event.test.tsx
npx tsc --noEmit
npx eslint "app/api/events/[eventId]/leave/route.ts" "app/api/events/[eventId]/leave/route.test.ts" components/events/event-join-control.tsx components/events/event-join-control.test.tsx components/events/event-details-view.tsx components/events/event-details-view.test.tsx hooks/events/use-leave-event.ts hooks/events/use-leave-event.test.tsx hooks/events/use-event-guests.ts hooks/events/use-join-event.ts
```

Then verify against the dev backend with a non-host guest account:

1. Join a live event and confirm audio starts.
2. Leave and confirm the listener disconnects and the live roster no longer shows the active participant.
3. Confirm the host's broadcast remains live.
4. Confirm the event remains in My Events because the guest row is retained.
5. Refresh an ended event as a guest and confirm the retained guest can repeat leave successfully.
6. Attempt leave as a non-guest and as a host; backend authorization remains authoritative.

## Not included

- P4-07 participant-state product acceptance. It remains parked pending PM clarification.
- Guest removal, host broadcast termination, and LiveKit host controls.
- Any assumption that leaving deletes a guest record or removes the event from My Events.
