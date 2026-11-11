# Messenger Web Implementation Guide

This guide explains how AppsCombo currently implements the three core messenger experiences: one-to-one chats, group chats, and status stories. 

## 1. The system at a glance

Messenger is split across four layers:

1. **HTTP API** loads lists and history, performs durable writes, and reconciles anything missed while the client was disconnected.
2. **Socket.IO** delivers live messages, typing state, delivery/read state, deletions, and group reactions.
3. **Client cache** keeps API data responsive and updates list previews immediately when socket events arrive.
4. **Local storage and an outbox** make message history fast to reopen and allow sends to survive temporary network failures.

On mobile, TanStack Query owns server state, SQLite stores messages and the send queue, and Zustand holds small pieces of local UI state. A web client can keep TanStack Query, use IndexedDB for durable messages and the outbox, and use a small client store for typing state, active conversations, locally muted stories, and upload progress.

A sensible web module layout would be:

```text
src/features/messenger/
├── api/                 # REST functions and response types
├── realtime/            # One Socket.IO client and event handlers
├── storage/             # IndexedDB message cache and outbox
├── chats/               # Chat list and direct conversation UI
├── groups/              # Group list, conversation, replies, and settings
├── stories/             # Story list, composer, viewer, and upload queue
└── shared/              # Message renderer, composer, media, reactions
```

## 2. Shared backend conventions

The API base URL is configured with `EXPO_PUBLIC_API_BASE_URL` on mobile. The current development fallback is:

```text
https://dev.appscombo.org/api/v1/
```

Do not give a production web build a silent development fallback. Require an environment-specific API URL at build or deploy time.

Authenticated API requests use:

```http
Authorization: Bearer <access-token>
Accept: application/json
Content-Type: application/json
```

Most endpoints return this envelope:

```ts
interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}
```

Pagination is not completely uniform. Chat and group histories use opaque cursors, while some secondary endpoints use page numbers. Treat a returned `next` value as opaque. It may be a cursor or a full URL containing a `cursor` query parameter.

### ID rules

Users have two identifiers, and confusing them is one of the easiest ways to break the web client.

| Entity     | Shape               | Used for                                                                          |
| ---------- | ------------------- | --------------------------------------------------------------------------------- |
| User UUID  | `user.id: string`   | Direct-chat route, `chats/history/:id`, socket sender/receiver identity           |
| User PKID  | `user.pkid: number` | `receiver_id` when sending, user status lookup, group membership, profile actions |
| Message ID | `number`            | Edit, delete, pin, reaction, delivery/read state                                  |
| Group ID   | `number`            | Group routes, room membership, history, sends                                     |
| Status ID  | `number`            | View, edit, delete, reshare, viewers                                              |

Keep both user identifiers in the web session and contact models. Do not convert a UUID to a number or use a PKID in a history URL.

### Core message model

Chats and groups share the same message endpoint and nearly the same message shape:

```ts
type MessageType =
  | "text"
  | "media"
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "document"
  | "location"
  | "contact"
  | "sticker"
  | "poll"
  | "call"
  | "share";

type MessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "seen"
  | "failed";

interface MediaAttachment {
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "document";
  fileName?: string;
  caption?: string;
}

interface SendMessagePayload {
  receiver_id?: number; // direct chat: the other user's PKID
  group_id?: number; // group chat: the numeric group ID
  message_type: MessageType;
  content?: string;
  media?: MediaAttachment[];
  reply_to?: number;
  excluded_users?: number[];
  metadata?: Record<string, unknown>;
}
```

Every server message also includes its numeric `id`, sender, timestamps, status, `collection_id`, optional `reply_to`, media, metadata, and reaction/reply counters. Deduplicate messages by the server message ID, not by timestamp.

## 3. Connection and reconciliation

The chat socket URL comes from `EXPO_PUBLIC_CHAT_SOCKET_URL`, with a current fallback of `https://socket.appscombo.com`. It uses the standard Socket.IO path `/socket.io` and forces the WebSocket transport.

The mobile app currently connects by placing the access token in the URL query string:

```text
https://socket.appscombo.com?token=<encoded-token>
```

That is the compatibility behavior today, but it can expose tokens in proxy and server logs. For the web version, prefer Socket.IO's `auth` handshake or an HTTP-only session cookie if the backend supports it. If the backend only accepts the query parameter, treat that as a temporary compatibility constraint and never log the full connection URL.

Create exactly one socket per signed-in browser session. It should:

- reconnect indefinitely with a small backoff;
- re-authenticate after an access-token refresh;
- rejoin every group room after each reconnect;
- invalidate the active conversation and list queries after reconnect;
- remove old listeners before attaching new ones;
- disconnect on logout.

