# Group member management frontend changes

Base path: `/api/v1/chats`

All `user_id` and `user_ids` request values are integer user `pkid` values, not UUID `id` values.

## Route changes

### List members

`GET /groups/{group_id}/members`

Optional query parameters: `search`, `role=admin|member`, `is_approved=true|false`, `page`, `limit`.

### List selectable member options

`GET /groups/{group_id}/members/options`

Optional query parameters: `search`, `is_member=true|false`, `page`, `limit`.

The result contains only the requesting user's followers/following. Each item includes `is_member`, `member_role`, and `member_is_approved`.

Previous route retained temporarily: `GET /groups/{group_id}/member-options`.

### Synchronize selected members

`POST /groups/{group_id}/members/sync`

Payload:

```json
{
  "user_ids": [12, 34]
}
```

Response fields:

```json
{
  "detail": "Group members updated successfully.",
  "selected_user_ids": [12, 34],
  "created_count": 1,
  "created_user_ids": [34],
  "approved_count": 0,
  "approved_user_ids": [],
  "removed_count": 1,
  "removed_user_ids": [56]
}
```

Admins can add, approve, and remove members through sync. Members with `can_members_add_users` can add members, but sync will not allow them to remove existing members.

### Remove one member

`POST /groups/{group_id}/members/remove`

Admin-only payload:

```json
{
  "user_id": 12
}
```

### Change a member role

`POST /groups/{group_id}/members/role`

Admin-only payload:

```json
{
  "user_id": 12,
  "role": "admin"
}
```

`role` accepts `admin` or `member`.

### Leave a group

`POST /groups/{group_id}/members/leave`

No payload is required. The last approved admin cannot leave until another admin exists.

Previous route retained temporarily: `POST /groups/{group_id}/leave`.

### Pending members

- `GET /groups/{group_id}/members/pending`
- `POST /groups/{group_id}/members/pending/approve` with `{ "user_id": 12 }`
- `POST /groups/{group_id}/members/pending/reject` with `{ "user_id": 12 }`

These endpoints are admin-only and apply when member approval is enabled.

## Socket events

Listen after joining the group socket room:

- `group:member:added` — `{ groupId, userIds, addedByPkid }`
- `group:member:removed` — `{ groupId, userPkid, removedByPkid }`
- `group:member:left` — `{ groupId, userPkid }`
- `group:member:role:changed` — `{ groupId, userPkid, role, changedByPkid }`

Member removals performed by the sync endpoint now publish `group:member:removed` for each removed member.

## Error behavior

- Unknown groups return `404`.
- Authenticated users without access return `403`.
- Invalid payloads and unsupported filters return `400`.
