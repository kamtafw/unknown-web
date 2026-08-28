# Messenger Web — Milestone Plan

Ordered by actual dependency structure derived from the scope matrix, not Jira ticket number. Each milestone gets the full objective/scope/decision/verification treatment (per the project's Milestone Method) when we start it — this is the sequencing and boundary only.

```
M0  Foundation & architecture decisions
     ↓
M1  Core Messenger shell (chat list + direct conversation)
     ↓
M2  Chat-list & message interactions (long-press equivalents)
     ↓
M3  Groups core (messaging, admin, pause)
     ↓
M4  Messenger profile
     ↓
M5  Status / stories
     ↓
M6  Polls                      M7  Scheduling
     ↓                              ↓
M8  Calling (signaling investigation → 1:1 → group)
     ↓
M9  Communities            M10 AI moderation (spam listing now; approve/decline if unblocked)
     ↓
M11 AppsCombo Live (reuses M8's signaling primitives)
     ↓
M12 Cross-cutting hardening pass
```

M6/M7 can run in parallel once M3 lands (both depend on groups/messaging, not on each other). M9/M10 similarly parallelize once M3 lands.

---

**M0 — Foundation & architecture decisions**
Establish the module layout inside existing web conventions (`app/api/chats/*` BFF proxies mirroring `app/api/users/*`; `hooks/messenger/`, `lib/messenger/`, `store/*.store.ts`, `types/messenger/`). Resolve the socket-auth question (risk #1) and the socket-consolidation question (risk #2) with the backend team, and smoke-test the answer. Define core types (UUID/PKID distinction enforced), the query-key registry, and centralized socket lifecycle (connect, reconnect, reauth, room rejoin, cleanup on logout). Produces ADR candidates: BFF-proxied REST for Messenger, socket architecture.
*Blocks everything else. No feature work starts until this closes.*

> **Status after first M0 pass:** module structure, BFF routes (chats list/history/send), core types, query-key registry, and the socket lifecycle abstraction are scaffolded. Socket auth has a temporary, clearly-marked dev implementation (ADR-003) so it no longer blocks M1. Socket consolidation has a written, working smoke-test script but **not yet run against the real backend** — that's the one item still standing between M0 and "closed." See the M0 completion report for the full breakdown.

**M1 — Core Messenger shell**
Messenger route/layout, chat list (read + realtime preview updates, unread badges), direct conversation (history pagination, HTTP-durable send with optimistic outbox, delivery/seen, typing).

**M2 — Chat-list & message interactions**
Long-press equivalents (right-click/hover menu on web): reply, forward, pin/unpin, delete (self/both), react, mark-as-read, archive, favorites, custom lists, block. Built on M1's primitives — this is the first payoff of shared conversation infrastructure.

**M3 — Groups core**
Group list/detail/history/send/replies, group socket events, room join/rejoin on reconnect, permission-aware composer (paused/no-send states), admin management (members, roles, permissions, pause/resume). Reuses M1/M2's message renderer and interaction primitives rather than rebuilding them.

**M4 — Messenger profile**
Profile view: name/phone/username, message/call/share/block/report actions, media/docs/links tabs.

**M5 — Status / stories**
Grouping (recent/viewed/muted), create (text/image/video/music), viewer, reshare, extend duration. Like/comment sub-feature stays **Blocked** until risk #5 is resolved — build everything else now.

**M6 — Polls** *(parallel with M7 once M3 lands)*
Create/vote/results UI inside the group composer and message bubble, using the confirmed payload from the scope matrix.

**M7 — Scheduling** *(parallel with M6 once M3 lands)*
Schedule CRUD for message/reminder/call types. Explicit Safari fallback for "Call Now/Decline" per risk #11.

**M8 — Calling**
Two sub-steps, not one:

- *8a:* Reverse-engineer `use-call-signaling.ts` + `call-socket.ts` into a written signaling contract (events, payloads, state transitions). This is real, scoped, deliverable work on its own — treat it as a milestone checkpoint, not a detour.
- *8b:* Build the browser WebRTC client against that contract — 1:1 calling first, then group add/remove-participant. Peer-mesh only (no SFU found), so group-call size expectations should be set explicitly per risk #7.

**M9 — Communities** *(parallel with M10 once M3 lands)*
Community CRUD, group attach/detach, roles. The access-level hierarchy UI is gated on resolving risk #4 first — don't design it from a guess.

**M10 — AI moderation** *(parallel with M9 once M3 lands)*
Spam-listing tab (real, buildable now). Approve/decline flow stays **Blocked** until risk #3 is resolved.

**M11 — AppsCombo Live**
Reuses M8's signaling/peer-connection primitives rather than a second from-scratch WebRTC implementation. Sessions, co-hosts, mic-requests, participants, comments. Highest-risk milestone in the plan — the one most likely to need an explicit scope conversation partway through if reverse-engineering `use-live.ts`'s 786 lines takes longer than expected.

**M12 — Cross-cutting hardening**
A final sweep against the production-readiness checklist (reconnection reconciliation, multi-tab behavior, responsive layouts, error/empty/loading states, accessibility) — though each milestone above should already be self-hardened before moving on, per the project's "attempt, assess continuously" instruction rather than deferring all quality work to the end.

---

## What I'd suggest as the actual next step

Start M0. The two open questions in the risk register (socket auth, socket consolidation) are the only things that can't be resolved by reading code — everything else in Foundation I can begin immediately. Want me to start scaffolding M0 now, or do you want to get answers on the socket-auth question from the backend side first?
