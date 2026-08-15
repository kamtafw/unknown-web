# M1 bugfix pass — apply to `unknown-web`

Delta only — 6 files, all modifications to the M1 core zip you already applied. Copy over the matching paths.

## Your four bugs

### 1. Conversations don't get marked read; badge persists after refresh — **fixed client-side**

Root cause: I had built `chatApi.markSeen(uuid)` (the confirmed `POST chats/history/:uuid/seen` endpoint) back in M1 but never actually called it anywhere. The only "seen" logic that existed was for _new_ messages arriving while a conversation was already open — nothing ever told the server "the messages already sitting in this conversation just got read."

Fix (`conversation-view.tsx`): on mount/uuid-change, if the tab is visible, call `markSeen` and optimistically zero that row's badge plus reduce the TopBar total by whatever it was — not waiting for a refetch to reflect it. Also fires again if the tab was hidden and becomes visible again while the conversation stays open (piggybacking on the reconnect/visibility reconciliation `useChatSocket` already had).

### 2. No unread badge ever, on either side — **hardened client-side, but flagging a real unknown**

I can't fully diagnose this one with certainty — I don't have a way to inspect a real `chat:receive` payload from here, and the guide only describes the event as a table entry, not an exact JSON schema. What I changed:

- The old handler silently no-op'd if the chat wasn't found in whatever list-filter tab happened to be cached, or if `message.sender.id` didn't exist for any reason — no fallback, so the badge (and the TopBar total) could go permanently stale with nothing ever correcting it, including after a refresh.
- Now: any `chat:receive` that can't be optimistically patched into the cache triggers a real `invalidateQueries` instead — a refetch that pulls server-truth `unread_count`, so the badge self-corrects even if the optimistic path has an edge case I haven't found. The TopBar total specifically is now _always_ invalidated on an unread-producing event rather than tracked as a local counter.
- Added a dev-only `console.debug("[messenger] chat:receive payload", ...)` — **when you test this again locally, open devtools and check what actually comes through.** If `sender.id` isn't where I assumed, you'll see it immediately, and there's now a `console.warn` + graceful fallback (list refetch) instead of a silent failure if that field is missing.

If the badge still doesn't appear after this, the console.debug output is the next diagnostic step — paste it back to me and I can fix the actual shape mismatch instead of guessing at it.

### 3. New message appears at the top instead of the bottom until sent — **fixed, root cause confirmed**

Found this one precisely. Optimistic messages get a synthetic **negative** ID (`lib/messenger/optimistic.ts`, so they can't collide with real server IDs). `use-chat-history.ts` was deduplicating and ordering the message list with a plain `sort((a, b) => a.id - b.id)` — ascending numeric sort puts negative numbers _first_, so a message you just sent (`id: -1`) sorted before every real message (`id: 500`, `700`, etc.) and rendered at the top instead of the bottom.

Fix: replaced the comparator so real messages still sort by ID (per the guide's dedupe-by-ID rule), but optimistic messages always sort _after_ every real message, ordered chronologically among themselves. Confirmed messages remain correctly ordered; failed ones stay in place until retried or removed, matching what you described.

### 4. Peer name/avatar disappears on refresh until you revisit — **fixed for the common case, real gap documented for the rest**

This was the exact known gap flagged since M1's first pass: no confirmed UUID-keyed profile endpoint exists (`chats/users/:pkid/profile` is PKID-keyed), so the header relied entirely on cache that a page refresh wipes.

Fix: every message already carries a full sender/receiver record. `derivePeerFromMessages` (`lib/messenger/user-display.ts`) now rebuilds the header's display data straight from whatever history is already being fetched — which fully covers "I refresh a conversation I'd already opened," since by definition it has messages. Once derived, it's also written back into the peer cache so it's instant on the next visit this session, not a one-off recovery. I also cleaned up a type-honesty issue this introduced: the header's prop type is now a minimal `PeerDisplay` (just the fields it renders) rather than being typed as the full `ChatListItem` and quietly padded with fake data.

**Real remaining gap, not fixable client-side:** a brand-new, message-less conversation (started via "Start New Chat," never sent a message, then the page gets refreshed before any message exists) has nothing to derive from. See the backend recommendation below.

## What needs a backend decision (can't be fixed from the client)

1. **A UUID-keyed user-profile lookup.** This is the actual fix for bug 4's last remaining edge case. Either a new `GET chats/users/:uuid/profile`-equivalent, or confirmation that the existing PKID-keyed one also accepts a UUID. Low-severity edge case (empty conversation + refresh before either side sends anything) but worth a real answer rather than a permanent client-side workaround.
2. **Confirm the exact `chat:receive` payload shape.** This is the one I can't resolve without either backend documentation or a captured real payload. Specifically: is the sender always nested as `sender: { id, pkid, username, ... }` matching the REST `Message` shape, or is it flatter (e.g. `senderId` as a top-level string)? This directly explains or rules out bug 2.
3. **Confirm delivery/seen ack semantics under load.** My delivered/seen PATCH calls fire once per message with no batching or debounce. For a burst of messages (e.g. someone scrolling through a backlog while several arrive), that's one PATCH per message — fine at low volume, worth knowing if there's a rate limit before this is under real traffic.

## Other things worth checking that you may not have hit yet

- **Multiple browser tabs on the same conversation.** Two tabs open to the same chat will each independently mark-seen and each maintain their own optimistic outbox — no cross-tab coordination exists yet. Known limitation from the original risk register (risk #8), not something this pass addresses.
- **The pagination-direction assumption** (`use-chat-history.ts`'s doc comment) is still unverified against the real backend — separate from all four bugs above, but worth the same kind of real-world check now that basic messaging is confirmed working.
- **Retry after a failed send** re-marks the message `"sending"` and re-POSTs, but doesn't currently limit retry attempts or back off — a message that keeps failing (e.g. you're offline) can be retried rapidly by repeated clicks. Not a correctness bug, just unpolished; worth a debounce/disable-while-in-flight if you hit it.
- **`markSeen` on mount fires on every uuid change**, including revisiting a conversation with nothing new to mark — harmless (idempotent on the backend, presumably) but is an extra network call each time; flagging in case it matters for request volume once this is under real usage.

## Verified before packaging

- `npx tsc --noEmit -p tsconfig.json` — 10 errors, same pre-existing `__tests__/*` baseline, zero new.
- `npx eslint` across all six changed files — 0 errors, 1 accepted warning (documented inline — a legitimately long-lived mutable timer map, not a real bug).
- `npx next build` — clean compile.
