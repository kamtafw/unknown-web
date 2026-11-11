# Events API specification and frontend web implementation guide

This guide defines event endpoints, request payloads, response fields, access conditions, and frontend web implementation flows. Payloads and responses are described in field tables without code samples.

## 1. Scope and product rules

All event routes below are relative to `/api/v1/events/`. Supporting live routes are relative to `/api/v1/live/`. Configure the API and socket origins per environment; the HTTP API origin and Socket.IO origin can differ. Endpoint paths have no trailing slash after the final segment.

The web Events discovery screen must show only events near the user's current location. Use a **25 km radius**, matching mobile. Discovery must not call the unfiltered list or search endpoints, including during initial loading, permission denial, GPS errors, empty results, offline operation, or failed retries. There is no "All locations" or "Clear location filter" discovery mode.

"My events" is the management exception: users may see events they host or have a guest record for regardless of distance. Its list and search requests must always include `filter=my_events`.

**Current backend distinction:** the server still accepts global list/search requests and caller-selected nearby radii. Nearby-only discovery and the 25 km threshold are frontend requirements, not server-enforced access restrictions. Event details and join requests do not check the caller's distance. Restricting direct API access to nearby events requires a separate backend change.

## 2. Transport, authentication, and identifiers

| Item | Contract |
| --- | --- |
| Authentication | All event operations require a valid access token. Send the `Authorization` header using the `Bearer` scheme. The configured backend also accepts the `JWT` scheme. |
| Accept header | Request JSON responses. |
| JSON bodies | Use `application/json` for non-file submissions. |
| File bodies | Use `multipart/form-data` when uploading the cover image or document files; let the browser set the multipart boundary. |
| Event identifier | `event_id` in event paths is the event UUID, represented as a string. |
| Event room identifier | `room_id` is a separate generated string; it is not the UUID or live-session ID. |
| Live-session identifier | `session_id` and `live_session_id` are integers. Use them only with live routes and live socket joins. |
| User identifier in mutations | Guest and live participant mutations use the user's numeric `pkid`, not the user's UUID. |
| Date input/output | Event dates are `YYYY-MM-DD`. |
| Time input | Create/update requires `HH:MM:SS`; sending only `HH:MM` is rejected. |
| Time output | Full event and list responses use `HH:MM`. Restricted previews use the default time format, normally `HH:MM:SS`. Normalize either representation before editing. |
| Timestamps | Timestamp fields use JSON datetime strings, usually ISO 8601, or null where specified. |
| Timezone | Base backend configuration uses UTC. Event date/time fields carry no timezone or offset. The web form must establish and communicate its timezone and convert inputs consistently to the deployed backend timezone. Do not assume browser local time is the event timezone. |
| Coordinates | Request fields are named `latitude` and `longitude`; returned coordinate arrays use **longitude first**, then latitude. |

### 2.1 Success envelope

All HTTP responses use the envelope below, except successful 204 responses, which have no body.

| Field | Type | Meaning |
| --- | --- | --- |
| `success` | Boolean | True for HTTP 2xx. |
| `status_code` | Integer | HTTP status repeated in the body. |
| `message` | String or null | The response message. Some successful reads have no detail and therefore return null. |
| `data` | Object or array | Endpoint-specific response defined below. Nested details remain inside their endpoint-specific objects. A message-only success normally has an empty object here. |

Do not require `data.detail` for success messages. A successful DELETE returns HTTP 204 and must be handled without parsing a response body, even though the view constructs a message internally.

### 2.2 Error envelope

| Field | Type | Meaning |
| --- | --- | --- |
| `success` | Boolean | False. |
| `status_code` | Integer | HTTP error status. |
| `message` | String | Error description, or `Request failed.` when only field validation errors are supplied. |
| `code` | String | Explicit backend error code when supplied; otherwise a standard API error code, or the default error code. Fallback is `authentication_error` for 401/403 and `request_error` otherwise. |
| `errors` | Object or null | Each error key maps to an object containing `message` and `code`. Keys may be field names or `non_field_errors`. |

Only the first message for each field is returned. Nested validation errors may be returned as text rather than a full nested error tree. A business-rule 403 without an explicit code can have the generic `authentication_error` fallback; do not treat every 403 as an expired login.

Authentication failures normally return 401. Invalid methods can return 405, malformed bodies 400, and unsupported content types 415. Malformed UUID paths do not match the route and can produce a framework 404 outside this envelope. Unhandled server failures are not guaranteed to have the documented JSON envelope.

### 2.3 Pagination

Used by event list/search, nonempty nearby results, event guests, event comments, and the supporting live participant/comment lists.

| Query parameter | Type | Condition |
| --- | --- | --- |
| `page` | Positive integer | Optional; defaults to 1. |
| `limit` | Positive integer | Optional; defaults to 10, maximum 100. |

| Field under `data` | Type | Meaning |
| --- | --- | --- |
| `count` | Integer | Pagination source count; see nearby-specific caveat. |
| `total_pages` | Integer | Number of pages. |
| `limit` | Integer | Effective page size. |
| `current` | Integer | Current page. |
| `previous`, `next` | URL string or null | Pagination links. Preserve the scope and location query parameters when navigating pages. |
| `results` | Array or object | Usually an array. Nearby uses an object containing `detail` and `events`. |

The usual pagination success message is `Record retrieved successfully`. An invalid or nonexistent page can return 404. An empty page is not necessarily the end of nearby pagination; check `next`.

## 3. Response data models

### 3.1 Event summary

Returned in list/search `data.results` items and as the common portion of full event responses.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | UUID string | Event identifier. |
| `room_id` | String or null | Generated event room identifier. |
| `live_session_id` | Integer or null | Attached live-session identifier. |
| `live_session` | Attached session object or null | Compact session metadata defined below. |
| `name` | String | Event title. |
| `start_date`, `end_date` | Date strings | Scheduled dates. |
| `start_time`, `end_time` | Time strings | `HH:MM` in this model. |
| `is_locked`, `is_live` | Booleans | Passcode gate and event live flag. The flag alone is not proof of media readiness. |
| `privacy` | Enum string | `public`, `private`, or `friends`. |
| `cover_image` | URL/path string or null | Stored cover image. Resolve relative media references against the configured media origin. |
| `hosts` | Host array | Event hosts, independent of live-session participant roles. |
| `event_hashtags` | String array | Normalized hashtag names. |
| `event_location` | Object or null | Contains `address` and `coordinates`; coordinates are a two-number array in longitude/latitude order. Address may be empty or null. |
| `guests` | Event guest array | Guest records, including records that are no longer online. The response does not expose `is_online`. |
| `viewer_rsvp_status` | String or null | Current viewer's `going`, `interested`, or `not_going`; null if absent. |

Latitude, longitude, and passcode are write-only. The full response uses `event_hashtags` for stored tags; do not depend on a returned `hashtags` write field.