Socket delivery is not a replacement for HTTP synchronization. Browsers sleep background tabs, laptops go offline, and sockets do not replay everything the client missed. Refetch the chat list, group list, and any open history when the tab becomes visible again or the socket reconnects.

For multiple tabs, elect one tab to own the socket or broadcast events between tabs with `BroadcastChannel`. Otherwise each browser tab will create a connection and may show duplicate sounds, notifications, or optimistic updates.

## 4. One-to-one chats

### Chat list

Load the list with:

```http
GET chats/lists?status=all|unread|pinned&search=<text>&cursor=<cursor>
```

The response contains `data.users` and `data.metadata.next`. Each row includes the user's UUID and PKID, name and avatar fields, unread count, last-message preview and time, plus pinned, blocked, muted, and reverse-block state.

The web list should:

- sort or move a row to the top when a newer message arrives;
- update its preview, message type, timestamp, and unread badge immediately;
- avoid incrementing unread count when that conversation is open and visible;
- preserve filters such as All, Unread, Pinned/Favorites, and custom lists if those surfaces are included;
- prefetch history when the user hovers, focuses, or presses a row.

The total unread fallback endpoint is:

```http
GET chats/lists/unread-count
```

### Opening a conversation

Use the other user's UUID for history:

```http
GET chats/history/:userUuid?cursor=<cursor>
```

Follow `data.next` to load more pages. Normalize all pages into one ordered collection, deduplicate by message ID, and render oldest-to-newest even if a page arrives in a different order. Preserve the user's scroll anchor while older messages are inserted above the viewport.

The mobile app merges server history into a durable local database before rendering. On web, there are two reasonable levels of parity:

- **Basic:** render from TanStack Query and keep only an in-memory optimistic outbox.
- **Offline-friendly:** store normalized messages and pending operations in IndexedDB, then merge API and socket records into that store.

The second option is closer to mobile and is worth it if offline sending is a product requirement.

### Sending a message

The active mobile conversation screens use HTTP as the durable send path:

```http
POST chats/messages
```

For a direct message, send `receiver_id` as the recipient's numeric PKID. A text message is:

```json
{
  "receiver_id": 42,
  "message_type": "text",
  "content": "Hello"
}
```

The mobile repository also contains a `chat:send` socket helper. It is not the primary send path used by the active chat screen. The web client should use the HTTP endpoint unless the backend team explicitly establishes socket sending as the canonical contract.

For a responsive, retryable send flow:

1. Create a local message with a client-generated ID and status `queued`.
2. Put the operation in an outbox.
3. Upload attachments, if any.
4. POST the completed payload to `chats/messages`.
5. Replace the local ID with the server message and mark it `sent`.
6. On a network failure, keep it as `failed` and offer Retry.

Do not assume a socket echo is the send acknowledgement. Use the HTTP response as the authoritative replacement for the optimistic message and deduplicate any later socket event by server ID.

Chat attachments are uploaded first as multipart form data:

```http
POST upload/media
Content-Type: multipart/form-data

file=<binary>
folder=chat|voice|polls
```

The response provides `data.media_url`. Put that URL into the message's `media` array. Browser code should append a real `File` or `Blob` to `FormData`; React Native's `{ uri, name, type }` object is not valid browser multipart data.

### Direct-chat socket events

| Direction       | Event          | Purpose                                       |
| --------------- | -------------- | --------------------------------------------- | ---------------------------------------- |
| Client → server | `chat:typing`  | `{ receiverId: userUuid, isTyping: boolean }` |
| Client → server | `chat:delete`  | `{ msgId: string, deleteType: "self"          | "both", userId: String(recipientPkid) }` |
| Server → client | `chat:sent`    | Send acknowledgement/status update            |
| Server → client | `chat:receive` | Full incoming message                         |
| Server → client | `chat:status`  | `{ msgId, status, senderId, receiverId }`     |
| Server → client | `chat:typing`  | Typing state for a UUID                       |
| Server → client | `chat:delete`  | Remove or tombstone a message                 |

Typing is throttled on mobile to roughly one `true` event every five seconds. Send `false` when the input becomes empty, loses focus, the conversation closes, or the tab becomes hidden. Also expire remote typing state locally in case a stop event is missed.

When `chat:receive` arrives:

1. Validate and normalize the payload.
2. Upsert it by message ID.
3. If the chat is not open, increment unread state and move its list row to the top.
4. Acknowledge it as delivered.
5. Mark it seen only when the conversation is visible to the user.

Delivery and read calls are:

