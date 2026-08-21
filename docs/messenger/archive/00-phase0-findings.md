# Messenger Web — Phase 0 Findings

Source: `github.com/kamtafw/unknown-web` (web, target) and `github.com/kamtafw/unknown` (mobile, behavioral source of truth), both cloned and inspected directly — not inferred from filenames. Cross-referenced against `messenger-web-implementation-guide.md` and `appscombo-messenger-jira-story.docx`.

> Note: an earlier file manifest shared in this project mixed web-only paths (`app/(dashboard)/...`) with mobile-only paths (`app/(drawer)/messenger/...`, `store/social.store.ts`) and listed files (`lib/crypto/*`) that only exist on mobile, not web. That manifest isn't reliable — everything below is verified against the real repos.

## 1. Web repo: current state

- Next.js 15 (App Router), TanStack Query v5, Zustand, Axios, `socket.io-client` are already in `package.json`. **No messenger code exists yet** — `app/` only has `(auth)`, `(dashboard)`, `(legal)`, `(onboarding)`, `api/`. This is greenfield within an established app.
- `CAREER-EVIDENCE.md` already exists at repo root — I'll keep using that rather than proposing a new evidence log location.

## 2. Web architecture: how Messenger must integrate

The web app already uses a **BFF proxy pattern** for every backend call, and this is not optional to follow — it's how auth already works:

- Access/refresh tokens live in **httpOnly cookies** (`ac_token`, `rf_token` — `lib/cookies.ts`), set server-side after login/OTP verify. Client JS never sees them.
- Every existing feature (`app/api/users/*`, `app/api/socials/*`, `app/api/auth/*`) is a Next.js Route Handler that reads the cookie server-side, attaches `Authorization: Bearer <token>`, and forwards to `DJANGO_API_URL` (`lib/server-config.ts` → `https://dev.appscombo.org/api/v1`, the same backend the mobile guide references).
- `providers/query-provider.tsx` already has sensible status-aware retry/backoff (no retry on 401/4xx, one retry on 5xx, exponential backoff) — matches what the guide recommends; nothing to change here.
- Zustand stores currently exist under **two competing conventions**: `store/*.store.ts` (majority, mobile-style) and `stores/*-store.ts` (a couple of newer web-only stores). Messenger should follow `store/*.store.ts` to match the majority pattern already in the web repo.

**Conclusion:** every Messenger HTTP surface (`chats/*`, `groups/*`, `statuses/*`, `schedules/*`, `calls/*`, `live/*`, `communities/*`) needs a matching `app/api/chats/...` (etc.) Route Handler mirroring the existing `app/api/users/*` proxies. This is Foundation-tier work — nothing else can be built against real data without it.

## 3. Open architecture question — socket auth (backend dependency, not yet resolved)

Mobile authenticates its sockets by reading the token out of `expo-secure-store` and putting it directly in the connection (query string and/or `auth` payload — see §4). Web **cannot do this**: the access token is httpOnly by design, unreadable to client JS.

Options — I have not picked one, this needs a real answer:

| Option | Mechanism | Caveat |
|---|---|---|
| A. Socket ticket endpoint | New `POST /api/socket/ticket` route reads the cookie server-side, returns a short-lived one-time token for the client to use in the socket `auth` handshake | Requires either a backend endpoint to mint this, or the BFF minting something the chat socket server will accept — needs backend confirmation |
| B. Cookie-based socket auth | Socket.IO's HTTP upgrade request carries the httpOnly cookie automatically if `socket.appscombo.com` is same-site/CORS-configured to receive it | Depends entirely on backend socket server support — unconfirmed |
| C. Query-string token (mobile's current pattern) | Temporary compatibility fallback | Guide explicitly warns this exposes tokens in proxy/server logs |

**This is a genuine backend dependency and belongs at the top of Milestone 0.** I'm flagging it rather than picking one, per the project's hard scope boundary — inventing a socket-ticket endpoint that doesn't exist would be exactly the kind of "invented backend capability" this project rules out.

## 4. Finding — mobile runs three separate Socket.IO connections, not one

`lib/socket/chat-socket.ts`, `call-socket.ts`, and `live-socket.ts` each independently call `io()`:

```
chat-socket.ts:  io(`${BASE_URL}?token=...`, { path: "/socket.io", forceNew: true, ... })
call-socket.ts:  io(CALL_SOCKET_URL, { auth: { token }, query: { token }, ... })
live-socket.ts:  io(LIVE_SOCKET_URL, { auth: { token }, path: "/socket.io", ... })
```

All three default to the **same host** (`https://socket.appscombo.com`), yet use three different auth argument shapes (query-string only / query+auth / auth-only). This looks like organic duplication rather than a deliberate multi-server design, and it directly contradicts the guide's own stated principle: *"Create exactly one socket per signed-in browser session."*

**Working assumption for web:** one consolidated socket connection, with chat/call/live treated as different event names on that one connection. **This needs an early smoke test against the dev socket server** before it's load-bearing — if the backend actually expects three distinct connections (e.g. separately scaled infrastructure), that assumption breaks and Foundation needs to change.

## 5. Correction to an earlier assumption

I initially assumed the web repo might already have `lib/crypto/*` scaffolding based on the stale manifest mentioned above. Verified: those files (`crypto.ts`, `key-storage.ts`, `message-crypto.ts`, `setup-encryption.ts`) exist **only on mobile**, and per the guide, E2EE is not currently functional there — the active direct-chat screen has encrypted sending disabled. Web should not build or claim E2EE in this pass.

See `01-scope-matrix.md` for the per-feature investigation and `02-risk-register.md` / `03-milestone-plan.md` for what follows from it.
