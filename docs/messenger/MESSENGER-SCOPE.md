# Messenger — Delivery Scope

*What we're actually delivering, tracked against the 10 Jira Frontend tickets. Full evidence trail (line counts, exact endpoints, code paths) is archived at `docs/messenger/archive/01-scope-matrix.md` — this table is the part you actually need day to day.*

Status values: `Not started` · `In progress` · `Functional` · `Hardened` · `Blocked` · `Deferred`

| Feature | Jira | Tier | Milestone | Status | Dependency | Blocker / gap |
|---|---|---|---|---|---|---|
| Individual Chat | APPC-2/3 | 1 | M1 | Not started | Foundation (done) | — |
| Chat-list long-press actions | APPC-6/7 | 1 | M2 | Not started | M1 | — |
| Message long-press actions | APPC-10/11 | 1 | M2 | Not started | M1 | — |
| Messenger Profile | APPC-14/15 | 1 | M4 | Not started | M1 | Media/docs/links tab filter param unconfirmed |
| Groups (core) | APPC-18a | 1 | M3 | Not started | M1/M2 primitives | — |
| Pause group w/ auto-resume | APPC-26/27 | 1 | M3 | Not started | M3 | — |
| Status/Story updates | APPC-42/43/188 | 1 | M5 | Not started | Foundation | Like/comment: **Blocked**, no backend evidence |
| Scheduled calls/messages | APPC-22/23 | 2 | M7 | Not started | Foundation (msgs) / M8 (calls) | Safari lacks notification action buttons |
| Polls | APPC-30/31 | 2 | M6 | Not started | M3 | — (high-confidence contract, reverse-engineered from `create-poll.tsx`) |
| 1:1 + group calling (WebRTC) | APPC-34/35 | 2 | M8 | Not started | Foundation | Signaling undocumented — M8a is a dedicated reverse-engineering step before any UI |
| Communities | APPC-18b | 3 | M9 | Not started | M3 | Access-level hierarchy: **needs confirmation** before UI design |
| AI moderation | APPC-18c | 3 | M10 | Spam listing buildable now; approve/decline **Blocked** | M3 | Approve/decline + pre-send check: no evidence anywhere in mobile |
| AppsCombo Live | APPC-38/39 | 3 | M11 | Not started | M8 (shares signaling) | Largest undocumented surface; peer-mesh only, no SFU found |

## Not in scope (reuse existing web infra instead)

Block/unblock, report, last-seen privacy — mobile-only tickets in the Jira export with no Frontend counterpart. Web's existing `app/api/users/privacy/*` already covers this; Messenger doesn't need to rebuild it unless told otherwise.

## Architectural constant across all tiers

No SFU found anywhere (calls or Live) — STUN (Google/Cloudflare) + Metered TURN only, confirmed in `lib/webrtc/peer-connection.ts` on mobile. Peer-mesh caps realistic group-call/Live size; this is inherited from the existing product, not something to silently redesign.