```http
PATCH chats/messages/:messageId/status
{ "status": "delivered" | "seen" }

POST chats/history/:userUuid/seen
{}
```

The active direct-chat screen marks received messages `seen` while the thread is focused. The conversation-level endpoint is also used for the explicit “Mark as read” list action. Keep those meanings separate on web: merely having a socket connection is never enough to mark a message seen.

### Common message actions

The main shared actions are:

| Action              | Request                                                               |
| ------------------- | --------------------------------------------------------------------- | ----- |
| Edit text           | `PATCH chats/messages/:id/edit` with `{ content }`                    |
| Edit media captions | `PATCH chats/messages` with `{ message_id, media }`                   |
| Delete              | `POST chats/messages/:id?delete_type=self                             | both` |
| React               | `POST chats/messages/reactions` with `{ message_id, emoji }`          |
| Pin                 | `POST chats/messages/pin` with `{ message_id, chat_type, target_id }` |
| Unpin               | `POST chats/messages/unpin` with the same target fields               |
| Forward             | `POST chats/messages/forward` with a message ID and target list       |

Apply reactions and simple list actions optimistically, keep a snapshot, and restore it if the request fails.

## 5. Group chats

Groups reuse the message model and send endpoint, but add membership, permissions, room subscriptions, replies, and group-specific socket events.

### Group list and detail

The core reads are:

```http
GET chats/groups/lists?cursor=<cursor>
GET chats/groups/:groupId
GET chats/groups/:groupId/members
GET chats/groups/:groupId/history?cursor=<cursor>
```

Group rows include name, icon, unread count, last-message preview and time, paused state, and muted state. The current mobile client sorts them newest-first on the client because the backend does not always return the expected order.

A group detail includes member counts, creator, preview members, moderation settings, pause state, and these permission flags:

```ts
can_members_edit_info: boolean;
can_members_add_users: boolean;
can_members_send_messages: boolean;
admin_have_to_approve_new_members: boolean;
```

Do not show a working composer when the group is paused or the current member lacks permission to send.

### Joining realtime rooms

Group broadcasts use Socket.IO rooms. After the group list loads, emit this once for every membership:

```ts
socket.emit("group:join", { groupId });
```

Repeat all joins after every reconnect because room membership belongs to the old socket connection and is lost when it disconnects. Also join the currently open group directly, even if it was not present in the pages of the group list loaded so far.

### Sending and replies

Group messages use the same durable endpoint:

```http
POST chats/messages
```

Send `group_id` instead of `receiver_id`:

```json
{
  "group_id": 18,
  "message_type": "text",
  "content": "Morning everyone"
}
```

For a reply, add `reply_to` with the numeric parent message ID. Group messages may also include mention metadata:

```json
{
  "mentions": [{ "user_id": 42, "offset": 8, "length": 7 }],
  "mention_all": false
}
```

Replies have their own cursor endpoint:

```http
GET chats/groups/:groupId/messages/:messageId/replies?order=asc&cursor=<cursor>
```

The socket sometimes returns `reply_to` as a nested preview object rather than a number. Normalize both forms to the parent's numeric ID before updating caches.

### Group socket events

| Direction       | Event                   | Purpose                                      |
| --------------- | ----------------------- | -------------------------------------------- |
| Client → server | `group:join`            | Subscribe the socket to a group room         |
| Client → server | `group:typing`          | `{ groupId, isTyping }`                      |
| Client → server | `group:delete`          | `{ msgId, groupId, deleteType }`             |
| Server → client | `group:message`         | Full group message                           |
| Server → client | `group:status`          | Message delivery/seen update                 |
| Server → client | `group:typing`          | Typing state, optionally with a display name |
| Server → client | `group:reaction`        | Reaction add, remove, or update              |
| Server → client | `group:message:deleted` | Delete/tombstone notification                |
| Server → client | `group:error`           | Rejected group operation                     |

On `group:message`, upsert the message into group history, update the group list preview, and increment unread only if the group is not visible. If it is a reply, also upsert the replies cache and increment the parent message's `replies_count` exactly once.

Reaction events contain `groupId`, `msgId`, `emoji`, `action`, and usually `userPkid`. The server may echo an event back to the reacting user and duplicate broadcasts have been observed. Ignore your own echo after an optimistic update, and make all event handlers idempotent. `action: "update"` means the user changed from one emoji to another, not that an additional reaction should be counted.

Mark the open group as read with:

```http
POST chats/groups/:groupId/seen
{}
```

Incoming messages outside the visible group are acknowledged as `delivered`; messages received while the group is visible can be acknowledged as `seen`.

### Group creation and administration

Create a group with:

```http
POST chats/groups
```

