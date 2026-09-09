# ADR-002 — Socket Lifecycle Abstraction & Connection Topology

## Context

Mobile creates three independent Socket.IO connections (`lib/socket/chat-socket.ts`, `call-socket.ts`, `live-socket.ts`), all against the same default host, with three different auth argument shapes. The implementation guide explicitly recommends *"exactly one socket per signed-in browser session."* Neither is confirmed as the backend's actual requirement — both are inferences from client code.

## Problem

Web needs a socket connection strategy now (M0), but the evidence for "one connection is fine" is circumstantial (same host, guide's stated preference) rather than confirmed (no backend source access, no successful live test yet — see the smoke-test status in `02-risk-register.md`).

## Constraints

- Whatever is decided needs to be changeable later without rewriting M1–M11 feature code, since the evidence to fully resolve it won't exist until M8 (calls) and M11 (Live) are reached.
- Two-week window — can't spend it re-litigating this repeatedly.

## Options Considered

### Option A — Build a single-connection manager now, swap later if wrong
Pros: Matches the guide's explicit recommendation; avoids the auth-shape inconsistency mobile has; testable early with a cheap smoke test.
Cons: If wrong, some rework needed when call/live are reached.

### Option B — Mirror mobile exactly: three separate connections from the start
Pros: Guaranteed to match whatever mobile does today, zero risk of an unverified assumption breaking later.
Cons: Actively repeats a pattern the guide itself flags as probably unintentional; harder to reason about (three lifecycles, three auth shapes, three reconnect loops) for no confirmed benefit.

### Option C — Defer the decision entirely until M8
Pros: No premature commitment.
Cons: M1–M3 (chat, interactions, groups) need a working socket connection now — this isn't actually deferrable, Foundation has to pick something.

## Decision

Option A, behind an abstraction (`lib/messenger/socket-manager.ts`) that exposes `connect() / on() / emit() / joinRoom() / disconnect()` — no feature code touches `io()` directly. The manager owns exactly one `Socket` instance today. If M8/M11 discover the backend genuinely needs separate connections, only the internals of `socket-manager.ts` change (e.g. spinning up a second managed `Socket` and routing by event-name prefix) — the public interface every feature hook depends on does not.

## Why

The abstraction is what makes this a low-risk bet: being wrong costs a localized rewrite, not a scattered one.

## Trade-offs

Accepting a small amount of speculative design (an interface that could theoretically support multiple connections but doesn't yet) in exchange for insulating M1–M7 from a decision that can't be fully verified until M8/M11.

## Consequences

- Enables: M1–M7 can be built now without waiting on calls/Live to exist.
- Makes harder: nothing yet identified; revisit if the abstraction proves to leak topology-specific assumptions once call/live event names are known.

## Revisit Conditions

- The smoke test (`scripts/messenger-socket-smoke-test.mjs`) run against the real dev backend contradicts the hypothesis, OR
- M8/M11 reconnaissance into call/live signaling turns up evidence the backend expects separate connections (e.g. different scaling, different auth requirements per socket).

## Status as of M0

**Partially confirmed 2026-08-11.** A smoke-test run against the real `socket.appscombo.com` (not a mock) showed the temporary auth mechanism (ADR-003) accepted on a single connection, which stayed open through a `chat:typing` emit. This confirms the connection itself is viable — it does not yet confirm multiplexing, since the group-event round-trip (`group:join` → `group:error`) wasn't exercised (no test group id available at the time) and call/live were untested (their event names aren't documented until M8/M11). Treat "one connection can authenticate and stay open" as settled; treat "one connection correctly carries multiple event families" as still open pending the group round-trip result. See `02-risk-register.md` risk #2.