### 3.2 Full event

Extends the event summary with `links` and `documents` arrays. Inline links contain `link_name` and `url`. Inline documents contain `doc_name` and `doc_file`. Use the resources endpoint for their additional display metadata.

Create, update, authorized details, and nearby results use this model. Create returns null for `viewer_rsvp_status`; normalize relative media URLs before displaying them.

### 3.3 Restricted event preview

When a locked or nonpublic event is viewed by a user who is neither a host nor an online event guest, details still returns 200, but `data` contains only:

| Field | Type | Meaning |
| --- | --- | --- |
| `id`, `name` | UUID string, string | Event identity and title. |
| `start_date`, `end_date` | Date strings | Scheduled dates. |
| `start_time`, `end_time` | Time strings | Time format normally including seconds. |
| `is_locked`, `is_live`, `privacy` | Booleans and enum string | Access and live indicators. |
| `cover_image` | URL/path string or null | Cover image. |
| `live_session_id` | Integer or null | Attached session identifier. Does not itself grant access. |
| `address` | String or null | Flat address; no coordinate object. |
| `hashtags` | String array | Flat tag list; named differently from full event tags. |

Preview responses omit hosts, guests, links, documents, attached session details, room ID, and viewer RSVP. Missing fields must not be interpreted as empty resources or as permission to access the room.

### 3.4 Host and event guest

| Model | Fields |
| --- | --- |
| Host | Numeric `pkid`, UUID `id`, `first_name`, `last_name`, `email`, `username`, `phone_number`, and `profile_photo`. Nullable/blank profile values can occur. |
| Event guest | Numeric `user_id` corresponding to user `pkid`; `user_photo`, `user_full_name`, `user_username`, `role`, `rsvp_status`, and `joined_at`. |
| Guest role | `host` when the user is an event host; otherwise `guest`. This is not the live participant role. |
| Guest RSVP | `going`, `interested`, `not_going`, or an empty string when no RSVP exists. |

Do not use guest-array length as an online count. Event host membership does not automatically create an event guest row. Avoid displaying returned host contact information unless the product explicitly needs it.

### 3.5 Attached live-session summary

| Field | Type / values |
| --- | --- |
| `id` | Integer session ID. |
| `title` | String. |
| `status` | `waiting`, `live`, `ended`, or `cancelled`. |
| `session_type` | `public` or `private`; sessions created by the event bridge are always private. |
| `participant_count` | Integer. |
| `started_at`, `ended_at` | Datetime strings or null. |
| `media_provider` | `p2p` or `livekit`. |
| `media_status` | `legacy`, `pending`, `provisioning`, `ready`, `failed`, `missing`, or `ended`. |
| `media_room_name` | String; may be empty before assignment. |

### 3.6 Socket connection descriptor

Event join/session responses return a `socket` object containing `namespace` equal to `/live`, `join_event` equal to `live:join`, and `join_payload.sessionId` equal to the integer live-session ID. Join can return null for both `socket` and `live_session_id` when a legacy event has no attached session. This descriptor is not a media credential or socket URL.

## 4. Event endpoint inventory

Every operation requires authentication. The endpoint sections describe additional access conditions.

| Method | Path relative to `/api/v1/events/` | Purpose |
| --- | --- | --- |
| GET | `location/nearby` | Location-scoped discovery. |
| POST | `my-location` | Resolve an address from supplied or stored coordinates. |
| GET | `list` | List events; web uses only `filter=my_events`. |
| GET | `search` | Search events; web uses only `filter=my_events`. |
| POST | `create` | Create an event. |
| PUT / PATCH | `{event_id}/update` | Update an event as a host. |
| DELETE | `{event_id}/delete` | Delete an event as a host. |
| GET | `{event_id}/details` | Read a full event or restricted preview. |
| POST | `rsvp` | Record or replace the caller's RSVP. |
| POST | `{event_id}/join` | Join a currently live event. |
| POST | `{event_id}/leave` | Mark the caller's event guest record offline and leave its live session. |
| GET | `{event_id}/guests` | Paginated guest records. |
| POST | `{event_id}/guests/add` | Host adds a guest record. |
| POST | `{event_id}/guests/remove` | Host deletes a guest record. |
| POST | `{event_id}/comments/create` | Create an event comment. |
| GET | `{event_id}/comments` | Paginated event comments. |
| GET | `{event_id}/resources` | Read event links/documents. |
| GET / POST | `{event_id}/live-session` | Read or create the attached session. |
| POST | `{event_id}/live-session/start` | Start the attached session. |
| POST | `{event_id}/live-session/end` | End the attached session. |
| PATCH | `{event_id}/update-live-status` | Compatibility start/end operation. |

### 4.1 GET `location/nearby`

| Query field | Type | Required / default |
| --- | --- | --- |
| `latitude` | Number | Required. Web validates finite and within -90 to 90. |
| `longitude` | Number | Required. Web validates finite and within -180 to 180. |
| `radius_km` | Number | Backend default 5; **web must explicitly send 25**. Validate as positive and finite. |
| `page`, `limit` | Integers | Standard pagination. |

**Success:** 200. When no geospatial locations match, `message` is `No events nearby.` and `data.events` is an empty array; pagination metadata is absent. When locations match, `data` is paginated and `data.results` contains `detail` plus `events`. Its detail reports the number of matching location IDs. Each event is a full event with additional top-level `address` and `distance_km`; distance is in kilometers rounded to two decimal places.

**Conditions:** geospatial results are nearest first. Events whose end date/time is earlier than the backend's current date/time are excluded from returned event objects. There is no `q` search parameter, privacy filter, My events filter, or caller location fallback. Events without stored geospatial locations are absent.

**Errors:** 400 `Invalid coordinates` for missing/unparseable latitude, longitude, or radius. The API does not explicitly reject nonfinite coordinates, out-of-range values, or negative/unbounded radii before the database call; these are not guaranteed to produce a clean 400.

**Pagination limitation:** location IDs are paginated before expired or missing events are removed. `count`, `total_pages`, and the nearby detail can include expired events or orphan locations; a page can be empty while `next` is non-null. Treat returned events and `next` separately.

### 4.2 POST `my-location`

| Body field | Type | Condition |
| --- | --- | --- |
| `use_live_location` | Boolean | Optional; defaults to false. |
| `latitude`, `longitude` | Numbers | Both required when `use_live_location` is false. |

**Success:** 201, message `Location obtained successfully.`; `data` contains `latitude`, `longitude`, `use_live_location`, `address`, and `raw_location_data`. Coordinates are those returned by reverse geocoding, which may differ slightly from the supplied GPS coordinates. The raw object is geocoder metadata with no fixed application schema.

**Conditions:** false resolves supplied coordinates. True reads the caller's stored account location and requires location sharing to be enabled; this operation does not request browser GPS, update user location, or save an event location. Web discovery should use browser coordinates with false. Treat the address result as a display enhancement and keep original GPS coordinates for nearby requests.