```json
{
  "name": "Design Team",
  "icon_url": "https://…",
  "can_members_edit_info": false,
  "can_members_add_users": true,
  "can_members_send_messages": true,
  "admin_have_to_approve_new_members": false,
  "members": [{ "user_id": 42, "role": "member" }]
}
```

Useful management endpoints are:

| Action             | Request                                                        |
| ------------------ | -------------------------------------------------------------- |
| Update name/icon   | `PATCH chats/groups/:id/update`                                |
| Sync/add members   | `POST chats/groups/:id/members/sync` with `user_ids`           |
| Remove member      | `POST chats/groups/:id/members/remove` with `user_id`          |
| Change role        | `POST chats/groups/:id/members/role` with `user_id` and `role` |
| Update permissions | `PATCH chats/groups/:id/permissions`                           |
| Pause/resume       | `POST chats/groups/:id/pause`                                  |
| Leave              | `POST chats/groups/:id/members/leave`                          |

Member and permission changes should update the visible UI optimistically, then refetch the group detail, member list, and group list.

## 6. Status stories

Status stories are API-driven in the current app; they do not use the chat socket.

### Status model

```ts
type StatusType = "text" | "image" | "video" | "music" | "layout";

interface StatusMedia {
  url: string;
  type: "image" | "video" | "audio";
  caption?: string;
}

interface Status {
  id: number;
  user: StatusUser;
  status_type: StatusType;
  content: string;
  media: StatusMedia[] | null;
  background_color: string;
  expires_at: string;
  is_active: boolean;
  is_viewed?: boolean;
  viewed_at?: string | null;
  views_count?: number;
  created_at: string;
  updated_at: string;
}
```

`layout` exists in the shared type, but the active mobile flow has no dedicated layout composer. Treat it as a reserved backend value unless product supplies the missing design and payload contract.

The main endpoints are:

| Action              | Request                                                       |
| ------------------- | ------------------------------------------------------------- |
| Status feed         | `GET chats/statuses/lists?page=1&limit=20`                    |
| My statuses         | `GET chats/statuses/mine`                                     |
| One user's statuses | `GET chats/statuses/users/:userPkid`                          |
| Viewers             | `GET chats/statuses/:statusId/viewers`                        |
| Create              | `POST chats/statuses`                                         |
| Mark viewed         | `POST chats/statuses/:statusId/view`                          |
| Update              | `PATCH chats/statuses/:statusId/update`                       |
| Delete              | `DELETE chats/statuses/:statusId`                             |
| Reshare             | `POST chats/statuses/:statusId/reshare` with `duration_hours` |

Even though the server filters expired items, filter again on the client:

```ts
status.is_active !== false &&
  new Date(status.expires_at).getTime() > Date.now();
```

### Building the story list

The API returns individual statuses. The client groups them by `status.user.pkid`, sorts each user's stories oldest-to-newest, and sorts users by their latest story.

Each grouped row tracks:

- total story segments;
- viewed segments;
- latest timestamp;
- whether that user is muted.

Rows with unseen segments appear under Recent. Fully viewed rows appear under Viewed. Muted users appear in a separate Muted section. Muting is currently local-only on mobile, persisted to device storage, so the web equivalent can use local storage unless the backend gains a cross-device preference endpoint.

The same grouped data is also used to draw story rings on avatars in the chat list.

### Creating stories

A text story can be posted directly:

```json
{
  "status_type": "text",
  "content": "A short update",
  "background_color": "#6A88D1",
  "duration_hours": 24
}
```

The UI currently offers 6, 12, and 24-hour presets plus a custom duration capped at seven days.

For image, video, or music stories, upload files first, then create the status with remote URLs. The current status uploader uses:

```http
POST socials/post/upload/media
Content-Type: multipart/form-data

file=<binary>
folder=post
```

It returns `data.media_urls`. This differs from the chat attachment uploader. Preserve the current backend contract for compatibility, but isolate both upload APIs behind one web media service so they can be standardized later.

Example image story:

```json
{
  "status_type": "image",
  "media": [
    {
      "url": "https://…/image.jpg",
      "type": "image",
      "caption": "A day out"
    }
  ],
  "duration_hours": 24
}
```

A music story stores the cover image and audio as two media entries. The caption is attached to the audio entry in the current implementation.

Show upload progress and allow cancellation. A durable IndexedDB upload queue is optional; the mobile status queue is only in memory, so it does not survive a full app restart either.

### Story viewer behavior

The viewer shows one user's stories in chronological order. It should:

