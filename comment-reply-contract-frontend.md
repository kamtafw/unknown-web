# Unified Social Content API Contract

## Overview

Every v1 social-content read returns the same polymorphic object. A post, top-level
comment, and reply have exactly the same keys. `kind`, `post_id`, and `parent_id`
identify the object's role.

- Post: `kind = "post"`, `post_id = null`, `parent_id = null`
- Top-level comment: `kind = "comment"`, `post_id = <root post UUID>`, `parent_id = null`
- Reply: `kind = "reply"`, `post_id = <root post UUID>`, `parent_id = <direct parent UUID>`

Replies are not recursively embedded. Clients load direct children through the
paginated comment and reply endpoints.

## Canonical content object

```json
{
  "id": "5d038982-278a-471a-a7ed-ed51ce9a14bc",
  "kind": "comment",
  "post_id": "edc45114-c3fe-454b-80ee-556c08f0e180",
  "parent_id": null,
  "user": {
    "id": "ae931055-d07b-4ea4-b038-1729290e77d5",
    "username": "ada",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "profile_photo": "https://example.com/profile.jpg"
  },
  "message": "Text",
  "media": ["https://example.com/image.jpg"],
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792,
    "address": "Lagos"
  },
  "hashtags": ["#example"],
  "metrics": {
    "likes": 0,
    "replies": 0,
    "reposts": 0,
    "reactions": 0,
    "shares": 0,
    "bookmarks": 0,
    "views": 0
  },
  "viewer": {
    "liked": false,
    "reposted": false,
    "bookmarked": false,
    "shared": false
  },
  "permissions": {
    "visibility": "EVERYONE",
    "reply_policy": "EVERYONE",
    "can_view": true,
    "can_reply": true
  },
  "flags": {
    "pinned": false,
    "repost": false,
    "shared": false
  },
  "original": null,
  "created_at": "2026-08-07T12:00:00Z",
  "updated_at": "2026-08-07T12:00:00Z"
}
```

The object never exposes internal integer keys or private user fields such as
`pkid`, `email`, or `phone_number`.

### Metrics and viewer state

`metrics.replies` counts direct children only:

- for a post, direct top-level comments;
- for a comment or reply, direct child replies.

Comment and reply bookmarks and views are unsupported and therefore always return
zero. Their `viewer.bookmarked` value is always `false`. Other metrics and viewer
flags are derived from their corresponding interaction records.

### Permissions

Posts report their own visibility and reply policies. Comments and replies inherit
both policies from their root post. `can_view` and `can_reply` are evaluated for the
current viewer. Direct reads of a hidden post, comment, or reply return `404`.

Updating a comment or reply also requires its root post to remain visible to the
owner of that comment or reply. Deletion is an ownership operation and remains
available even if the root post's visibility changes later. This ensures users can
always remove content they authored without allowing hidden content to be read or
edited.

### Reposts

Ordinary content returns `original = null`. A repost returns one complete canonical
post, comment, or reply in `original`. That nested object's own `original` is always
`null`, so the representation cannot recurse.

## Read endpoint mapping

The following endpoints return canonical content objects either directly or in the
existing pagination envelope's `results` array:

- `GET /api/v1/socials/posts/list`
- `GET /api/v1/socials/posts/feed`
- `GET /api/v1/socials/posts/feed/search`
- `GET /api/v1/socials/posts/following-feed`
- `GET /api/v1/socials/post/{post_uuid}/get`
- `GET /api/v1/socials/post/pinned-post/get`
- `GET /api/v1/socials/post/bookmark/list`
- `GET /api/v1/socials/post/repost/list`
- `GET /api/v1/socials/post/comment/list/{post_uuid}`
- `GET /api/v1/socials/post/comments/{comment_uuid}`
- `GET /api/v1/socials/post/comments/{comment_uuid}/details`
- `GET /api/v1/socials/post/comments/{comment_uuid}/replies`
- `GET /api/v1/socials/user/my_posts`
- `GET /api/v1/socials/user/my_comments`
- `GET /api/v1/socials/user-handle/{user_uuid}/posts`
- `GET /api/v1/socials/user-handle/{user_uuid}/reposts`
- `GET /api/v1/socials/user-handle/{user_uuid}/replies`
- `GET /api/v1/socials/user-handle/{user_uuid}/liked-posts`
- `GET /api/v1/socials/user-handle/{user_uuid}/posts-with-media`


## Write compatibility and responses

