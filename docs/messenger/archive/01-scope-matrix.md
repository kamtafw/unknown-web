# Messenger Web — Scope Matrix

Single source of truth for delivery scope. Every "Mobile evidence" line below was traced through actual hooks/screens/sockets in the cloned mobile repo — not inferred from filenames. Status values: `Not started` · `Contract understood` · `Foundation ready` · `Implementing` · `Functional` · `Hardened` · `Blocked` · `Deferred`.

---

### Tier 1 — Core Messenger (strongest production treatment)

**APPC-2/3 — Individual Chat**
- Mobile evidence: `hooks/messenger/use-chats.ts` (1,809 lines), `use-chat-socket.ts` (423 lines), `lib/messenger/message-db.ts`, `use-offline-message-sync.ts`. Mature, full CRUD + realtime.
- Web contract: Fully documented in the implementation guide (§4).
- Dependency: Foundation (BFF proxy, socket, core types).
- Risk: Low.
- Status: **Not started.**

**APPC-6/7 — Long-press: chat-list actions**
- Mobile evidence: pin/mute/archive/favorites/custom-lists/block/report all live in `use-chats.ts`; UI in `swipeable-message.tsx`, `more-options-sheet.tsx`.
- Web contract: Guide covers pin/mute/archive/block. Favorites (`chats/favorites`) and custom lists (`chats/custom-lists*`) are real endpoints confirmed in code but **not mentioned in the guide** — medium-high confidence, inferred from code.
- Dependency: M1 (chat list).
- Risk: Low.
- Status: **Not started.**

**APPC-10/11 — Long-press: message actions**
- Mobile evidence: reply/forward/pin/delete/react in `use-chats.ts` + `swipeable-message.tsx`, `message-action-bar.tsx`, `group-message-actions-sheet.tsx`.
- Web contract: Fully documented in the guide.
- Dependency: M1 (conversation shell).
- Risk: Low.
- Status: **Not started.**

**APPC-14/15 — Messenger Profile**
- Mobile evidence: `profile/index.tsx`, `business.tsx`, `block-contact.tsx`, `report.tsx`, `archive.tsx`. Attachments endpoint `chats/users/:pkid/attachments` confirmed in `use-chats.ts`.
- Web contract: Block/report covered by the guide. Media/Docs/Links tabs are inferred from the attachments endpoint — the exact filter parameter for splitting media vs. docs vs. links is **not confirmed**, needs a live response check before building those three sub-tabs.
- Dependency: Chat shell + user identity model.
- Risk: Low-Medium.
- Status: **Not started.**

**APPC-18a — Groups (core messaging + admin)**
- Mobile evidence: `use-groups.ts` (1,116 lines), `use-group-socket.ts` (726 lines), `use-group-rooms.ts`. Very mature.
- Web contract: Fully documented in the guide (§5).
- Dependency: M1 shared conversation primitives (message renderer/composer, reused not rebuilt).
- Risk: Low-Medium (room rejoin-on-reconnect discipline is the main sharp edge).
- Status: **Not started.**

**APPC-42/43/188 — Status/Story Updates**
- Mobile evidence: `use-status.ts` (192 lines), `lib/messenger/status-grouping.ts`, `status-create/*`, `status-viewer/*`.
- Web contract: Fully documented in the guide (§6) — the best-documented feature area outside core chat.
- Gap: Jira (APPC-42) explicitly requires **"like, share, and comment on stories."** There is **zero evidence** of like or comment endpoints anywhere in the mobile status code. Reshare exists (`chats/statuses/:id/reshare`) and covers "share" as re-posting to your own status, but not comments or likes.
- Dependency: Foundation + chat-list avatar rings.
- Risk: Low overall; **like/comment sub-feature is a real gap** (see risk register).
- Status: **Not started**; like/comment marked **Blocked** pending backend/product clarification.

---

### Tier 2 — Existing mobile capability, real integration complexity

**APPC-26/27 — Pause a Group with Auto-Resume**
- Mobile evidence: `chats/groups/:id/pause` endpoint exists and is used; the guide explicitly instructs *"do not show a working composer when the group is paused."*
- Web contract: Documented in the guide.
- Dependency: Groups core (APPC-18a).
- Risk: Low.
- Status: **Not started.**
- Note: the Jira docx lists this ticket's Roles & Responsibilities under "Backend Engineer" even inside the "(Frontend)" ticket — likely an export artifact, worth a quick sanity check with the PM, but the client-facing part (disabled composer, admin pause control, resume countdown) is unambiguously frontend regardless.

**APPC-22/23 — Scheduled Calls & Messages**
- Mobile evidence: `use-schedule.ts` (109 lines, clean CRUD: list/detail/create/update/delete against `chats/schedules*`) + 6 dedicated screens (~2,000 lines total: `create.tsx`, `call-create.tsx`, `call-select.tsx`, `select-recipient.tsx`, `reminder.tsx`, `index.tsx`).
- Web contract: Not in the guide at all, but the CRUD contract itself is clean and high-confidence, reverse-engineered directly from code.
- Gap: "Call Now / Decline" relies on OneSignal native notification action buttons on mobile. The web equivalent (Web Push + Notification API actions) is **not supported in Safari** — needs an explicit fallback (e.g. clicking the notification opens a reminder screen instead of inline action buttons).
- Dependency: Foundation; call scheduling also depends on APPC-34 (Calls) existing.
- Risk: Medium.
- Status: **Not started.**