- use a five-second segment for text and image stories;
- use the video's actual duration for video progress, with a 60-second fallback while metadata loads;
- pause when the tab is hidden, the user holds the story, or a menu/dialog is open;
- tap the left third to go back and the rest of the surface to advance;
- mark a non-owned status viewed once when it becomes the current segment;
- show viewer count and the viewer list only for the owner's own statuses;
- stop media and timers when the route unmounts or the document becomes hidden.

Use `document.visibilityState` and the Page Visibility API for browser pause/resume behavior. Use `HTMLVideoElement.duration` and `currentTime` for video progress rather than running a separate timer.

The current mobile viewer renders a music story's cover and play indicator but does not start the audio track. Confirm the intended playback behavior before adding automatic music playback on web.

## 7. Cache and event rules

These rules prevent most messenger race conditions:

1. **HTTP is the reconciliation source.** Refetch after reconnect, tab resume, and successful mutations that affect multiple lists.
2. **Socket handlers are idempotent.** Upsert by server ID and tolerate duplicate events.
3. **Optimistic writes have rollback data.** Keep the prior message, reaction set, member list, or story list until the request succeeds.
4. **Do not double-apply your own socket echo.** This matters especially for group reactions and optimistic sends.
5. **Unread means not visibly consumed.** A connected socket alone does not make a message seen.
6. **Keep query keys predictable.** Use separate keys for chat lists, direct history, group list/detail/history/replies, status list/mine/user/viewers.
7. **Sort after merging.** List and history endpoints are eventually consistent and do not always arrive in display order.

Suggested web query keys:

```ts
const messengerKeys = {
  chats: (status: string, search: string) => [
    "messenger",
    "chats",
    status,
    search,
  ],
  chatHistory: (userUuid: string) => ["messenger", "chat", userUuid, "history"],
  groups: () => ["messenger", "groups"],
  group: (id: number) => ["messenger", "group", id],
  groupHistory: (id: number) => ["messenger", "group", id, "history"],
  replies: (groupId: number, messageId: number) => [
    "messenger",
    "group",
    groupId,
    "replies",
    messageId,
  ],
  statuses: () => ["messenger", "statuses"],
  myStatuses: () => ["messenger", "statuses", "mine"],
  userStatuses: (pkid: number) => ["messenger", "statuses", "user", pkid],
};
```

## 8. Browser-specific decisions

The following mobile pieces need intentional web replacements:

| Mobile implementation           | Web replacement                                         |
| ------------------------------- | ------------------------------------------------------- |
| Expo Router screens             | Framework routes or a split-pane messenger route        |
| Expo SQLite message DB          | IndexedDB, preferably behind a small repository layer   |
| AsyncStorage preferences        | `localStorage` for non-sensitive preferences            |
| Native media picker             | `<input type="file">`, drag-and-drop, Clipboard API     |
| Native upload progress          | `XMLHttpRequest` or an HTTP client with upload progress |
| AppState/NetInfo                | `visibilitychange`, `online`, and `offline` events      |
| OneSignal/Notifee foreground UI | Service worker push plus the Notifications API          |
| Native audio/video players      | `HTMLAudioElement` and `HTMLVideoElement`               |

Do not store access or refresh tokens in `localStorage` if the authentication backend can support secure, HTTP-only cookies. Do not log message payloads, tokens, media URLs containing signatures, or socket connection URLs.

End-to-end encryption is not currently functional in the mobile repository, and the active direct-chat screen has encrypted sending disabled. The web UI should not claim that messages are end-to-end encrypted until the protocol, key lifecycle, and multi-device behavior are implemented and independently reviewed.

## 9. Mobile source map

These are the most useful files when checking behavior against the current app:

- `hooks/messenger/types.ts` — shared message, group, and status contracts.
- `hooks/messenger/use-chats.ts` — direct-chat endpoints and query behavior.
- `hooks/messenger/use-groups.ts` — group endpoints, replies, reactions, and administration.
- `hooks/messenger/use-status.ts` — status endpoints and cache behavior.
- `lib/socket/chat-socket.ts` — socket connection and outbound event payloads.
- `hooks/messenger/use-chat-socket.ts` — incoming direct-chat event handling.
- `hooks/messenger/use-group-socket.ts` — incoming group event handling.
- `hooks/messenger/use-group-rooms.ts` — group room joins and reconnect behavior.
- `lib/messenger/message-db.ts` — the mobile message cache and outbox model.
- `hooks/messenger/use-offline-message-sync.ts` — upload/send/retry processing.
- `lib/messenger/status-grouping.ts` — story grouping into recent, viewed, and muted sections.
- `app/(drawer)/messenger/(screens)/status-viewer/index.tsx` — viewer timing and navigation.

This guide reflects the active mobile implementation rather than the legacy flat messenger routes or mock-data components.
