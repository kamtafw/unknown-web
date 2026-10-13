# Backend Contract Proposal: Safe Chat-List Previews for E2EE

**Repository:** `kamtafw/unknown-web`  
**Status:** Proposed for backend review; not yet an agreed or deployed backend contract  
**Scope:** Chat list preview metadata for direct chats, Favorites, Archive, and any other list endpoint that renders a latest-message preview.

## 1. Problem

The current list payloads return `last_message_preview` and `last_message_time`, but do not consistently return `last_message_type`. The web client therefore cannot select a useful type-specific fallback when a preview is empty.

Separately, an E2EE direct-message preview can contain ciphertext. A nonempty string is not proof that it is plaintext, and `last_message_type: "text"` would not prove that either. The current E2EE guide requires the web client not to render server-provided `last_message_preview` for E2EE direct messages.

These are two related but separate contract concerns: message-type metadata supports presentation; authoritative encryption state determines whether a server preview is safe to display.

## 2. Proposed response fields

### 2.1 `last_message_type`

Add a nullable `last_message_type` to every list target that represents a conversation and exposes latest-message metadata.

| Endpoint / surface | Target |
|---|---|
| `GET /api/chats?status=all` and `status=unread` | Each `data.users[]` item |
| `GET /api/chats/favorites` | Each user `data.results[].target` |
| `GET /api/chats/archive` | Each `data.results[].target`, for both user and group targets |
| Custom-list member/list endpoints | Each user/group conversation target where latest-message preview metadata is returned |
| Other chat-list endpoints | Any equivalent latest-message target |

Suggested shape:

```json
{
  "last_message_preview": "Image",
  "last_message_time": "2026-10-12T07:12:21.948133Z",
  "last_message_type": "image",
  "last_message_id": 123
}
```

Requirements:
- Derive the value from the actual latest message, not by parsing `last_message_preview`.
- Reuse the canonical message-type vocabulary already returned by message history.
- Return `null` when no latest message exists or its type cannot be determined.
- Keep `last_message_time` aligned with that same latest message.
- Apply the same semantics across all list endpoints to avoid different preview behavior between All, Favorites, Archive, and custom lists.
- Do not introduce a second vocabulary just for list responses.

The web client's existing type vocabulary includes values such as `text`, `media`, `image`, `video`, `audio`, `voice`, `document`, `location`, `contact`, `sticker`, `poll`, `call`, and `share`. Backend owners should confirm the canonical supported set.

### 2.2 `last_message_id` for local-preview freshness

Add a nullable numeric `last_message_id` beside `last_message_type` and `last_message_time` on the same list targets. It must identify the exact latest message represented by those fields. This lets the web client match a locally decrypted copy by message ID rather than relying on timestamp equality, which can collide when messages are created within the same millisecond. Return `null` when there is no latest message.

The frontend can temporarily use timestamp matching when this field is absent, but the ID is the preferred authoritative freshness check.

### 2.3 Authoritative E2EE preview-safety signal

Backend review is needed to agree on how the web client can distinguish an E2EE direct-message preview from a non-E2EE preview without inspecting the preview string.

Preferred options, in order of discussion:
1. Return a boolean such as `last_message_is_e2ee` that describes the latest message represented by the preview; or
2. Return a conversation-level E2EE state if encryption is a stable, authoritative property of the direct conversation.

The backend should select the field and semantics that fit its actual data model. These names are proposals, not existing fields.

Requirements:
- The signal must come from authoritative server-side message/conversation state, not from heuristics based on string shape or message type.
- Its meaning must be consistent across list endpoints.
- Missing or unknown state must not be interpreted by the client as proof that the preview is safe.
- Groups must retain their existing non-E2EE behavior unless a separate group-E2EE contract is approved.
- The signal must not contain cryptographic key material or message plaintext.

If the backend cannot reliably expose this signal yet, the frontend should follow the current guide's conservative rule for direct-message previews rather than rendering potentially encrypted server content.

## 3. Frontend behavior once the contract is agreed

- For a confirmed E2EE direct message, never display the server's `last_message_preview`.
- Display a local decrypted preview only when the local copy can be matched to the latest message represented by the list response.
- If no matching local copy exists, use a safe fallback based on `last_message_type`, such as `Image`, `Voice message`, `Poll`, or a generic `Encrypted message` when the type is unknown.
- For a confirmed non-E2EE message, preserve the server preview.
- For missing/unknown encryption state, do not assume a nonempty preview is safe.
- Preserve existing group preview behavior unless the group protocol changes separately.

## 4. Compatibility and rollout

1. Backend confirms the canonical message-type set and the encryption-state signal.
2. Backend adds the fields consistently to all relevant list targets.
3. Frontend accepts nullable/missing `last_message_type` during rollout and uses a safe generic fallback.
4. Backend and frontend contract tests cover All/Unread, Favorites, Archive, custom lists, direct chats, and groups.
5. Once the fields are deployed, remove temporary compatibility behavior only after confirming the minimum supported backend version.

The frontend must not infer encryption from `last_message_type`, `last_message_preview`, or ciphertext-like string patterns.

## 5. Acceptance criteria for backend review

- [ ] Confirm `last_message_type` and its canonical values.
- [ ] Confirm `last_message_id` and ensure it identifies the same latest message as the type and timestamp.
- [ ] Confirm null/empty semantics when no message exists.
- [ ] Confirm whether encryption state is message-level or conversation-level.
- [ ] Choose and document the authoritative E2EE signal and its exact field name.
- [ ] Add the agreed fields to All/Unread, Favorites, Archive, custom lists, and equivalent list endpoints.
- [ ] Ensure type and timestamp refer to the same latest message.
- [ ] Add API tests for consistent response shape and semantics.
- [ ] Confirm group previews remain compatible with the existing group protocol.

**No backend implementation is included in this repository proposal.** Backend field names remain pending review until the owning API team agrees to them.