**Errors:** 400 for missing supplied coordinates, disabled live location, geocoder service errors, or an unresolved address. Missing stored account preferences are not reliably handled and may fail outside the documented 400 cases.

### 4.3 GET `list`

**Query:** `filter` is optional at the server; only exact `my_events` scopes to the current user's hosted events or any event guest record. `page` and `limit` are standard pagination.

**Success:** 200, paginated event summaries in `data.results`, ordered by start date descending, start time descending, then internal event ID descending. Upcoming events are not ordered soonest first. Past events and offline guest memberships are included.

**Web condition:** always send `filter=my_events`. Omitting it or sending an unrecognized value currently returns all events; the web discovery flow must never use that behavior. An RSVP alone does not create My events membership.

### 4.4 GET `search`

**Query:** `q` is an optional trimmed string; `filter`, `page`, and `limit` behave as on list. Empty `q` acts like list. Web always sends `filter=my_events`.

**Success:** 200, paginated event summaries in `data.results`, with the same descending schedule order as list. Search uses full-text ranking on event name and hashtags with a minimum rank of 0.1; it does not order by relevance. It also queries stored location name/address, but the current search ranking filter prevents location-only matches from being reliably included.

**Conditions:** this is not a nearby search endpoint and does not accept location constraints. Do not use it for discovery search. Invalid pages can return 404; this endpoint has no event-specific 404 for a search with no matches.

### 4.5 POST `create`

Any authenticated user may create an event and becomes its event host. Use JSON for metadata-only submissions and multipart for uploads.

| Body field | Type | Required / behavior |
| --- | --- | --- |
| `name` | String | Required, nonblank, maximum 255 characters. |
| `start_date`, `end_date` | Date strings | Required, `YYYY-MM-DD`. |
| `start_time`, `end_time` | Time strings | Required, `HH:MM:SS`. |
| `latitude`, `longitude` | Numbers or numeric multipart strings | Both required on create; server reverse geocodes and stores the event location. |
| `privacy` | Enum string | Optional; defaults to `public`. Allowed: `public`, `private`, `friends`. |
| `is_locked` | Boolean | Optional; defaults to false. For multipart use textual `true` or `false`. |
| `passcode` | String | Required when creating a locked event; exactly four ASCII digits. Preserve leading zeros. Write-only and hashed when saved. |
| `is_live` | Boolean | Accepted, defaults to false, but web must use the lifecycle endpoints to start/end an event. Setting this field does not provision a live session. |
| `cover_image` | Image file | Optional; JPEG or PNG only, at most 2,097,152 bytes. Omission uses the default cover. |
| `links` | Array | Optional. Each item requires `link_name` up to 255 characters and a valid `url`. |
| `documents` | Array of uploaded document objects | Optional. Each item requires `doc_name` up to 255 characters and an uploaded `doc_file`. |
| `hashtags` | String array | Optional. Values are trimmed, lowercased, emptied entries skipped, and duplicates removed. |

**Multipart conditions:** links and hashtags accept JSON-encoded array strings or contiguous indexed fields. Indexed link fields are `links[0].link_name` and `links[0].url`; tags use `hashtags[0]`. Document file uploads use contiguous `documents[0].doc_name` and `documents[0].doc_file` fields, starting at index zero without gaps. Do not simultaneously send an independent `documents` array when using indexed file fields; a parsed array takes precedence. File URLs or local filename strings are not uploads. Nested JSON strings must contain valid JSON.

**Success:** 201, message `Event created successfully.`, `data` is a full event. The server generates `id` and `room_id`, assigns the caller as host, and stores location/resources. Creating the event does not create or start a live session.

**Validation:** locked events force privacy to `private`. Start date cannot be after end date. Separately, start time cannot be after end time even when the end date is later, so an overnight schedule with an earlier end clock time is currently rejected. The API does not reject past dates or equal start/end values. Validate the intended complete schedule in the web form. Invalid fields return 400; external geocoding/storage failures may produce server errors.

### 4.6 PUT / PATCH `{event_id}/update`

**Access:** event host only. Both methods currently accept partial updates; omitted fields are retained. Prefer PATCH to communicate partial intent.

**Payload:** writable fields, uploads, formats, and constraints are the same as create, except required creation fields may be omitted. Submit both coordinates together to replace the stored location; only the pair triggers the location update. Sending one coordinate does not move the stored event location. Renaming without coordinates does not refresh the stored location's searchable name.

**Collection replacement conditions:** omit links/documents/hashtags to retain existing entries. Supply an empty array to clear a collection. Supply a populated array to replace the entire collection. There are no individual event resource add/delete routes. Existing file URLs cannot be supplied as replacement uploads; preserving some documents while replacing the collection requires an agreed upload workflow rather than resending URLs.

**Passcode conditions:** locking an unlocked event requires a new passcode unless a hash already exists. A locked event can keep its existing code by omitting `passcode`; an explicitly empty code is rejected while locked. Sending `is_locked=false` unlocks but does not automatically reset privacy or erase the stored code. Include the intended privacy explicitly when changing it. Omitted/blank/null passcodes do not implement a reliable "erase existing code" action.

**Schedule conditions:** date/time pair checks compare fields supplied together, not the complete merged schedule. Web validation must consider retained values too. Return the displayed `HH:MM` times to the required `HH:MM:SS` input format before submitting them.

**Success:** 200, message `Event updated successfully.`, `data` is a full event. Updating event metadata does not synchronize an already attached live session's title, hashtags, or media state.

**Errors:** 404 when event is absent; 403 `Only an event host can perform this action.`; 400 for field validation.

### 4.7 DELETE `{event_id}/delete`

**Access:** event host only. No request body.

**Success:** 204, no response body. Removes the event and its stored location. Deleting an event does not explicitly end/delete its attached live session or provider room; end an active room first before deleting through the web management flow.

**Errors:** 404 when absent; 403 for a nonhost. Once confirmed successful, evict the event and related resource/detail caches and remove it from lists.

### 4.8 GET `{event_id}/details`

No body or endpoint-specific query parameters.

**Success:** 200. Public, unlocked events return a full event to any authenticated user. For locked, private, or friends events, a host or online event guest receives the full event; everyone else receives the restricted preview. There is no separate friend-relationship check here.

**Errors:** 404 when absent. Restricted preview is a successful 200, not a 403. Model the two response shapes explicitly.

### 4.9 POST `rsvp`

| Body field | Type | Condition |
| --- | --- | --- |
| `event_id` | UUID string | Required; event must exist and not have ended. |
| `status` | Enum string | Required: `going`, `interested`, or `not_going`. |

**Success:** 201 for both creation and replacement. Message `RSVP recorded successfully.`; `data.event` is the event UUID and `data.status` is the saved value. There is one RSVP per user/event.

