# Group Message Socket Events

## Client to server

| Event                 | Payload                                                                                                                      | Description                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `group:join`          | `{ groupId }`                                                                                                                | Joins the authenticated socket to a group room.                                                                                                                                                        |
| `group:send`          | `{ groupId, messageType, message, nonce?, senderEphemeralKey?, collectionId?, replyTo?, excludedUsers?, media?, metadata? }` | Creates and sends a new group message.                                                                                                                                                                 |
| `group:update`        | `{ msgId, groupId, messageType, message, metadata? }`                                                                        | Updates an existing group message.                                                                                                                                                                     |
| `group:delete`        | `{ msgId, groupId, deleteType? }`                                                                                            | Deletes a group message for the user or for everyone. `deleteType` is `self` or `both` and defaults to `self`. This event is retained for compatibility; new clients should use the REST deletion API. |
| `group:typing`        | `{ groupId, isTyping? }`                                                                                                     | Broadcasts the user's typing state. `isTyping` defaults to `true`.                                                                                                                                     |
| `group:get`           | `{ groupId, cursor?, order?, status? }`                                                                                      | Retrieves group messages. `order` is `asc` or `desc`; `status` is `all`, `sent`, `delivered`, or `seen`.                                                                                               |
| `group:status:update` | `{ msgId, groupId, status }`                                                                                                 | Updates a message status to `delivered` or `seen`.                                                                                                                                                     |
| `group:mark-seen`     | `{ groupId }`                                                                                                                | Marks unread messages in a group as seen.                                                                                                                                                              |
| `group:leave`         | `{ groupId, userId? }`                                                                                                       | Leaves the group. When `userId` is supplied, an authorized user removes that member.                                                                                                                   |
| `group:reaction`      | `{ groupId, msgId, emoji, action }`                                                                                          | Adds or removes a reaction. `action` is `add` or `remove`.                                                                                                                                             |

## Server to client

| Event                       | Payload                                       | Description                                                                                 |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `group:joined`              | `{ groupId, room }`                           | Confirms that the socket joined the requested group room.                                   |
| `group:message`             | `ChatMessage`                                 | Delivers a newly created group message. This also delivers group call-log messages.         |
| `group:message:updated`     | `ChatMessage`                                 | Delivers the latest version of an edited group message.                                     |
| `group:message:deleted`     | `{ groupId, msgIds, deleteType: "both" }`     | Reports one or more group messages deleted for everyone.                                    |
| `chat:hidden`               | `{ msgIds, userId, deleteType: "self" }`      | Reports messages deleted only for the current user. It is sent only to that user's devices. |
| `group:status`              | `{ msgId, groupId, status, senderId }`        | Reports a group message status change.                                                      |
| `group:typing`              | `{ senderId, groupId, isTyping }`             | Reports that another member started or stopped typing.                                      |
| `group:messages`            | Group history API response                    | Returns the result of a `group:get` request.                                                |
| `group:reaction`            | `{ groupId, msgId, emoji, action, userPkid }` | Reports that a reaction was added, updated, or removed.                                     |
| `group:message:pinned`      | `{ groupId, msgId, pinnedByPkid, action }`    | Reports that a message was pinned or unpinned. `action` is `pin` or `unpin`.                |
| `group:member:added`        | `{ groupId, userIds, addedByPkid }`           | Reports that one or more members were added or approved.                                    |
| `group:member:removed`      | `{ groupId, userPkid, removedByPkid }`        | Reports that a member was removed from the group.                                           |
| `group:member:left`         | `{ groupId, userPkid }`                       | Reports that a member left the group.                                                       |
| `group:member:role:changed` | `{ groupId, userPkid, role, changedByPkid }`  | Reports that a member's role changed.                                                       |
| `group:info:updated`        | `{ groupId, name, iconUrl, updatedByPkid }`   | Reports changes to the group's name or icon.                                                |
| `group:paused`              | `{ groupId, pauseUntil, pausedByPkid }`       | Reports that group messaging was paused.                                                    |
| `group:resumed`             | `{ groupId, resumedByPkid }`                  | Reports that group messaging was resumed.                                                   |
| `group:error`               | `{ error, details? }`                         | Reports a failed or invalid group operation.                                                |

## `ChatMessage` payload

`group:message` and `group:message:updated` contain the serialized message object:

```text
{
  id, sender, receiver, group, message_type, content, nonce,
  sender_ephemeral_key, media, metadata, collection_id, status,
  reply_to, is_hidden, is_pinned, reactions, reply_count,
  reaction_count, interaction_score, tts_audio_url, created_at, updated_at
}
```
