# P4-08 — Mobile Contract Review

**Review date:** 2026-10-31  
**Reference repository:** `kamtafw/unknown`, `main`  
**Web implementation branch:** `feat/events-p4-08-live-comments-reactions`

## Purpose and evidence standard

The original backend guide remains the authoritative contract. This review records what the shipped mobile client actually calls, sends, reads, and listens for so the web implementation can use the same observed integration while preserving uncertainties for verification.

Mobile code is implementation evidence, not proof that every field or behavior is formally guaranteed by the backend. Do not silently promote an inference into a backend contract.

Primary mobile files reviewed:

- `hooks/messenger/use-live.ts`
- `hooks/messenger/types.ts`
- `hooks/messenger/use-live-events.ts`
- `hooks/messenger/use-live-reactions.ts`
- `components/events/event-room.tsx`
- `lib/socket/live-socket.ts`

## 1. HTTP comments

### Read

Mobile query:

- Relative endpoint: `GET live/sessions/{roomId}/comments/list`
- Query parameters: `page`, `limit`
- Default page: `1`
- Default limit: `50`
- Infinite pagination uses the response `data.next` field as the continuation signal.

Observed response model:

```ts
interface LiveComment {
  id: number;
  user: MessengerUser;
  content: string;
  created_at: string;
}

interface LiveCommentListData {
  count: number;
  total_pages: number;
  limit: number;
  current: number;
  next: string | null;
  previous: string | null;
  results: LiveComment[];
}
```

The client wraps the page data in the application's standard `ApiResponse<LiveCommentListData>` envelope.

### Create

- Relative endpoint: `POST live/sessions/{roomId}/comments`
- JSON request body: `{ "content": string }`
- Observed response envelope data: `{ "comment": LiveComment }`

After success, mobile inserts the returned comment into its cached infinite list if the same comment ID is not already present. It increments the cached count once and appends the new comment to the last loaded page.

### Comment validation / errors

The mobile Events composer trims whitespace and does not send an empty comment. The reviewed input has no explicit `maxLength` and the mutation does not locally enforce a 1,000-character cap.

The mutation currently displays the API error message generically. There is no special 429 treatment in the comment mutation.

**Do not interpret the lack of a mobile-side length limit as evidence that the backend has no limit.** The 1,000-character limit mentioned in the web task notes must still be confirmed from the backend guide or observed backend response before being treated as authoritative.

## 2. HTTP reactions

- Relative endpoint: `POST live/sessions/{roomId}/reactions`
- JSON request body: `{ "emoji": LiveReactionEmoji }`
- Allowed client enum: `👍`, `❤️`, `😂`, `😮`, `👏`, `🔥`
- Observed response envelope data: `{ "session_id": number, "reaction": LiveReaction }`

Observed reaction model:

```ts
interface LiveReaction {
  event_id: string;
  emoji: LiveReactionEmoji;
  user: MessengerUser;
  emoji_count: number;
  created_at: string;
}
```

On successful HTTP response, mobile applies the returned `emoji_count` to the room's `reaction_counts[emoji]`. It does not locally increment the count.

A 429 response is handled with a specific “reacting too quickly” message. Other errors use the generic API error message.

## 3. Socket events

The mobile live event hook subscribes to:

- `live:comment`
- `live:reaction`

### `live:comment`

The mobile handler checks that the event belongs to the currently viewed session, then invalidates the comments query. It does not parse or consume a comment object from the socket payload.

**Observed minimum:** the handler expects a session identifier that `getLiveSessionId()` can resolve. For the Messenger/P2P provider only, the helper also permits a payload without a session ID; this is a legacy provider-specific exception and must not be copied into Events web.

**Unknown:** exact comment socket payload fields, whether it contains the full comment, whether it contains only an ID/notification, and whether the backend guarantees delivery ordering.

### `live:reaction`

The mobile parser accepts a payload whose root or `data` object contains:

- A session identifier resolvable by `getLiveSessionId()`.
- `reaction.event_id` (string).
- `reaction.emoji` (one of the six allowed emojis).
- `reaction.emoji_count` (number).
- `reaction.user` (object).
- `reaction.created_at` (string).

The parsed event is normalized to:

```ts
{
  session_id: number,
  reaction: {
    event_id: string,
    emoji: LiveReactionEmoji,
    emoji_count: number,
    user: MessengerUser,
    created_at: string
  }
}
```

Mobile ignores malformed events and events for another session. It applies the server-provided `emoji_count` to the room cache. The dedicated reaction animation hook deduplicates animation by `event_id` (bounded in-memory set); cache application and animation deduplication are separate concerns.

## 4. Important mobile behavior and web implications