**Conditions:** does not join the event, create a guest row, issue media access, or add an RSVP-only event to My events. No privacy, passcode, or distance check is performed here.

**Errors:** 400 for invalid payload, nonexistent event (`event_id` validation), or an event whose combined end datetime is earlier than now.

### 4.10 POST `{event_id}/join`

**Payload:** optional `passcode` string. Required when locked, except event hosts and already-online event guests bypass the passcode check. Use an empty body for an unlocked event.

**Conditions:** event must not have ended and `is_live` must be true. With an attached session, that session must also have status `live` and the user must not be blocked. Nonhost joining creates a new event guest or marks an existing guest online, then creates/reactivates live participation. Session errors roll back the new/changed guest state. Hosts open without creating an event guest row. Privacy values `private` and `friends` do not introduce an additional join/invitation check when the event is unlocked.

**Success response data:** `live_session_id` and `socket`; both may be null for events without an attached session.

| HTTP status | Message / condition |
| --- | --- |
| 201 | `You have successfully joined the event.` New guest or offline guest rejoining. |
| 200 | `You have already joined this event.` Existing online guest. |
| 200 | `You have opened the event.` Host. |

| Error status | Condition / message |
| --- | --- |
| 400 | Missing event: `Event not found.` This endpoint differs from most event routes. |
| 400 | `This event has already ended.` or `This event is not currently live.` |
| 400 | `Passcode is required for this event.` or locked event missing a configured passcode. |
| 403 | `Incorrect passcode.` |
| 400 | Attached-session error with explicit `code`: `event_not_live` or `live_session_blocked`. |

Joining has no location-distance check. A scheduled, not-live event cannot be joined merely to unlock its resources; show its preview and RSVP flow until it becomes live.

### 4.11 POST `{event_id}/leave`

No body. An event guest record must exist. Marks that record offline and deactivates nonhost live participation; keeps the event guest record, so the event remains in My events.

**Success:** 200, message `You have left the event.`, empty `data` object. Repeated calls can still succeed while the guest row exists.

**Errors:** 404 absent event; 400 `You are not a guest of this event.` Hosts usually have no guest row, so the normal event leave endpoint is not a guaranteed host-close operation. A host leaving the local browser screen must not implicitly end the broadcast; ending uses the explicit host endpoint.

### 4.12 GET `{event_id}/guests`

**Query:** standard pagination. **Access:** event host or any event guest record; the caller's guest record need not be online.

**Success:** 200, paginated event guest objects ordered by newest `joined_at` first. Includes online and offline guest records; no online filter is implemented and no `is_online` field is returned.

**Errors:** 404 absent event; 403 `You do not have permission to view this event's guests.` Public event visibility alone does not grant this endpoint.

### 4.13 POST `{event_id}/guests/add`

**Payload:** required `user_id`, numeric user `pkid`. **Access:** event host only.

**Success:** 201, message `Guest added successfully.`, empty `data`. Creates an event guest with the model's default `is_online=true`; it does not create a linked live participant or connect the target to media. No live/schedule/passcode condition is checked.

**Errors:** 400 missing user ID or existing guest record, including an offline guest; 404 absent event or target user; 403 `Only event hosts can add guests.` Invalid identifier types are not comprehensively validated by the view.

### 4.14 POST `{event_id}/guests/remove`

**Payload:** required `user_id`, numeric user `pkid`. **Access:** event host only.

**Success:** 200, message `Guest removed successfully.`, empty `data`. Deletes the event guest record; related event comments also cascade through their guest foreign key. It does not explicitly revoke a live participant or disconnect provider media. Use live moderation when removing someone from a running broadcast.

**Errors:** 400 missing user ID; 404 absent event or `Guest not found in this event.`; 403 `Only event hosts can remove guests.`

### 4.15 POST `{event_id}/comments/create`

**Payload:** required nonblank `message` string. No explicit maximum length is set on the event comment field.

**Access:** caller must have an online event guest row. Event host status alone is insufficient. This route does not explicitly require `is_live` or check scheduled end time.

**Success:** 201, `data.message` contains the submitted comment. It does not return the comment UUID, author, or timestamp, and the outer success `message` is null. Refetch event comments for the canonical record. This route does not publish a live-comment socket event.

**Errors:** 404 absent event or `The user has not joined this event. Only users that have joined can comment.`; 400 blank/missing comment.

### 4.16 GET `{event_id}/comments`

**Query:** standard pagination. **Access:** any authenticated viewer for public unlocked events; host or online event guest for locked/nonpublic events.

**Success:** 200, paginated `data.results`, newest `created_at` first. Each comment contains UUID `id`, string `message`, timestamp `created_at`, and `user`. Author fields are numeric `pkid`, UUID `id`, `photo`, `full_name`, `username`, event role `host` or `guest`, and guest `joined_at`.

**Errors:** 404 absent event; 403 `Join this event before accessing its live session.` for restricted access. The API uses this message even for comments/resources.

### 4.17 GET `{event_id}/resources`

**Access:** any authenticated viewer for public unlocked events; host or online event guest for locked/nonpublic events. No body and no pagination.

**Success:** 200, outer message null. `data.event` is the event **name**, not its UUID. `data.links` and `data.documents` are arrays, including empty arrays when none exist.

| Resource | Fields |
| --- | --- |
| Link | `link_name`, `url`, `date_added`. Date is `DD/MM/YYYY` derived from event creation time, not an independent link timestamp. |
| Document | `doc_name`, `doc_file`, `size`, `file_type`, `date_uploaded`. |
| Document metadata | `size` is a display string in B/KB/MB/GB or null; `file_type` is the uppercased filename extension or null; `date_uploaded` is `DD/MM/YYYY`. |

**Errors:** 404 absent event; 403 when restricted-event access is denied. Uploading/replacing/deleting resources is done through create/update collections; this read route does not accept mutations.

### 4.18 GET `{event_id}/live-session`

**Access:** event host or online event guest, even for public events. No body.

**Success:** 200, outer message null. `data` contains `event_id`, full `live_session`, and `socket`. The full live-session schema is in section 5.

**Errors:** 404 absent event; 403 `Join this event before accessing its live session.`; 404 `This event does not have a live session.` after membership authorization succeeds. Does not create a missing session or join the caller to it.

### 4.19 POST `{event_id}/live-session`

**Access:** event host only. No body. Send actual client platform/version through `X-Platform` and `X-App-Version`.

**Success:** 201 with message `Event live session created successfully.` when attaching a session, or 200 with `Event already has a live session.` when one already exists. `data` contains `event_id`, full `live_session`, and `socket`.

**Conditions:** creates a private session in `waiting`, assigns the creating user as its live host and initial active participant, and attaches it to the event. Does not mark the event live. Existing sessions are reused without selecting a new media provider, recreating an ended session, or promoting every event host to live host.

