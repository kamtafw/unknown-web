# Career Evidence Log

This document records meaningful engineering work completed during this project.

It exists to preserve evidence that may later be useful for:

- CV/resume updates
- Portfolio descriptions
- LinkedIn posts
- Technical interviews
- Performance reviews
- Career planning
- Personal engineering retrospectives

Evidence must remain technically accurate and must never contain invented metrics or responsibilities.

---

## Evidence Index

| ID     | Achievement                                                                   | Category     | Level                                          | Status      |
| ------ | ----------------------------------------------------------------------------- | ------------ | ---------------------------------------------- | ----------- |
| CE-001 | Messenger web: evidence-driven Phase 0 reconnaissance + M0 architecture gates | Architecture | B (A if production socket-auth decision holds) | In progress |
| CE-002 |                                                                               |              |                                                |             |

---

# CE-001 — Messenger Web: Evidence-Driven Phase 0 Reconnaissance & M0 Architecture Gates

**Date:** 2026-08-11

**Category:** Architecture

**Evidence Level:** B, leaning A once the production socket-auth decision is confirmed and holds

**Contribution:** Designed (architecture decisions, scope strategy) / Implemented (M0 scaffolding) / Investigated (mobile + web repo reconnaissance)

### Context

A new Messenger surface is being added to an existing production Next.js web app, ported from a mature React Native implementation. No web-side Messenger code existed yet. Product scope came from a 10-ticket Jira export; the only technical documentation was a guide covering roughly a third of that scope.

### Problem

Two failure modes were live risks before any code was written: (1) accepting Jira's scope at face value without checking whether the backend/mobile app actually supports what it describes, and (2) building realtime features on an unverified assumption about how the browser would authenticate a Socket.IO connection against an app whose HTTP auth model deliberately keeps the access token unreadable to client JS.

### My Contribution

Drove the decision to clone and directly inspect both the mobile and web repositories rather than trust an unreliable file manifest or Jira's stated scope; traced actual hook/socket/screen code to classify all 10 Jira tickets by real implementation maturity; identified that the web app's BFF-proxy auth pattern doesn't have an obvious extension to a browser-originated Socket.IO connection; proposed a tiered scope strategy and a foundation-first milestone plan; scaffolded M0 behind explicit ADRs so two unresolved backend questions didn't block feature development.

### Investigation

Read real code — line counts, endpoint strings, socket event names, payload shapes — directly from hooks/sockets/screens, not inferred from file names. Surfaced gaps neither the guide nor Jira mentioned: AI moderation's approve/decline flow and status like/comment have no backend evidence anywhere in the mobile client; mobile runs three separate Socket.IO connections with inconsistent auth shapes despite documentation recommending one.

### Decision

Extended the existing BFF proxy pattern to Messenger HTTP rather than introduce a second auth mechanism (D-001). Built the socket lifecycle behind a single abstraction so the unresolved single-vs-multi-connection question (D-002) and the unresolved production auth mechanism (D-003) could each be swapped later without rewriting feature code. Accepted a temporary, explicitly-labeled query-param socket auth for development so M0 didn't stall on a backend answer that wasn't available yet.

### Alternatives Considered

For socket auth: inventing a ticket-minting endpoint and presenting it as settled (rejected — would misrepresent unconfirmed backend capability as fact); calling Django directly from the browser to sidestep the cookie problem (rejected — defeats the httpOnly design). For socket topology: mirroring mobile's three connections outright (rejected for now — the evidence suggested unintentional duplication, not a deliberate requirement, and the decision was reversible either way because of the abstraction).

### Trade-offs

Building an abstraction layer before its second real use case existed was a bet that the two open questions (auth mechanism, connection topology) were more likely to change than the interface around them. Accepted that speculative-interface cost because it was small relative to the cost of a scattered rewrite if either assumption turned out wrong.

### Implementation

