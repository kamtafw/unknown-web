# P4-08D — Live Comments and Reactions UI

**Status:** Implemented; owner-side checks pending.  
**Branch:** `feat/events-p4-08-live-comments-reactions`

## UI behavior

- `EventLiveSessionRoom` is mounted for full event details and renders only when an attached live session is confirmed live.
- Viewers who are not active live-session participants see a join prompt; the comments and reaction controls are not enabled for them.
- Active participants see the live comment feed, a load-more action when the backend supplies a next page, a comment composer, and the six mobile-observed reaction choices.
- Comment submission trims whitespace and uses the canonical server response. Blank comments are disabled. No character maximum is invented.
- Reaction totals are displayed from server `emoji_count` values. Requests are not optimistic and 429 receives the mobile-style rate-limit message.
- Socket room membership and listeners are cleaned up when the active session, account, or component changes.
- Existing Pass 3 event discussion comments remain untouched and separate.

## Files

- `components/events/event-live-session-room.tsx`
- `components/events/event-details-view.tsx`
- `hooks/events/use-live-session-reactions.ts`
- `hooks/events/use-live-session-reactions.test.tsx`

## Design and verification notes

No dedicated Figma frame for this live discussion surface was identified in the reviewed scope; the UI is a restrained implementation consistent with existing Events panel styles.

No live backend/browser smoke test is claimed. Reaction totals are not historical totals: the reviewed mobile contract supplied no initial aggregate read for this feature, so the web view can only show counts received during the active client session.