**Errors:** 404 absent event; 403 event host authorization failure. This endpoint has no event-specific validation payload.

### 4.20 POST `{event_id}/live-session/start`

**Access:** event host only. No body. Platform/version headers are used when a session must first be created.

**Success:** 200, message `Event live session started successfully.`; `data` contains `event_id`, `is_live`, full `live_session`, `socket`, and `synchronization_status` equal to `pending` or `synchronized`.

**Conditions:** creates an attached session if missing, then transitions only a `waiting` session to `live`. Sets event `is_live` from the resulting status. For LiveKit sessions, provisioning must succeed. Start is not an idempotent toggle: starting an already-live or ended session returns an error. This route does not itself enforce the event's scheduled start/end window.

**Errors:** 404 absent event; 403 event host authorization; 400 with explicit lifecycle code. Codes include `invalid_status`, `media_provisioning`, `media_service_unavailable`, `media_state_conflict`, and `not_found`. Event lifecycle views map these to 400 even when the underlying issue is provider availability.

### 4.21 POST `{event_id}/live-session/end`

**Access:** event host only. No body.

**Success:** 200, message `Event live session ended successfully.`; `data` contains `event_id`, `is_live=false`, `live_session_id`, and `synchronization_status` equal to `pending` or `synchronized`.

**Conditions:** requires an attached session. Can end a waiting or live session. Marks it ended, clears active participation/count, marks online event guests offline, and schedules LiveKit room deletion when applicable. Repeating end is an error; the same attached ended session cannot be restarted by start.

**Errors:** 404 absent event; 403 event host authorization; 400 codes `live_session_missing`, `live_session_ended`, `live_session_cancelled`, or `not_found`.

### 4.22 PATCH `{event_id}/update-live-status`

**Access:** event host only. **Payload:** required `is_live` as an actual JSON Boolean. A string such as textual true is rejected here.

**Conditions:** true delegates to start and false delegates to end when a session exists. False without an attached session simply persists `is_live=false`. Prefer explicit start/end endpoints for new web work; do not combine both operations for one user action.

**Success:** 200, message `Event live status updated successfully.`; `data` contains `event_id`, `room_id`, `live_session_id`, `is_live`, and `synchronization_status`. It does not include the full live session or socket descriptor.

**Errors:** 404 absent event; 403 nonhost; 400 `is_live must be a boolean.` or lifecycle codes as above.

## 5. Live-room dependencies for event web screens

These are supporting APIs under `/api/v1/live/`, not additional event routes. Use the event's returned integer live-session ID. Event join is the attendee admission path; do not substitute generic session join, invite-code join, or a client-generated room identifier.

**GET `sessions/{session_id}`** returns 200 with the full live-session object directly under `data` and message `Live session retrieved successfully.` No body. A private session requires the original session host, active live participation, accepted session invitation, or accepted series access; no access returns 403 and a missing session returns 404. This is also the read used by socket room authorization. Event screens can use the event-specific live-session read to retain its additional event guest/host access check.

### 5.1 Full live-session response

| Field | Type / meaning |
| --- | --- |
| `id`, `title`, `description` | Integer ID and strings. |
| `host` | User snapshot: UUID `id`, numeric `pkid`, `username`, `first_name`, `last_name`, and `profile_photo`. |
| `session_type`, `status` | Session enums defined in section 3.5. Event-attached sessions are private. |
| `participant_count`, `hashtags` | Integer count and string array. |
| `invite_code` | UUID string or null; returned only for active public sessions, so event sessions normally return null. |
| `participants` | Active live participant array. |
| `started_at`, `ended_at`, `created_at` | Datetime strings; start/end may be null. |
| `is_joined` | Whether the requester has an active live participant record. |
| `current_user_role` | `host`, `co_host`, `speaker`, `listener`, or null. |
| `media` | `provider`, `status`, `room`, `last_webhook_at`, and `permissions`. Room is null for P2P; permissions are null without active participation. |
| `reaction_counts` | Object keyed by supported reaction emoji, with integer totals including zero-valued totals. |
| Scheduling metadata | `series`, `occurrence_sequence`, `scheduled_start_at`, `scheduled_end_at`, `visible_at`, `cancelled_at`. These belong to the live scheduling system and can be null on event-created sessions; they are not replacements for event schedule fields. |

Live participant fields: integer `id`, user snapshot `user`, role enum `role`, Booleans `is_active`, `is_muted`, `media_connected`, `microphone_published`, `camera_published`, and timestamp `joined_at`.

Permission fields are Booleans: `can_subscribe`, `can_publish_microphone`, `can_publish_screen_share`, `can_publish_camera`, `can_publish_data`, and `room_admin`. Current policy permits listening for active participants, microphone for hosts/co-hosts/speakers unless moderator-muted, and event screen sharing for hosts/co-hosts. Camera, data publication, and room-admin privileges are false. A co-host live role does not add the user to event hosts.

### 5.2 Media credentials and diagnostics

**POST `sessions/{session_id}/media/credentials`** — no body; caller must already be an active participant admitted through the event flow. Success is 201, message `Media credentials issued.`; `data` contains `correlation_id`, `server_url`, `room`, `identity`, `token`, `expires_at`, and `permissions` as above. Connect using these exact values. Request fresh credentials when needed; use `expires_at` rather than assuming a fixed lifetime. Default token lifetime is 900 seconds and credential throttle is 10 requests/minute per user/session, both configurable.

| Status | Credential failure codes / conditions |
| --- | --- |
| 404 | Live session not found. |
| 400 | `live_session_ended`, `live_session_not_started`, `media_provider_not_livekit`. |
| 403 | `live_session_blocked`, `not_a_participant`, `live_session_private`. |
| 409 | `media_configuration_invalid`: persisted identity or room does not match expected configuration. |
| 503 | `media_service_unavailable`: disabled/not-ready provider or credential generation failure. |
| 429 | Request throttle; respect response retry information and back off. |

**GET `sessions/{session_id}/media/status`** — no body; active live host/co-host only. Success 200, message `Media status retrieved successfully.` Data fields: `correlation_id`, `provider`, `media_status`, `room`, `room_sid`, `media_started_at`, `media_ended_at`, `last_webhook_at`, `appscombo_active_count`, `media_connected_count`, `pending_operations`, `failed_operations`, and `synchronization_result`. Synchronization result is `not_applicable`, `failed`, `pending`, or `synchronized`. Missing session returns 404, unauthorized diagnostics returns 403. Application participation and actual media connection are separate counts.

### 5.3 Live participants, comments, and reactions