Scaffolded `types/messenger/`, `lib/messenger/query-keys.ts`, `lib/messenger/socket-auth.ts`, `lib/messenger/socket-manager.ts`, the connection store, BFF proxy routes, three ADRs, and a runnable socket-consolidation smoke test.

### Outcome

M0's two hard architecture gates each had a working, reversible answer rather than a silent assumption baked into feature code. The single-connection hypothesis was subsequently run against the real dev socket server and held for the event families tested. M1 built directly on this foundation without needing to revisit either decision.

### Evidence / Metrics

3 ADRs, a scope matrix covering all 10 Jira tickets against traced mobile evidence, and a smoke test confirmed against the real backend (not just a local mock) — connected successfully with the temporary auth, chat + group events multiplexed on one connection without rejection.

### Engineering Concepts Demonstrated

Evidence-based requirements validation; reversible architecture under uncertainty; explicit ADR discipline; recognizing and refusing to silently invent backend capability under deadline pressure.

### What I Learned

The socket-auth problem didn't have a "correct" answer from the frontend side alone — the honest deliverable at that stage was a well-scoped temporary implementation plus a precise question for the backend team, not a unilateral choice dressed up as one.

### Career Value

**CV:** Yes

**Portfolio:** Yes

**Interview:** Yes

**LinkedIn:** No — too architecture-in-the-weeds for a general audience post.

### Potential CV Bullet

Led evidence-driven technical reconnaissance across two codebases to scope a 10-feature Messenger port, identifying an unresolved browser socket-authentication gap before implementation and designing a reversible architecture that unblocked development without waiting on backend confirmation.

### Potential Interview Story

Good "how do you handle ambiguity under deadline pressure" story: the socket-auth problem had no clean answer available, and the natural pressure was to just pick something and move. Instead, isolated exactly what was and wasn't known, built an abstraction so the unknown parts were cheap to get wrong, and shipped a temporary implementation that was honest about its own limitations rather than presenting a guess as a decision.

### Missing Evidence

No production traffic/user metrics yet — this was pre-implementation architecture work. Would strengthen with a follow-up note once the production socket-auth mechanism is confirmed and the temporary implementation is retired.

---

# CE-002 — Messenger M1: Real-World Debugging of Realtime Sync Bugs Without Live Test Access

**Date:** 2026-08-15

**Category:** Debugging / Reliability

**Evidence Level:** B

**Contribution:** Debugged (all entries below) / Designed (the decision to close M1 with two documented, deferred issues rather than continuing to debug blind)

### Context

M1's buildable core (chat list, direct conversation, optimistic send, delivery/seen, typing) shipped and was tested against the real backend by the project owner, who does have live access to a browser, devtools, and the running app — access I don't have from this environment.

### Problem

Real-world testing surfaced a sequence of realtime-sync bugs: mark-as-read never firing, a message-ordering bug, peer data disappearing on refresh, a socket-listener registration race, then — after fixing those — an unread badge that appeared in one browser but not another, a badge that appeared to need two tab-switches to clear, and blue "seen" ticks that only ever showed up after a reload. Each report had to be diagnosed from code alone, without the ability to reproduce, add breakpoints, or inspect real WebSocket frames directly.

### My Contribution

For each report, worked backward from the described symptom to a specific line of code rather than guessing broadly: traced the mark-as-read gap to a built-but-never-called endpoint; traced the message-ordering bug to a sort comparator that didn't account for synthetic negative optimistic-message IDs; traced the cross-browser badge inconsistency to a literally inverted `if` condition; traced the blue-tick bug to a sender/receiver ambiguity that silently misrouted realtime status updates whenever the current user was the message's original sender; traced the "needs two tab switches" bug to an overly broad reconciliation effect racing with optimistic cache updates; and separately found and fixed a socket-manager race condition where listener registration could silently lose a race against an async credential fetch and never get attached at all.

### Investigation

Read the actual pushed repository fresh each round rather than trusting a local copy, to make sure fixes were being verified against what the project owner was actually running. Where a payload shape genuinely couldn't be confirmed without live access (the exact `chat:receive` JSON structure), added a dev-only diagnostic log rather than guessing at a fix, and was explicit in every write-up about which fixes were confirmed root causes versus hardening against uncertainty.

