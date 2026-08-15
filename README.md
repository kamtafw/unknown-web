# Socket listener race fix — apply to `unknown-web`

Two files: `lib/messenger/socket-manager.ts` (the actual fix) and `docs/messenger/DECISIONS.md` (D-005, documenting it). Confirmed against your currently pushed repo state (`e0d5f91`), not a stale copy — I re-cloned and re-verified before making this fix.

## The bug

`doConnect()` awaits the credential fetch (a real HTTP round-trip) _before_ `this.socket` is assigned. `on()` used to do `this.socket?.on(...)` directly — if any feature hook's effect (`useChatSocket`, `useTyping`) ran during that window, the subscription silently no-op'd and was **never attached, permanently**. Whether a given page load lost this race depended on network timing — which is exactly why typing indicators, realtime delivery, and the unread badge were all intermittent rather than cleanly broken. This wasn't three bugs, it was one.

Fixed: the manager now keeps a persistent listener registry. `on()` registers there first and attaches immediately if a socket already exists; whenever a socket is (re)created, every registered listener gets replayed onto it. Call order no longer matters. `emit()` is deliberately left as-is (fire-and-drop, not queued) — documented inline why that's correct for point-in-time payloads like typing state.

## About "I only see the first WebSocket connection in the Network tab"

Worth ruling this out too, separately from the bug above — it's a common DevTools gotcha, not necessarily something wrong with the app:

Chrome/Firefox DevTools show a WebSocket connection as **one row** in the main Network list (the initial HTTP Upgrade handshake). Individual messages sent/received over that connection do **not** appear as new rows. To see them:

1. Network tab → click the WS row (filter by "WS" if it's hard to find)
2. Open the **Messages** sub-tab (Chrome) or **Response**/**Frames** (Firefox) within that request's detail panel
3. Each frame appears there as the connection stays open, green arrow = sent, red = received (Chrome's convention)

If you were only looking at the main Network list, that would explain "I don't see events being published" even if they always worked — worth checking this view specifically before concluding anything's still broken after the fix above.

## What to check now

Retest typing, realtime delivery, and the unread badge together — they should all improve since they shared this one root cause. If anything's still inconsistent after this, the `console.debug("[messenger] chat:receive payload", ...)` log from the previous bugfix pass is still in place — that's the next diagnostic step, and would point at a genuinely different issue (e.g. an actual payload-shape mismatch) rather than this race.

## Verified before packaging

- Re-cloned your actual pushed repo (not a stale local copy) and applied the fix there.
- `npx tsc --noEmit -p tsconfig.json` — 10 errors, same pre-existing `__tests__/*` baseline, zero new.
- `npx eslint lib/messenger/socket-manager.ts` — 0 errors, 0 warnings.

## Also noticed while catching up (not bugs, just flagging)

- Your merge relocated `stores/messenger-connection.store.ts` to the plural `stores/` directory and moved `MESSENGER.md`/`MESSENGER-SCOPE.md`/`DECISIONS.md` under `docs/messenger/` rather than the repo root. Both are internally consistent (imports match, nothing's dangling) — noting it so future patches from me target the right paths, which this one does.
- D-004 in `DECISIONS.md` still said "component code not yet written" even though M1 shipped — corrected its Status while I was in the file.