| Operation | Payload / query | Success response under `data` | Conditions / failures |
| --- | --- | --- | --- |
| GET `sessions/{session_id}/participants` | Standard pagination; optional `role`: `host`, `co_host`, `speaker`, `listener`. | 200, paginated live participants, oldest joined first. | Private access requires session host, active participant, or a nondeclined session invite. Invalid role 400; absent session 404; no access 403. |
| POST `sessions/{session_id}/comments` | Required nonblank `content`, max 1,000 characters. | 201, `comment` object with integer `id`, user snapshot `user`, `content`, and `created_at`. | Session must be live and requester active; otherwise 400 or 403. Absent session 404; invalid content 400. Publishes `live:comment`. |
| GET `sessions/{session_id}/comments/list` | Standard pagination. | 200, paginated live comments, oldest created first. | Same private read-access rule as live participants; no access 403; absent session 404. |
| POST `sessions/{session_id}/reactions` | Required `emoji`: 👍, ❤️, 😂, 😮, 👏, or 🔥. | 200, `session_id` plus `reaction` containing UUID `event_id`, `emoji`, user snapshot, integer `emoji_count`, and `created_at`. | Live active participant required; invalid emoji/not live 400; inactive 403; absent session 404; configurable default throttle 30/minute per user/session yields 429. Publishes `live:reaction`. |

The reaction's `event_id` is a unique reaction emission ID, not an event UUID. Deduplicate reactions by that ID and comments by their own comment ID. Event comments use `message` and UUID IDs; live comments use `content` and integer IDs. The two stores are independent and are not automatically synchronized. Use live comments for a live event room, including hosts who have no event guest row.

### 5.4 Optional speaker and moderation controls

These routes operate on live participant roles, not event host/guest records. Every route requires authentication; absent sessions return 404. User path parameters are numeric `pkid`. No body is needed unless specified.

| Method and live-relative path | Request | Success | Access and conditions |
| --- | --- | --- | --- |
| POST `sessions/{session_id}/mic-requests` | No body. | 201 with `mic_request`. | Live active listener. Host/co-host/speaker, duplicate pending request, or not-live/inactive state returns 400. Resubmission after rejection resets the existing request to pending. |
| GET `sessions/{session_id}/mic-requests/me` | No body. | 200 with mic request fields directly in `data`, or empty `data` if none. | Current implementation checks authentication and session existence, not active participation. |
| GET `sessions/{session_id}/mic-requests/list` | No body. | 200 with `count` and `mic_requests`, pending requests oldest first; no pagination. | Active live host/co-host; otherwise 403. |
| POST `sessions/{session_id}/mic-requests/{user_id}/approve` | No body. | 200 with `mic_request` and updated `participant`, or 202 while media synchronization is pending. | Active host/co-host; target must have pending request (404 otherwise) and active participation (400 otherwise). Promotes to speaker. |
| POST `sessions/{session_id}/mic-requests/{user_id}/revoke` | No body. | 200 with updated `participant`, or 202 pending synchronization. | Active host/co-host; target must be an active speaker, otherwise 400. Demotes to listener and marks request rejected. |
| POST `sessions/{session_id}/co-hosts` | Required integer `user_id`. | 200 with updated `participant`, or 202 pending synchronization. | Session's original host only; other callers 403. Ended session, self-target, inactive target, or existing co-host returns 400. |
| DELETE `sessions/{session_id}/co-hosts/{user_id}` | No body. | 200 with updated `participant`, or 202 pending synchronization. | Original session host only. Ended session, inactive target, or target not a co-host returns 400. Demotes to listener. |
| PATCH `sessions/{session_id}/participants/{user_id}/mute` | Required JSON Boolean `is_muted`. | 200 with updated `participant`, or 202 pending synchronization. | Self or active host/co-host. Ended session/invalid value 400; inactive target 404; unauthorized 403. Moderator-unmute only releases an existing moderator mute and leaves the user locally muted. Unsupported remote unmute returns `remote_unmute_not_allowed` with 400/403. |
| POST `sessions/{session_id}/participants/{user_id}/kick` | No body. | 200 or 202 with synchronization fields when applicable. | Active host/co-host; target active (404 otherwise). Ended session, self-target, or targeting original host returns 400. Deactivates live participation; does not itself delete event guest membership. |
| POST `sessions/{session_id}/participants/{user_id}/block` | No body. | 201 or 202 with synchronization fields when applicable. | Active host/co-host; target exists (404 otherwise), is not self/original host, and is not already blocked (400 otherwise). Ended session 400. Blocks and deactivates active live participation. |
| DELETE `sessions/{session_id}/participants/{user_id}/unblock` | No body. | 200, empty `data`, message `User unblocked successfully.` | Active host/co-host, otherwise 403. Missing block returns 404. Does not rejoin the user. |

Mic request fields: integer `id`, user snapshot `user`, `status` (`pending`, `approved`, `rejected`), `requested_at`, and nullable `resolved_at`.

For moderation operations with provider work, `synchronization_status` may be `synchronized`, `pending`, or `failed`; no operations means that field can be omitted. Failed provider synchronization returns 503 with code `media_service_unavailable`, even though database role/mute changes may already have occurred. Refetch actual state before retrying. Pending responses can use HTTP 202. Releasing a moderator mute does not grant permission for the browser to activate a remote microphone.

## 6. Realtime contract

Connect Socket.IO to the configured socket origin's `/live` namespace using the normal access token in handshake `auth.token`. The server also accepts a token query parameter, but use handshake auth in new web work. JWT authentication failures reject the socket connection.

### 6.1 Client emissions and acknowledgments

| Emission | Payload fields | Response / condition |
| --- | --- | --- |
| `live:join` | Required positive integer `sessionId`. | Server authorizes against backend live-session details. Success acknowledgment contains `ok=true` and `sessionId`, plus `live:joined` with `sessionId`. Failure acknowledgment contains `ok=false`, `sessionId`, and `code=live_room_unauthorized`, plus `live:error` with `event`, `code`, and `sessionId`. |
| `live:leave` | `sessionId`. | Removes socket room subscription and emits `live:left` with `sessionId`. Does not call event leave or change database membership. |

Wait for event admission before joining the socket room. A socket connection alone does not authorize any session. On reconnect, revalidate membership and rejoin the authorized room. Socket disconnect does not invoke event leave. Socket payloads are raw events, not HTTP envelopes.

### 6.2 Server events

The common session key in backend broadcasts is `session_id`; client join payloads use `sessionId`. A user snapshot contains UUID `id`, numeric `pkid`, `username`, `first_name`, `last_name`, and `profile_photo`.