### Decision

After two rounds of real, confirmed fixes, two symptoms (the cross-browser badge inconsistency and the live blue-tick delay) persisted. Rather than continuing to iterate blind — which has real risk of introducing regressions without the ability to verify them — recommended documenting both clearly as known, non-blocking issues and closing M1, deferring further investigation to a point where live diagnostic access (the browser console/network panel, ideally a captured real socket payload) is available.

### Alternatives Considered

Continuing to propose fixes based on further code-reading alone (rejected — diminishing returns without new information; the two most likely remaining explanations, backend read-after-write timing and an unconfirmed payload shape, both need evidence I can't gather from this environment). Blocking M1 entirely until fully resolved (rejected by the project owner as disproportionate to two non-blocking, already-narrowed issues against a two-week delivery window).

### Trade-offs

Closing M1 with two open items means carrying known technical debt into later milestones. Accepted because both issues are cosmetic/timing-related (message delivery itself works; the affected UI is an indicator, not the underlying functionality), and because the alternative — an open-ended debugging cycle without live access — has a worse cost/benefit than a scoped, documented deferral.

### Implementation

Two rounds of fixes across `lib/messenger/socket-manager.ts` and `hooks/messenger/use-chat-socket.ts`; the two remaining issues and their current best hypotheses are documented in `docs/messenger/MESSENGER.md`'s Open/blocked section rather than left as an undocumented "it's a bit flaky" note.

### Outcome

Three of five reported symptoms confirmed fixed (mark-as-read, message ordering, peer-data-on-refresh, socket-listener race, and the "two tab switches" badge behavior). Two remain open with a documented hypothesis and a concrete diagnostic plan for the next pass.

### Evidence / Metrics

5 distinct root causes identified and fixed across 2 debugging rounds, verified via `tsc`/`eslint`/`next build` against the real repository each time. 2 issues remain open — not measured as "resolved," recorded honestly as deferred.

### Engineering Concepts Demonstrated

Root-cause debugging from symptom reports alone; distinguishing confirmed fixes from hardening-against-uncertainty; recognizing when continuing to iterate without new information stops being productive; making and clearly documenting a deliberate scope/quality trade-off under a real deadline rather than either over-promising or silently shipping known bugs.

### What I Learned

Debugging realtime systems from written symptom reports, without reproduction access, is fundamentally different from debugging with a debugger attached — the discipline that mattered most was being explicit about confidence level per fix (confirmed root cause vs. reasoned hardening) rather than presenting every change with the same certainty. The two issues that survived two rounds of real fixes are also useful data: they're the ones most likely to have a genuinely different root cause (backend timing, or a payload assumption that's still wrong) rather than "just needing one more look."

### Career Value

**CV:** Yes

**Portfolio:** No — too bug-fix-level of detail for a portfolio piece on its own.

**Interview:** Yes

**LinkedIn:** No

### Potential CV Bullet

Diagnosed and resolved five distinct realtime-synchronization bugs in a WebSocket-based messaging feature purely from user-reported symptoms and static code analysis, without live reproduction access, while explicitly scoping and documenting two remaining edge cases rather than leaving them undocumented.

### Potential Interview Story

Strong story about debugging discipline under real constraints: describes tracing an intermittent, browser-dependent bug down to a single inverted `if` condition purely by reasoning through the code's race conditions, and separately shows the judgment to recognize when to stop iterating blind and hand off a well-documented, narrowed problem instead of pretending to have solved something unverifiable.

### Missing Evidence

The two deferred bugs' true root causes are still unconfirmed — this entry will be worth updating once they're actually resolved, to record what the real cause turned out to be versus what was hypothesized here.

---

# Engineering Growth Notes

## Architecture

## Reliability

## Performance

## Debugging

## System Design

## Technical Judgment

## Areas Still Developing