**APPC-30/31 — Polls**
- Mobile evidence: full payload confirmed directly in `create-poll.tsx`:
  ```json
  {
    "group_id": 18,
    "message_type": "poll",
    "content": "<question>",
    "metadata": {
      "question": "<question>",
      "options": [{ "id": 1, "text": "..." }],
      "allow_multiple_answers": false,
      "is_anonymous": false,
      "duration_minutes": 1440,
      "images": ["https://..."]
    }
  }
  ```
  Voting: `POST chats/messages/polls/vote`. Results: `GET chats/messages/:id/polls/results`. 2–10 options enforced client-side.
- Web contract: High confidence — fully reverse-engineered from real, working code.
- Dependency: Groups messaging (polls appear to be group-only in the current mobile code — worth confirming they aren't also offered in 1:1 chat before assuming scope).
- Risk: Low.
- Status: **Not started.**

**APPC-34/35 — One-on-One and Group Audio/Video Calling**
- Mobile evidence: `hooks/messenger/use-call-signaling.ts` — **3,379 lines, the single largest file in the entire messenger surface** — plus `lib/socket/call-socket.ts`, `lib/webrtc/peer-connection.ts` (STUN: Google/Cloudflare public servers + Metered TURN via env vars — standard, portable config), `lib/messenger/native-call-ui.ts`, `call-foreground-service.ts`, `call-log-db.ts`, `store/call.store.ts`.
- Web contract: **Not documented in the guide at all.** ICE/STUN/TURN config is standard and will port cleanly to browser `RTCPeerConnection`. The signaling state machine, ringing flow, and group add/remove-participant logic all need to be reverse-engineered from code — this alone is real, scoped work before any UI gets built.
- Architecture note: no SFU/media server found — calls are peer-mesh (STUN/TURN only). This caps realistic concurrent participants in a group call; it's an inherited backend/product constraint, not something web engineering can fix.
- Dependency: Foundation. Recommend a dedicated signaling-investigation sub-milestone before UI work starts (see milestone plan).
- Risk: **High** — largest undocumented surface in the whole project, real-time media, no OS-level call UI equivalent on web (must build in-page incoming-call UI).
- Status: **Not started.**

---

### Tier 3 — Highest risk / largest undocumented scope (attempt, track closely)

**APPC-18b — Communities**
- Mobile evidence: `use-communities.ts` (485 lines) — real CRUD: create, update, deactivate, exit, invite, member add/role, owner transfer, attach/detach groups, settings, report.
- Web contract: **Not in the guide at all**, 100% inferred from code. Jira explicitly asks for an **access-level hierarchy** ("Level 1, Level 2") for groups within a community — I have **not found a corresponding field** in the community/group types traced so far. Needs a direct check against a live API response (or the actual `CommunityDetail`/attach-group payload) before any hierarchy UI is designed — do not invent the field structure.
- Dependency: Groups core.
- Risk: Medium-High.
- Status: **Not started.**

**APPC-18c — AI Moderation (spam review, policy-violation prompts)**
- Mobile evidence: a **read-only, admin-gated spam tab** exists (`GET chats/groups/:id/spam`) alongside a `trending` tab (`GET chats/groups/:id/trending`). Searched `use-groups.ts` and every related screen for approve/decline mutations or a pre-send "this may violate policy, continue anyway?" prompt — **none found anywhere in the mobile codebase.**
- Web contract: Partially real (spam listing is buildable now). The rest of what Jira describes (approve/decline spam, pre-send violation check sending to spam) **does not appear to exist on mobile either** — this reads as a genuine backend/product gap, not just something missing from the web guide.
- Dependency: Groups core.
- Risk: **High — likely backend blocker.** Recommend confirming with the backend team / PM before committing engineering time to the approve/decline flow specifically. The spam-tab listing itself is safe to build now.
- Status: Spam listing **Not started**; approve/decline flow **Blocked** pending clarification.

**APPC-38/39 — AppsCombo Live**
- Mobile evidence: `use-live.ts` (786 lines) — sessions (create/start/update/end), co-hosts, mic-requests (list/approve/revoke/me), participants (block/kick/mute/unblock), comments, viewers. Also rides on `react-native-webrtc` — same STUN/TURN setup as calls, **no SFU** here either.
- Web contract: **Not documented in the guide.** Largest, least-documented surface in the project. Many-to-many audio via peer-mesh is materially harder than 1:1 calls and doesn't scale past a handful of active speakers — worth confirming with the backend whether an SFU is planned, since that would change the web architecture significantly.
- Dependency: Calls signaling foundation (APPC-34) — shares peer-connection primitives, should not be built from scratch a second time.
- Risk: **Very High.**
- Status: **Not started.**

---

### Cross-cutting (not a single ticket, referenced by several)

**APPC-204 — Real-time Updates (recommended)** — covered by the socket-consolidation and reconnection-reconciliation work in Foundation; not a standalone milestone.

**Privacy / Block-Unblock / Last-seen (APPC-84/85/90)** — these are Mobile-only tickets in the Jira export (no "(Frontend)" counterpart found), and block/unblock is already partially covered by the existing web dashboard's user-privacy surface (`app/api/users/privacy/*` already exists in web). Treat as **reuse existing web infrastructure**, not new Messenger scope, unless you tell me otherwise.