| Event | Payload fields | Web behavior |
| --- | --- | --- |
| `event:live-session:available` | Event UUID `event_id`, integer `session_id`, `phase` (`created`, `started`, `ended`), `status`, `is_live`, and `recipient_ids`. | Sent to personal `/live` user rooms for event hosts and users with event guest records, including offline guest records. Refresh matching details/My events. It is not a global nearby discovery notification. |
| `live:session:started` | `session_id`, `title`, `host`, `started_at`. | Refresh live state and permissions. |
| `live:session:ended` | `session_id`, `ended_at`. | Disable publish/comment/reaction controls and disconnect room media. |
| `live:session:cancelled` | `session_id`, `cancelled_at`, `reason`. | Show cancellation and reconcile details. |
| `live:participant:joined` | `session_id`, `user`, `role`, `participant_count`. | Reconcile active participants/count. |
| `live:participant:left` | `session_id`, `user`, `participant_count`. | Remove/reconcile participant/count. |
| `live:comment` | `session_id`, `comment` containing `id`, `user`, `content`, `created_at`. | Merge once by live comment ID; HTTP POST and socket can deliver the same record. |
| `live:reaction` | `session_id`, `reaction` schema from section 5.3. | Deduplicate by reaction emission ID and use server `emoji_count` as authoritative. |
| `live:mic:requested`, `live:mic:approved`, `live:mic:revoked` | `session_id`, `user`. | Refetch request/role/permissions; update publishing controls after synchronization. |
| `live:co-host:added`, `live:co-host:removed` | `session_id`, `user`. | Refetch live role/permissions. Do not change event host membership. |
| `live:participant:muted` | `session_id`, `user`, `is_muted`, nullable `muted_by`, `mute_enforced`, optional `released_by`. | Apply mute restrictions; local user action is still required to activate their microphone after release. |
| `live:participant:kicked` | `session_id`, `user`, `kicked_by`, `participant_count`. | Reconcile roster; affected user disconnects media and loses room controls. |
| `live:participant:blocked` | `session_id`, `user`, `blocked_by`. | Affected user disconnects and must not automatically rejoin. Refetch counts/roster. |
| `live:error` | `event`, `code`, sometimes `sessionId`. | Surface join/authorization failure and reconcile rather than showing a connected state. |

Legacy emissions `live:signal`, `live:ice`, and `live:speaking` are feature-gated by the socket server. When disabled they return `live:error` with `deprecated_transport_disabled`. Use the media provider's speaker/track events for LiveKit and do not assume legacy signaling is enabled.

## 7. Upload acceptance

Each event document file must be at most **10,485,760 bytes**. Allowed MIME types are listed here exactly as configured; cover-image acceptance is narrower and remains JPEG/PNG at 2 MiB.

| Category | Allowed document MIME types |
| --- | --- |
| Video | `video/mp4`, `video/x-msvideo`, `video/quicktime`, `video/x-ms-wmv`, `video/x-matroska`, `video/webm`, `video/x-flv`. |
| Audio | `audio/mpeg`, `audio/wav`, `audio/aac`, `audio/ogg`, `audio/webm`, `audio/flac`, `audio/x-ms-wma`. |
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/bmp`, `image/webp`, `image/svg+xml`. |
| Documents | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `application/rtf`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/vnd.oasis.opendocument.text`. |

Validate size/type before submitting and handle the backend's authoritative 400 response. File extension alone does not determine acceptance. Uploaded files receive generated storage names, so use returned file URLs rather than constructing paths from the original filename. The API does not document a maximum collection length or total combined upload size; infrastructure may impose additional request limits.

## 8. Frontend web implementation guide

### 8.1 Discovery and location state

1. Begin with a location-pending state and no discovery results. Do not start an unfiltered list/search request while resolving location.
2. Acquire current browser geolocation over a secure origin and validate finite latitude/longitude, including zero coordinates. A denied permission, unsupported geolocation, timeout, disabled service, or other positioning failure leaves discovery empty with a clear recovery action.
3. When browser permission is blocked, explain how to enable location in browser/site settings. Web cannot assume the native app's settings-opening action exists. A retry must request/recheck actual location, not switch discovery to a broader endpoint.
4. Fetch nearby with latitude, longitude, and explicit radius 25. Optionally resolve a display address through `my-location`; address lookup failure must not discard valid GPS coordinates or block nearby loading.
5. Show a current-location label, the distance scope, and a refresh action. Remove the all-locations and clear-filter options. On refresh, hide previous-location results while the new location is unresolved.
6. Recheck location on screen return and browser/tab foreground where appropriate. Ignore late location/address results from an abandoned screen or superseded request. If access was revoked, clear discovery results before showing the location-required state.
7. Keep states distinct: finding location, location required/unavailable, loading nearby, request failed, loaded empty, and loaded results. A network failure does not authorize global fallback.

### 8.2 Nearby pagination and search

Normalize both nearby response shapes: direct empty `data.events`, and paginated `data.results.events`. Keep pagination metadata separately. Deduplicate by event UUID while retaining nearest-first server order.

Nearby discovery search must stay inside the nearby result set. Filter names, addresses, and relevant displayed tags locally; there is no supported server search term on the nearby endpoint. For a complete nearby search, fetch all remaining nearby pages within the same coordinate/radius scope before declaring no matches. If only loaded pages are searched, explicitly describe it as searching loaded results and continue offering pagination. Do not silently call the global search endpoint for more matches.

Do not stop solely because a nearby page has zero visible events: expired/orphan locations can leave empty pages before a non-null next link. Reset pagination and search result accumulation when the location or signed-in account changes. Do not reuse results from a different coordinate/radius query as placeholder data.

### 8.3 My events

Use `list` with `filter=my_events`; for text search use `search` with `filter=my_events` and trimmed `q`. Location permission is not a prerequisite for this management tab. Keep its data/cache separate from nearby discovery.

Hosts and all recorded guests qualify, including offline guests and past events. RSVP-only events do not qualify. A guest leaving stays on this list because the guest row remains. Do not describe My events as an exclusively upcoming or currently joined list.

### 8.4 Details, access, and RSVP

Open details by event UUID. Normalize full and preview responses; support flat preview `address`/`hashtags` and full `event_location`/`event_hashtags`. Determine event-host controls from the host UUID or numeric `pkid` when full data is available; server authorization remains authoritative.

For preview-only access, display schedule, privacy/lock indicators, and RSVP without assuming resources are accessible. Request resources only when allowed; handle a 403 as an access state. Full response omission is different from an empty resource array.

RSVP is independent of live admission. An unlocked scheduled event can show details and RSVP while not-live; do not send join until it is live. A locked event requires its passcode at admission; entering a passcode is not a separate preview-unlock API. Do not store passcodes in URLs or persistent caches.

### 8.5 Event creation and management

Collect title, complete schedule, location, privacy/lock setting, optional resources, and uploads. Preserve passcodes as strings and validate four ASCII digits. Locked privacy becomes private. Validate complete schedules, coordinate pairs, upload limits, and clock-time ordering before submission.

Send multipart only for files. Use contiguous indexed document fields, preserve resource collections by omission, and explain that replacing a collection replaces all of its entries. Avoid changing document collections during metadata-only edits.

After create/update, invalidate relevant nearby, My events, details, and resources. Do not expect an existing attached session's copied title/tags to change automatically. Use explicit live lifecycle endpoints for broadcast state. End a broadcast before deletion because delete itself has no room-cleanup transition.