1. **Comments are HTTP-canonical.** Socket comment events trigger a comments-query refresh; they are not directly inserted from socket payloads.
2. **HTTP/socket comment duplication is avoided by ID.** The HTTP create mutation checks whether the returned comment ID already exists before inserting.
3. **Reactions are server-count authoritative.** Both HTTP and socket paths apply `emoji_count`; the client does not calculate counts by incrementing.
4. **Reaction event identity is `event_id`.** Mobile uses it to deduplicate visual animation. Do not assume it is a numeric comment ID or a general session event ID.
5. **Session scoping matters.** The socket handler rejects events for another session.
6. **Mobile's live socket is Messenger-specific.** Its implementation uses `lib/socket/live-socket.ts` and `useLiveEvents`. Web Events has its own independent socket manager and room lifecycle. Port the event semantics, not the Messenger connection implementation.
7. **No client comment length limit is present in the reviewed mobile composer.** Backend enforcement and the exact cap remain unresolved.
8. **No special comment 429 behavior is present in the reviewed mobile mutation.** Reaction 429 is explicitly handled.

## 5. Contract ledger: observed vs unresolved

| Area | Mobile-observed behavior | Confidence / open question |
|---|---|---|
| Comment list endpoint | `GET live/sessions/{id}/comments/list?page=&limit=` | High: explicit mobile request |
| Comment create endpoint | `POST live/sessions/{id}/comments` | High: explicit mobile request |
| Comment request | `{ content: string }` | High: explicit mobile type |
| Comment response | `data.comment` with `id,user,content,created_at` | High: explicit mobile type and cache use |
| Comment pagination | `next` link controls continuation | High: explicit mobile query |
| Comment socket name | `live:comment` | High: explicit subscription |
| Comment socket payload | Session identifier sufficient to invalidate | Partial: full payload shape unknown |
| Comment max length | No mobile client cap found | Unresolved: confirm backend guide/enforcement; do not invent |
| Comment 429 | Generic mutation error path | High: current mobile implementation; backend status semantics unknown |
| Reaction create endpoint | `POST live/sessions/{id}/reactions` | High: explicit mobile request |
| Reaction request | `{ emoji: one of six values }` | High: explicit mobile type |
| Reaction response | `data.session_id`, `data.reaction` | High: explicit mobile type |
| Reaction aggregate | `reaction.emoji_count` is applied to `reaction_counts[emoji]` | High: explicit mobile behavior |
| Reaction event identity | `reaction.event_id` | High: explicit parser |
| Reaction socket name | `live:reaction` | High: explicit subscription |
| Reaction socket payload | Session ID plus `reaction` object described above | High for fields required by mobile parser; exact envelope variants remain open |
| Reaction throttling | 429 gets a dedicated user message | High: explicit mobile behavior |
| Ended-session errors | Generic API error path in these mutations | Unresolved: exact backend status/code/message not established |

## 6. Questions to preserve for backend verification

These are not blockers to designing the web integration, but must remain explicit in the contract record:

- Does the backend enforce a 1,000-character comment limit? If so, is the limit inclusive and measured in Unicode code points, UTF-16 units, or bytes?
- What is the exact `live:comment` payload? Does it include a full comment, comment ID, and/or `session_id`?
- Is `live:comment` emitted to every authorized session-room member, including the sender?
- Does `live:reaction` use the same root/`data` envelope variants as the mobile parser accepts, and is `session_id` always present?
- What are the exact status/code/body for posting a comment or reaction to an ended session?
- What is the backend's rate-limit policy for comments and reactions? Mobile explicitly handles reaction 429 but does not establish the threshold or retry contract.
- Is the `event_id` unique globally or only within a session? Mobile deduplicates it in a hook scoped to one active session, but the uniqueness domain is not documented by the client.
- Are comments returned oldest-first or newest-first? Mobile appends a newly created comment to the last loaded page, but that alone does not establish server ordering.

## 7. Web implementation guardrails

- Use the web Events BFF and independent Events socket manager; do not import mobile modules or reuse its Messenger socket.
- Keep comments separate from ordinary event comments/resources.
- Keep HTTP as the canonical comment source; socket events should invalidate/refetch unless a fully documented payload contract justifies safe direct insertion.
- Deduplicate HTTP-created comments against socket/refetched results by comment ID.
- Apply reaction aggregates only from server-provided `emoji_count`.
- Validate reaction emoji against the observed six-value enum unless the backend guide defines a different set.
- Validate every socket event against the active session ID.
- Do not claim the 1,000-character cap is confirmed until the backend guide or live backend establishes it. If product scope requires the cap now, implement it as a clearly labelled provisional UI constraint and record that backend enforcement is pending.
- Preserve raw request/response examples from any development-backend verification in this document when available.

## Sources

- Mobile repository: `https://github.com/kamtafw/unknown`
- `hooks/messenger/use-live.ts`
- `hooks/messenger/types.ts`
- `hooks/messenger/use-live-events.ts`
- `hooks/messenger/use-live-reactions.ts`
- `components/events/event-room.tsx`