All post, comment, and reply create/update requests, plus repost creation requests,
use the same canonical content and media field names:

- `content`: the text body;
- `medial_urls`: a list of externally hosted media URLs.

`medial_urls` is the intentional public request-field spelling. Read responses do
not mirror these write names: the canonical content object continues to return its
text as `message` and its media URL list as `media`.

The remaining common optional write fields are `location`, `hashtags`, and
`use_live_location` where the endpoint supports live location. A custom `location`
and `use_live_location = true` cannot be supplied together.

### Create and update request examples

Create a post:

```json
{
  "content": "A new post",
  "medial_urls": ["https://example.com/post.jpg"],
  "hashtags": ["example"],
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "who_can_see": "EVERYONE",
  "who_can_reply": "EVERYONE"
}
```

Create a top-level comment:

```json
{
  "post_id": "edc45114-c3fe-454b-80ee-556c08f0e180",
  "content": "A comment",
  "medial_urls": ["https://example.com/comment.jpg"]
}
```

Create a reply. `parent_id` identifies the direct parent; `post_id` may be omitted
because the server derives the root post from that parent:

```json
{
  "parent_id": "5d038982-278a-471a-a7ed-ed51ce9a14bc",
  "content": "A direct reply",
  "medial_urls": []
}
```

Update any post, comment, or reply using the same body names:

```json
{
  "content": "Edited text",
  "medial_urls": ["https://example.com/replacement.jpg"]
}
```

PATCH fields are independent. Omitting `content`, `medial_urls`, `location`, or
`hashtags` preserves the existing value. Sending `medial_urls: []` or
`medial_urls: null` removes all media; the equivalent empty or null value removes
locations and hashtags where supported.

Create a repost by supplying exactly one original relationship:

```json
{
  "original_post": "edc45114-c3fe-454b-80ee-556c08f0e180",
  "content": "Optional quote text",
  "medial_urls": []
}
```

Use `original_comment` instead of `original_post` to repost a comment or reply.

### Legacy write aliases

Existing v1 write names remain temporarily accepted for compatibility:

- post and repost text: `content_text`;
- comment and reply text: `message`;
- post and repost media: `media_urls`;
- comment and reply media: `media` or `media_urls`;
- comment relationships: integer `post` and `parent_comment`.

Clients must send either the canonical field or one legacy alias, never both in
the same request. New integrations should use `content`, `medial_urls`, UUID
`post_id`, and UUID `parent_id` exclusively.

The server derives a reply's post from its direct parent and rejects a mismatched
`post_id`. Relationship IDs cannot be changed by an update.

Post, comment, reply, and repost create/update responses return the saved object
through this canonical serializer. The standard response renderer and pagination
envelopes are unchanged.

### Comment and reply deletion

`DELETE /api/v1/socials/post/comment/{comment_uuid}` deletes a comment or reply
owned by the authenticated user. Ownership is checked before deletion. Current
visibility of the root post is intentionally not required.

Deleting a parent comment deletes its descendant replies through the model's
cascading self-reference. Deleting a post likewise deletes all comments and replies
attached to it.

## User-feed selection and ranking

`GET /api/v1/socials/posts/feed` accepts only `sort=relevance` or `sort=newest`.
The default is `relevance`. `page_size` and the pagination alias `limit` must be an
integer from 1 through 100; invalid sort modes and unbounded sizes return `400`.

The relevance feed uses these candidate sources:

- the viewer's posts, accepted connections, and accounts the viewer follows;
- posts that contain a whole-handle, case-insensitive mention of the viewer;
- posts whose normalized hashtag exactly matches a normalized viewer interest;
- a controlled discovery pool of public posts from outside that relationship
  graph, plus posts explicitly visible to the viewer from accounts following the
  viewer.

An account following the viewer is not treated as an account the viewer follows.
Its otherwise eligible content can still be selected through discovery, but it
receives no follow relationship weight. Topic matching strips a leading `#`,
normalizes case, and compares complete topics, so an interest in `art` does not
match `party`. Likewise, `@ada` does not match `@adaline`.

Candidate work is bounded to at most 2,000 posts. Slots are selected separately
from relationship/topic candidates and discovery candidates so a large network
cannot eliminate discovery. Each source mixes recent posts, popular posts from a
30-day window, and a deterministic exploratory sample. The sample is stable for a
cache window, so pagination does not reshuffle while still allowing a later window
to explore different public content. A user with no follows, connections, or
interests therefore receives eligible public discovery content instead of an empty
feed.