### 8.6 Host broadcast flow

1. Load full event details as an event host and retrieve/create its attached session as needed.
2. Inspect the returned provider and status. A waiting room can be started; an ended attached session cannot be restarted through the current lifecycle.
3. Call start once, disable duplicate actions while pending, and reconcile returned event/session state. Do not set `is_live` through ordinary event editing.
4. For LiveKit, confirm readiness and request credentials as an active live participant. Connect using returned identity, room, server URL, token, and publication permissions. Subscribe to the authorized socket room separately.
5. Use explicit end when the host intends to stop the broadcast. Apply the returned state immediately and reconcile pending provider cleanup. Closing the local web screen is a separate action from ending for everyone.

Event host and live host are separate memberships. The event bridge initially creates only one live host. Additional event hosts may need the event join path to create active live participation once the event is live; do not assume event-host membership grants microphone/admin privileges in the returned media permissions.

### 8.7 Attendee broadcast flow

1. Verify the event has not ended and is live; if locked, collect the passcode.
2. Call event join and accept both 200 and 201 as successful admission. Preserve the returned session ID; if it or the socket descriptor is null, do not fabricate a media room or credentials.
3. Retrieve session details when needed, join the authorized `/live` socket room, and handle acknowledgment failures.
4. For provider LiveKit, request media credentials and connect as allowed. Listener accounts subscribe without requesting microphone/camera permissions. Publishing or screen sharing requires both server permissions and browser user consent.
5. Use supporting live comments/reactions for live-room interaction. Refetch canonical participants and permissions after role/moderation events.
6. On explicit leave, call event leave, unsubscribe the socket room, and disconnect media. Local socket leave/disconnect alone does not persist event departure. Make cleanup resilient to failed network requests and reconcile on the next visit.

### 8.8 State, errors, and accessibility

Scope caches by signed-in account and endpoint purpose, with location/radius/page in nearby keys and query/page in My events keys. Clear user-scoped data on account change/logout. Ignore stale responses after account, location, or route changes.

Invalidate affected details, lists, guests, RSVP, resources, comments, and live-session state after successful mutations. Prefer canonical server responses/refetches over inferring access from UI state. Keep event guest membership, online application participation, and provider media connection separate.

Refresh credentials/reconnect on confirmed authentication expiry through the app's existing auth flow. Show incorrect passcode separately from login expiry. For 404, distinguish deleted event, missing live session, missing guest, invalid page, and unavailable comment permission using endpoint context. Retry transient location/network/provider failures with backoff; do not blindly repeat start/end or moderation mutations after an uncertain result.

Provide keyboard-accessible forms and controls, visible focus states, labelled search/passcode/upload fields, readable inline validation, and announced loading/access errors. Preserve form input after recoverable validation failures. Do not display connection success until admission and connection acknowledgments have succeeded.

## 9. Current implementation limits and release conditions

Account for these API limitations when implementing the web interface.

| Area | Current behavior | Web consequence / release condition |
| --- | --- | --- |
| Nearby enforcement | Global list/search remain available; radius has no fixed server maximum; details/join have no geofence. | Follow the nearby-only UI policy. Backend work is required for an actual server-enforced distance restriction. |
| Restricted discovery fields | Nearby returns full event objects without the details/resources membership gate. It can include restricted links/documents; list/search also expose hosts/guests for restricted events. | Do not use discovery fields as proof of access. Fetch gated details/resources for room UI. Confidentiality requires backend response filtering; hiding fields in web does not prevent API disclosure. |
| Private/friends semantics | Nonpublic details/resources/comments are membership-gated, but unlocked nonpublic join has no invitation/friend relationship gate. | Do not advertise invitation-only or friends-only admission as fully enforced by current event join. |
| Web LiveKit selection | Provider selection recognizes only eligible iOS/Android platform/version combinations. `X-Platform=web` selects P2P, even when LiveKit is enabled. Existing attached sessions retain their provider. | Web may consume an eligible mobile-created LiveKit session, subject to participant admission. Web-hosted LiveKit creation needs backend web-platform selection support; do not spoof a mobile platform to bypass it. |
| Legacy P2P | Socket signaling can be disabled independently. | A P2P session does not guarantee web media is usable. Confirm deployed legacy support or gate unavailable media controls until web LiveKit creation is supported. |
| Multiple event hosts | Event hosts are not automatically live hosts/co-hosts. | Use returned live role/permissions; event lifecycle controls and live moderation controls need separate checks. |
| Schedule validation/timezone | No event timezone field; pairwise clock validation rejects some overnight events and partial updates can bypass merged-schedule checks. | Establish deployed timezone and validate the complete edited schedule in web. Do not promise arbitrary overnight scheduling without backend changes. |
| Nearby pagination/search | Counts can include expired/orphan locations; no nearby search query. Global search may miss address-only matches. | Continue by next links, search the full nearby scope for complete results, and do not substitute unrestricted search. |
| Guest operations | Add does not create live participation; remove does not revoke it. Event guest membership and live moderation are separate. | Do not treat guest add/remove as media connect/disconnect. Reconcile both records and use live moderation for running-room removal. |
| Event comments | Host status alone cannot post event comments; create returns only message and emits no live socket comment. | Use the live-comment path in a broadcast; refetch event comments for ordinary event-comment creation. |
| Deletion | Event delete does not explicitly end the attached live session/provider room. | End first and verify state before deleting a running event. |
| Reverse geocoding | Address service is an external dependency; some missing preferences/provider failures are not normalized. | Keep address labels optional for discovery and retain valid GPS coordinates. Show recoverable create/update failures without assuming every error has the JSON envelope. |

### 9.1 Web acceptance scenarios

- First visit, denied permission, permanently blocked permission, GPS timeout, unavailable GPS, and revoked permission show no global discovery events.
- Valid coordinates, including zeros, produce only nearby calls with explicit radius 25; display address failure does not change those coordinates or broaden the query.
- Discovery search remains inside nearby pages; pagination handles empty intermediate pages and both empty/nonempty response shapes.
- My events and its search always send the membership filter and work without location permission.
- Restricted detail previews render without assuming missing hosts/resources/session details exist; passcode errors preserve input and do not log the user out.
- Create/edit sends seconds in time fields, valid coordinate pairs and file fields, preserves omitted resources, and treats empty arrays as explicit replacement/removal.
- RSVP, event join, live participation, socket room authorization, and media connection remain distinct states.
- Host start/end duplicate actions and ended-session restart errors are handled without inventing a new session or repeatedly toggling state.
- Web-created P2P versus mobile-created LiveKit sessions show accurate media availability based on the deployed provider and socket configuration.
- Comment/reaction HTTP responses and socket events deduplicate correctly; moderation changes update permissions and disconnect the affected viewer when required.
- Leave, delete, account changes, stale location responses, socket reconnection, and provider failures clear/reconcile the appropriate screen state.
