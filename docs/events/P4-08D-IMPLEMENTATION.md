# P4-08D — Live Comments and Reactions UI

**Status:** Implemented; owner reports focused tests, TypeScript, ESLint and `git diff --check` all pass (2026-10-31). Owner verified live comment creation/delivery and reaction delivery/count consistency across users in the dev browser (2026-11-01). Initial aggregate hydration was found broken after hard reload and has now been implemented; browser re-verification remains pending.  
**Branch:** `feat/events-p4-08-live-comments-reactions`

## UI behavior

- `EventLiveSessionRoom` is mounted for full event details and renders only when an attached live session is confirmed live.
- Viewers who are not active live-session participants see a join prompt; the comments and reaction controls are not enabled for them.
- Active participants see the live comment feed, a load-more action when the backend supplies a next page, a comment composer, and the six mobile-observed reaction choices.
- Comment submission trims whitespace and uses the canonical server response. Blank comments are disabled. No character maximum is invented.
- Initial reaction totals are loaded from the authoritative `GET live/sessions/{sessionId}` room summary (`reaction_counts`); subsequent socket events and successful mutation responses replace the relevant emoji count with the server's `emoji_count`. Requests are not optimistic and 429 receives the mobile-style rate-limit message.
- While the initial aggregate read is pending, the UI displays an ellipsis rather than a misleading zero; if it fails, it displays an unavailable marker and a retry action.
- Socket room membership and listeners are cleaned up when the active session, account, or component changes.
- Existing Pass 3 event discussion comments remain untouched and separate.

## Files

- `components/events/event-live-session-room.tsx`
- `components/events/event-details-view.tsx`
- `hooks/events/use-live-session-reactions.ts`
- `hooks/events/use-live-session-reactions.test.tsx`\n- `components/events/event-live-session-room.test.tsx`

## Design and verification notes

No dedicated Figma frame for this live discussion surface was identified in the reviewed scope; the UI is a restrained implementation consistent with existing Events panel styles.

The owner verified canonical comment submission appears once, comments arrive in realtime, reactions arrive in realtime, and active counts remain consistent across users. The hard-reload check exposed the missing initial aggregate read. The web implementation now fetches and validates `reaction_counts` from the same room-summary endpoint used by mobile; this specific reload scenario still needs a browser re-test.
