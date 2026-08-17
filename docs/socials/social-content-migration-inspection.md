# Social Content Migration — Inspection & Affirmation Record

*Convention note: this repository documents subsystems under `docs/<domain>/` (see `docs/messenger/`). This file follows that pattern at `docs/social/`. It is the migration record, not the final reference — see `docs/social/social-content-architecture.md` (produced after implementation) for how the system actually works once this is done.*

*Evidence discipline: every claim below is grounded in something actually read in the repository (file + line references given) or explicitly marked as coming from the contract you supplied rather than observed code. Nothing here is inferred and left unmarked.*

---

## 1. Migration Objective

The frontend currently represents Posts, Comments, and Replies as **three partially-independent shapes** (`Post`, `Comment`, `UserReplyItem`, plus `OriginalPost`/`OriginalComment` for reposts), identified inconsistently by either an integer `pkid` or a UUID `id` depending on which code path touches them.

This migration moves the frontend to a single canonical `SocialContent` model where:

- `kind: "post" | "comment" | "reply"` determines role,
- `id` (UUID) is the sole identity,
- `post_id` identifies the root conversation,
- `parent_id` identifies the immediate parent,

and where comments/replies are no longer capped at one level of nesting in the UI.

---

## 2. Current Architecture Snapshot

*(What exists today. Not the target — see §3 onward.)*

### 2.1 Post

- `types/api.ts:205-230` — `Post`. Dual identity: `pkid: number` (primary key for routing, query keys, `Number()` coercions everywhere) and `id: string` (UUID, used for engagement cache patching only).
- `lib/api.ts:322-419` (`socialApi`) — `getPostDetail(pkid)`, `getPostComments(pkid, page)`, `updatePost(pkid, payload)`, `deletePost(pkid)` are **pkid-keyed**. `likePost`, `bookmarkPost`, `togglePinnedPost`, `getPostStats`, `getCommentReplies` are already **id-keyed** (string UUID). This split is not consistent within the same file.
- `app/api/socials/post/[pkid]/route.ts` — GET/PATCH/DELETE, route param `pkid: number`, proxies to `${DJANGO_API_URL}/socials/post/${pkid}/get` (GET) and `.../socials/post/${pkid}` (PATCH/DELETE).
- `app/api/socials/post-comments/[pkid]/route.ts` — proxies to `.../socials/post/comment/list/${pkid}?page=${page}`.
- `app/(dashboard)/posts/[pkid]/page.tsx` — route param `pkid: number`, passes `Number(pkid)` into `PostDetailView` and `PostAccountsPanel`.

### 2.2 Comment

- `types/api.ts:297-314` — `Comment`. `pkid: number`, `post: number` ("pkid of the parent Post this comment belongs to" — literal comment in source), `parent_comment: number | null`, `replies_count`.
- `hooks/use-post-detail.ts:13-16` — `commentKeys.list(pkid)` (top-level comments of a post, paginated `useInfiniteQuery`) and `commentKeys.replies(commentId)` (direct replies of **one specific comment**, single-page `useQuery`, `commentId` already a UUID string).
- `components/dashboard/post-detail.tsx:207-388` — `CommentRow` (top-level comment, has reply button + "view replies" toggle) → `RepliesSection` (`useCommentReplies(commentId)`) → `ReplyRow` (**no reply button, no nested "view replies," like-only**). `ReplyModal` (`components/dashboard/reply-modal.tsx`) is invoked exclusively from `CommentRow` (`post-detail.tsx:313`), never from `ReplyRow`.
- **Depth is hard-capped at 1.** A reply cannot itself be replied to anywhere in the current UI, even though the data model (`parent_comment: number | null`) has no such limit.
- `components/dashboard/reply-modal.tsx:180-187` — reply payload: `post: comment.post, parent_comment: comment.pkid`. Correctly uses the passed-in `comment`'s own id as the direct parent (not hard-coded to a root comment) — this pattern is right, but it has only ever been exercised with a top-level comment as input, never with a reply.
- No comment/reply **edit** or **delete** exists anywhere in the frontend. Confirmed by direct search: no `deleteComment`/`updateComment` hook, no matching route handler, no `DELETE`/`PATCH` method on any `app/api/socials/*comment*` route. Only `app/api/socials/post/[pkid]/route.ts` (Post) has PATCH/DELETE.

### 2.3 "Reply" — a third representation

- `types/api.ts:642-667` — `UserReplyItem` (`post: Post` embedded in full, `parent_comment: UserReplyParentComment` embedded snapshot of the immediate parent's author/message/created_at), used **only** by the profile "Replies" tab.
- `hooks/use-profile-feeds.ts:71-88` (`useUserReplies`) → `app/api/socials/user-handle/[id]/replies/route.ts` → `${DJANGO_API_URL}/socials/user-handle/${id}/replies`.
- `components/dashboard/user-profile-view.tsx:172-287` (`ReplyThreadCard`, `RepliesTabPanel`) render this shape directly, including reading `reply.parent_comment.message` to show what was replied to.
- This is the same underlying entity as `Comment` (a reply *is* a comment/reply row on the backend) surfaced through a third, non-overlapping TypeScript shape.

### 2.4 Reposts

- `types/api.ts:205-230` — `Post.reposted_object_type: "Comment" | "Post" | null` is the discriminator; `Post.original_post: OriginalPost | OriginalComment | null` is the nested payload.
- `lib/post-helpers.ts:3-7` (`isOriginalComment`) — type guard used throughout (`post-card.tsx`, `post-detail.tsx`, `use-post-detail.ts`, `use-comment.ts`, `post-engagement.ts`) to disambiguate the union.
- `types/api.ts:177-189` — `OriginalComment.replies: OriginalComment[]` — **fully recursively typed**, with the comment "The API embeds replies in full on this shape." The only actual read of this field anywhere in the repo is `original.replies.length` in `components/dashboard/post-card.tsx:93` (`normaliseCommentOriginal`), used purely as a reply count. `components/dashboard/quote-comment-modal.tsx:51-65` (`asOriginalComment`) fabricates `replies: []` client-side to satisfy the type when constructing a quote preview — i.e. the frontend itself treats this field as decorative, never as real recursive data.
- `lib/post-helpers.ts:17-26` (`isUnquotedPostRepost`) only resolves engagement for **bare reposts of a Post** (`reposted_object_type === "Post"`); a bare repost of a Comment does not get the same "resolve to the underlying engagement entity" treatment.
- `my_repost_pkid: number | null` (`types/api.ts:170,218`) — a **third** pkid concept: identifies *my own* repost object (a Post) so "Undo repost" can target it via `deletePost(pkid)`. `lib/post-helpers.ts:13-15` (`isSettledRepostPkid`) guards this against the temporary negative sentinel used during the optimistic window in `hooks/use-repost.ts:63`.

### 2.5 Cache / engagement patching

- Two independent systems for the same job: `lib/post-engagement.ts` (`patchEngagementEverywhere`, `findEngagementEntityAnywhere`, dual `id`/`pkid` matcher) for Posts, and `lib/comment-engagement.ts` (`patchCommentEverywhere`, `findComment`) for Comments. Neither is aware of the other; a like on a comment and a like on a post are patched through entirely separate code paths with duplicated logic.
- Query keys observed: `feedKeys.forYou/following/bookmarks` (`hooks/use-feed.ts:5-9`), `postDetailKeys.detail(pkid)` and `commentKeys.list(pkid)`/`commentKeys.replies(commentId)` (`hooks/use-post-detail.ts:9-16`), `profileFeedKeys.posts/reposts/liked/media/replies(id)` (`hooks/use-profile-feeds.ts:5-11`).

### 2.6 Route / navigation surface (every `/posts/` construction site found)

| # | File : line | Expression |
|---|---|---|
| 1 | `post-card.tsx:219` | `` router.push(`/posts/${comment.post}?comment=${comment.id}`) `` — `comment.post` is the pkid int; `comment.id` (query param) is already UUID |
| 2 | `post-card.tsx:261` | `` router.push(`/posts/${post.pkid}`) `` |
| 3 | `post-card.tsx:624` | `` pathname.startsWith(`/posts/${post.pkid}`) `` (post-delete redirect guard) |
| 4 | `post-card.tsx:781` | `` router.push(`/posts/${displayPost.pkid}`) `` |
| 5 | `post-card.tsx:789` | `` router.push(`/posts/${displayPost.pkid}`) `` |
| 6 | `user-profile-view.tsx:195` | `` router.push(`/posts/${reply.post.pkid}`) `` |
| 7 | `user-profile-view.tsx:257` | `` router.push(`/posts/${reply.post.pkid}?comment=${reply.id}`) `` |
| — | `lib/nav-active.ts:9` | `pathname.startsWith("/posts/")` — prefix check only, **format-agnostic, no change needed** |

Note the `?comment=` query parameter is **already** the comment's UUID `id` everywhere it appears (`post-detail.tsx`'s `highlightCommentId` prop consumes it as a string) — the query-param side of this URL scheme is already UUID-clean; only the path segment (`pkid`) needs migrating.

### 2.7 `pkid` — full classification (every hit, repo-wide)

`pkid` is used for **two unrelated identities** in this codebase: social-content pkid (in scope) and **user/account pkid** (out of scope — author identity, `AuthorHoverCard`, follow/mute/block, profile links). Conflating these would be an error, so they are separated explicitly below.

**Social-content `pkid` — in scope for this migration:**

| Location | Field | Disposition |
|---|---|---|
| `types/api.ts:161` | `OriginalPost.pkid: number \| string` | MUST REMOVE |
| `types/api.ts:170` | `OriginalPost.my_repost_pkid?: number \| null` | MUST REPLACE → `my_repost_id: string \| null` |
| `types/api.ts:179` | `OriginalComment.pkid: number` | MUST REMOVE (type removed entirely, see §6) |
| `types/api.ts:181` | `OriginalComment.post: number` | MUST REPLACE → `post_id` |
| `types/api.ts:206` | `Post.pkid: number` | MUST REMOVE |
| `types/api.ts:218` | `Post.my_repost_pkid: number \| null` | MUST REPLACE → `my_repost_id` |
| `types/api.ts:285-295` | `PostCommentDetail` (whole interface) | **Dead code** — confirmed zero imports anywhere in repo. MUST REMOVE outright, not a migration concern. |
| `types/api.ts:299` | `Comment.pkid: number` | MUST REMOVE |
| `types/api.ts:301` | `Comment.post: number` | MUST REPLACE → `post_id` |
| `types/api.ts:303` | `Comment.parent_comment: number \| null` | MUST REPLACE → `parent_id: string \| null` |
| `types/api.ts:317,319` | `AddCommentPayload.post`, `.parent_comment` | MUST REPLACE → `post_id`, `parent_id` (payload also renames `message`→`content`, `media_urls`→`medial_urls` per contract — see §15) |
| `types/api.ts:342` | `RepostResponse.original_post.reposts[].pkid` | MUST REPLACE → `.id` |
| `types/api.ts:409` | `CreatePostResponse.data.pkid` | MUST REMOVE |
| `types/api.ts:603` | `UpdatePostResponseData.pkid` | MUST REMOVE |
| `types/api.ts:644,652` | `UserReplyParentComment.pkid`, `UserReplyItem.pkid` | MUST REMOVE (whole types removed, see §6) |
| `lib/api.ts:347,350,398,401` | `getPostDetail(pkid)`, `getPostComments(pkid,page)`, `updatePost(pkid,…)`, `deletePost(pkid)` | MUST REPLACE param → `id: string` |
| `app/api/socials/post/[pkid]/route.ts` | route param | MUST REPLACE → `[id]`, `id: string` |
| `app/api/socials/post-comments/[pkid]/route.ts` | route param | MUST REPLACE → `[id]`, `id: string` |
| `app/(dashboard)/posts/[pkid]/page.tsx` | route param + `Number(pkid)` | MUST REPLACE → `[id]`, no `Number()` coercion |
| `hooks/use-post-detail.ts` (all) | `postDetailKeys.detail(pkid)`, `commentKeys.list(pkid)`, `usePostDetail(pkid)`, `usePostComments(pkid)`, `Number(p.original_post.pkid) === pkid` | MUST REPLACE — id-keyed throughout |
| `hooks/use-comment.ts` (all) | `incrementCommentCount(old, pkid)`, `usePrependComment(pkid,…)`, `usePrependReply(id, pkid,…)` | MUST REPLACE |
| `hooks/use-post-actions.ts` (all) | `useUpdatePost`, `useDeletePost`, pkid↔id dual coercion (`typeof current.pkid === "number" ? … : Number(current.pkid)`) | MUST REPLACE — this dual-coercion pattern disappears entirely once `pkid` is gone |
| `hooks/use-repost.ts:63,73,180-182` | `buildOptimisticPost.pkid`, `originalPost.pkid`, `data.data.original_post.reposts?.[0].pkid` | MUST REPLACE |
| `hooks/use-create-post.ts:33` | `buildOptimisticPost.pkid` | MUST REMOVE |
| `lib/post-engagement.ts:10,25,46` | `EntityMatcher` dual `id`/`pkid` union, `findEngagementEntity`, `findDetailEntity` | MUST REPLACE — matcher collapses to `id`-only |
| `lib/post-helpers.ts:9-15,39,70` | `isSettledRepostPkid`, `pkid` coercions in `resolveEngagementPost`/`toStandalonePost` | MUST REPLACE → `isSettledRepostId(id: string \| null)` pattern |
| `components/dashboard/post-card.tsx` (7 sites, listed in §2.6 + `my_repost_pkid` checks at 317,321,323,353) | navigation + repost-undo pkid | MUST REPLACE |
| `components/dashboard/post-detail.tsx:967-993,780-897` | `PostDetailView({pkid})`, `usePostComments(post?.pkid)`, `my_repost_pkid` checks | MUST REPLACE |
| `components/dashboard/post-accounts-panel.tsx:132-134` | `PostAccountsPanel({pkid})`, `usePostDetail(pkid)` | MUST REPLACE |
| `components/dashboard/comment-modal.tsx:177,193` | `post: post.pkid`, `prependComment(post.pkid,…)` | MUST REPLACE |
| `components/dashboard/reply-modal.tsx:182` | `parent_comment: comment.pkid` | MUST REPLACE → `parent_id: comment.id` |
| `components/dashboard/edit-post-modal.tsx:170` | `updatePost.mutate({pkid: post.pkid, …})` | MUST REPLACE |
| `components/dashboard/quote-modal.tsx:64` | `asOriginalPost.pkid: post.pkid` | MUST REMOVE |
| `components/dashboard/quote-comment-modal.tsx:54` | `asOriginalComment.pkid: comment.pkid` | MUST REMOVE (whole helper removed, see §6) |
| `components/dashboard/user-profile-view.tsx:195,257` | reply navigation (§2.6) | MUST REPLACE |

**Cosmetic-only (already string-typed, just misnamed):**

| Location | Note |
|---|---|
| `app/api/socials/post/[pkid]/toggle-pinned-post/route.ts:6-7` | Param is declared `{ pkid: string }` and immediately destructured as `const { pkid: id } = await params` — **already a UUID string, not an int**. Caller (`post-card.tsx:612`, `togglePinnedPost.mutate(post.id)`) already passes `post.id`. This is a naming inconsistency only; rename the segment to `[id]` for consistency, not a functional/type change. |

**User/account `pkid` — confirmed out of scope, safe to retain, do not touch:**

`types/api.ts` (`LoginUser`, `FullUser`, `VerifyOtpResponseData.user`, `PostUser`, `SuggestionUser`, `FollowerUser`, `FollowingUser`, `AddLinkedAccountResponse.user`, `BlockedUser`, `UserProfileData`, `MentionUser`), `lib/api.ts:318` (`getUserProfile(pkid)`), `app/api/users/[pkid]/profile/route.ts`, `hooks/use-user-profile.ts`, `hooks/use-follow-actions.ts`, `hooks/use-mute-actions.ts`, `hooks/use-block-actions.ts`, `hooks/use-feed-freshness.ts:56,109`, `components/dashboard/author-hover-card.tsx`, `block-user-modal.tsx`, `blocked-accounts-panel.tsx`, `friend-suggestions.tsx` (both dashboard and onboarding), `post-accounts-panel.tsx:48,64-71,134,153,161,165` (the `AccountCard`/self-check parts, not `PostAccountsPanel`'s own `pkid` prop which **is** in scope, see table above), `top-bar.tsx:246`. All of these identify a **user**, not a social-content object. None are touched by this migration.

**Also unrelated / confirmed dead code (found during this pass, not part of the migration):**

- `stores/post-interactions-store.ts` — zero imports anywhere in the repo (verified by repo-wide grep). Keys its override maps by user `pkid`. Superseded by `patchAuthorFlagInFeeds` per prior work. Orphaned file; flagging for awareness, not touching it as part of this migration since it's unrelated to social-content identity.

---

## 3. Canonical Target Model

| Object | `kind` | `post_id` | `parent_id` |
|---|---|---|---|
| Post | `post` | `null` | `null` |
| Top-level Comment | `comment` | root post UUID | `null` |
| Reply | `reply` | root post UUID | direct parent UUID |

- `id` — canonical UUID identity. Sole identity going forward; no `pkid` on any `SocialContent`.
- `post_id` — root conversation identity. Identifies which post's conversation this object belongs to, regardless of depth.
- `parent_id` — immediate parent identity. The direct parent only, never the root post for anything below top-level.

**`post_id` is not the direct parent.** For a reply three levels deep, `post_id` still points at the original post; `parent_id` points at the reply directly above it.

---

## 4. Identity Migration

Fully covered in §2.7 above (the classification table *is* this section's content — kept together rather than duplicated, per the instruction to identify actual usage and replacement rather than just list filenames).

**Additional identity concept surfaced by this migration:** `my_repost_pkid` → `my_repost_id`. This is not one of the three canonical roles (`post`/`comment`/`reply`) — it's a *viewer-relative pointer* to the current user's own repost object, used solely to power "Undo repost" (`deletePost`/delete-content on that id). The new contract's `viewer` object (`liked`, `reposted`, `bookmarked`, `shared`) does not include a slot for "the id of my own repost" — this is a **gap between the supplied contract and an existing frontend need**, flagged as a backend dependency in §17, not assumed away.

---

## 5. Route Migration Checklist

**Current:** `/posts/[pkid]` (int) → **Target:** `/posts/[id]` (UUID)

| Site | File : line | Status |
|---|---|---|
| Route definition | `app/(dashboard)/posts/[pkid]/page.tsx` | [ ] must change — param rename + drop `Number()` |
| Post card → detail | `post-card.tsx:261` | [ ] must change |
| Post card → delete redirect guard | `post-card.tsx:624` | [ ] must change |
| Repost card → detail (x2) | `post-card.tsx:781,789` | [ ] must change |
| Quoted comment card → detail | `post-card.tsx:219` | [ ] must change (`comment.post` → `comment.post_id`) |
| Profile replies tab → detail (x2) | `user-profile-view.tsx:195,257` | [ ] must change |
| Notifications | — | N/A — `NotificationPopover.tsx` is 100% static mock data (verified, not wired to any social API), not a route consumer, out of scope |
| Nav-active matcher | `lib/nav-active.ts:9` | [x] no change — prefix match, format-agnostic |
| API proxy dependency | `app/api/socials/post/[pkid]/route.ts`, `app/api/socials/post-comments/[pkid]/route.ts` | [ ] must change — these are the server-side param equivalent of the same identity |
| `PostAccountsPanel` prop | `components/dashboard/post-accounts-panel.tsx:132` | [ ] must change |
| `PostDetailView` prop | `components/dashboard/post-detail.tsx:967-970` | [ ] must change |

**Back-compat option (documented, not adopted by default):** a redirect route at `/posts/[pkid]` that 302s to `/posts/[id]` after a pkid→id lookup would preserve old shared links. This is a Next.js middleware/route-level concern that does **not** require reintroducing `pkid` into the canonical `SocialContent` type — the lookup would live in a thin, isolated redirect handler only. Not implementing this unless you confirm it's wanted; noting it per your instruction to document the option without letting it leak into the canonical model.

---

## 6. SocialContent Type Migration

| Existing type | Current purpose | Target | Action |
|---|---|---|---|
| `Post` | Feed/detail post | `SocialContent` (`kind: "post"`) | Migrate — drop `pkid`, `reposted_object_type`, `original_post`; gain `kind`, `metrics`, `viewer`, `permissions`, `original` |
| `Comment` | Top-level comment *and* reply (same shape today) | `SocialContent` (`kind: "comment" \| "reply"`) | Migrate — drop `pkid`, `post`, `parent_comment`, `message`, `uploaded_media`; gain canonical fields |
| `UserReplyItem` | Profile "Replies" tab row | `SocialContent` (`kind: "reply"`) | **Remove.** Per your decision #4, no replacement frontend-only type — profile replies consume the same `SocialContent` shape as everywhere else. See §17 for the resulting backend dependency (loses the embedded parent-preview UX unless backend supplies it another way). |
| `UserReplyParentComment` | Embedded parent snapshot inside `UserReplyItem` | — | **Remove** alongside `UserReplyItem`. |
| `OriginalPost` | Repost payload when original is a Post | `SocialContent` (nested, `kind: "post"`) | Remove as separate type — folds into `SocialContent.original` |
| `OriginalComment` | Repost payload when original is a Comment; also embeds `replies: OriginalComment[]` recursively | `SocialContent` (nested, `kind: "comment" \| "reply"`) | Remove as separate type — folds into `SocialContent.original`; recursive `replies` field disappears entirely (only ever used for `.length`, replaced by `original.metrics.replies`) |
| `PostCommentDetail` | Unused | — | **Remove.** Dead code, unrelated to the migration mechanically but deleted as part of this pass since it's a Comment-shaped type that would otherwise sit alongside the new model as confusing dead weight. |
| `isOriginalComment()` type guard (`lib/post-helpers.ts`) | Disambiguates `OriginalPost \| OriginalComment` union | — | **Remove**, replaced by checking `original.kind` |

**Presentation-specific types retained (not collapsed):** none identified as *necessary* yet. `CommentRow`/`ReplyRow`/`ReplyThreadCard` are components, not types — they can keep their names as UI-role wrappers around one canonical `SocialContent` prop without requiring a second data type. This will be confirmed concretely during implementation of §10.

---

## 7. Relationship Invariants

**Post**
- [ ] `kind = "post"`
- [ ] `post_id = null`
- [ ] `parent_id = null`

**Top-level comment**
- [ ] `kind = "comment"`
- [ ] `post_id` = root post UUID
- [ ] `parent_id = null`

**Reply**
- [ ] `kind = "reply"`
- [ ] `post_id` = root post UUID
- [ ] `parent_id` = direct parent UUID

**Cross-root protection**
- [ ] `reply.post_id === parent.post_id`

**Relationship immutability**
- [ ] `id` cannot change
- [ ] `post_id` cannot change
- [ ] `parent_id` cannot change through content editing (edit payload is `{content, medial_urls}` only — see §11)

**Depth**
- [ ] a reply may have replies
- [ ] a reply may be the direct parent of another reply
- [ ] no frontend code assumes depth ≤ 1 (this is the one invariant **currently violated** by the existing implementation — `ReplyRow` has no reply affordance — and is the central behavioral change of this migration)

**Counts**
- [ ] `metrics.replies` counts direct children only (this already matches current `replies_count` semantics on `Comment` — low risk; does **not** match current `OriginalComment.replies.length`, which was a full embedded array, see §6)

---

## 8. Endpoint Mapping

Legend: **path retained; payload/response contract migrated** = current Next.js proxy path already matches or trivially maps to the target; **BACKEND CONTRACT DEPENDENCY** = frontend must change behavior on the assumption the backend now returns the new shape, unverified against a live backend from this repo alone; **GAP** = no current frontend implementation exists at all.

| Frontend method | Current Next proxy | Current Django target (observed) | Target contract (§7 of original spec) | Status |
|---|---|---|---|---|
| `socialApi.getForYouFeed` | `app/api/socials/for-you-feed` | `/socials/posts/feed` | `GET /socials/posts/feed` | path retained; response migrates to `SocialContent[]` — BACKEND CONTRACT DEPENDENCY |
| `socialApi.getFollowingFeed` | `app/api/socials/following-feed` | `/socials/posts/following-feed` | `GET /socials/posts/following-feed` | path retained; response migrates — BACKEND CONTRACT DEPENDENCY |
| feed search | `app/api/socials/search` | `/socials/posts/feed/search` | `GET /socials/posts/feed/search` | path retained; response migrates — BACKEND CONTRACT DEPENDENCY |
| `socialApi.getPostDetail` | `app/api/socials/post/[pkid]` (GET) | `/socials/post/${pkid}/get` | `GET /socials/post/{post_uuid}/get` | **id param migrates pkid→uuid**; path shape otherwise matches — BACKEND CONTRACT DEPENDENCY on response shape |
| `socialApi.getPostComments` | `app/api/socials/post-comments/[pkid]` | `/socials/post/comment/list/${pkid}` | `GET /socials/post/comment/list/{post_uuid}` | **id param migrates**; path shape matches — BACKEND CONTRACT DEPENDENCY |
| `socialApi.getCommentReplies` | `app/api/socials/comment-replies/[id]` | `/socials/post/comments/${id}/replies` | `GET /socials/post/comments/{comment_uuid}/replies` | **already uuid-keyed** — path and param type both already match target exactly. response shape migration only — BACKEND CONTRACT DEPENDENCY |
| — | *none* | *none* | `GET /socials/post/comments/{comment_uuid}` (fetch one comment/reply's own detail) | **GAP** — no current route/hook fetches a single comment/reply by id. Needed to render the "open a Reply → see Reply + its own header" step of the focused-thread UX (decision #3). Must be added; there is nothing to migrate here, this is new. |
| — | *none* | *none* | `GET /socials/post/comments/{comment_uuid}/details` | **GAP** — same as above, purpose of `/details` vs. the plain comment fetch is UNVERIFIED (spec lists both; this repo gives no evidence of what distinguishes them) |
| `socialApi.createPost` | `app/api/socials/create-post` | `/socials/post/create` | per decision #2: path retained | body migrates `content_text`→`content`, `media_urls`→`medial_urls` |
| `socialApi.addComment` | `app/api/socials/add-comment` | `/socials/post/comment` | per decision #2: path retained | body migrates `post`→`post_id`, `parent_comment`→`parent_id`, `message`→`content`, `media_urls`→`medial_urls`; response migrates to `SocialContent` |
| — | *none* | *none* | `PATCH`/edit comment or reply | **GAP** — confirmed zero existing edit-comment implementation anywhere (no hook, no route, no UI). This is new functionality, not a migration of existing behavior. |
| — | *none* | *none* | `DELETE /socials/post/comment/{comment_uuid}` | **GAP** — confirmed zero existing delete-comment implementation. New functionality. CONTRACTED path from your original spec §18; UNVERIFIED against this repo/backend since nothing here currently calls it. |
| `socialApi.updatePost` | `app/api/socials/post/[pkid]` (PATCH) | `/socials/post/${pkid}` | per decision #2: path retained | id param migrates pkid→uuid; body migrates to `{content, medial_urls}` |
| `socialApi.deletePost` | `app/api/socials/post/[pkid]` (DELETE) | `/socials/post/${pkid}` | per decision #2: path retained | id param migrates |
| `socialApi.repost` | `app/api/socials/repost` | `/socials/post/repost` | per decision #2: path retained | `original_post` field **already a UUID string** in current `RepostPayload` (`types/api.ts:327`) — low risk; response migrates |
| `socialApi.repostComment` | `app/api/socials/repost-comment` | `/socials/post/comment/repost` | per decision #2: path retained | `original_comment` **already a UUID string** (`types/api.ts:347`) — low risk; new contract needs this to also accept reposting a *reply*, currently untested since reply-level UI doesn't exist yet |
| `socialApi.likePost` | `app/api/socials/like-post` | `/socials/post/like-post` | unchanged | `{post: string}` already UUID |
| `socialApi.likeComment` | `app/api/socials/like-comment` | `/socials/post/comment/like` | unchanged | `{comment: string}` already UUID |
| `socialApi.bookmarkPost` | `app/api/socials/bookmark-post` | `/socials/post/toggle-bookmark` | unchanged | already UUID |
| `socialApi.togglePinnedPost` | `app/api/socials/post/[pkid]/toggle-pinned-post` | `/socials/post/${id}/toggle-pinned-post` | unchanged | already UUID (param misnamed `pkid`, see §2.7 cosmetic note) |
| bookmarks list | `app/api/socials/bookmarks` | `/socials/post/bookmark/list` | `GET /socials/post/bookmark/list` | path retained; response migrates — BACKEND CONTRACT DEPENDENCY |
| — | *none* | *none* | `GET /socials/post/repost/list` | **GAP** — no current dedicated reposts-list proxy exists at this path; profile reposts currently go through `user-handle/{id}/reposts` instead (see below). UNVERIFIED whether these are the same backend concept under two paths or genuinely different. |
| — | *none* | *none* | `GET /socials/post/pinned-post/get` | **GAP** — no current standalone "get the pinned post" fetch; pin state today is only a boolean flag (`is_pinned`) on posts already in a feed/profile list. UNVERIFIED. |
| — | *none* | *none* | `GET /socials/user/my_posts`, `GET /socials/user/my_comments` | **GAP** — current profile implementation fetches any user's posts/replies via `user-handle/{user_uuid}/...`, including the viewer's own. No distinct "me-scoped" endpoint is consumed today. UNVERIFIED whether these are meant to replace or supplement `user-handle/{id}/...` for the self case. |
| `socialApi.getUserPosts`/reposts/liked/media (`useProfileFeedTab`) | `app/api/socials/user-handle/[id]/{posts,reposts,liked-posts,posts-with-media}` | matching Django paths | `GET /socials/user-handle/{user_uuid}/posts` etc. | path retained; response migrates — BACKEND CONTRACT DEPENDENCY |
| `socialApi.getUserRepliesByPath` | `app/api/socials/user-handle/[id]/replies` | `/socials/user-handle/${id}/replies` | `GET /socials/user-handle/{user_uuid}/replies` | path retained; response migrates from `UserReplyItem[]` to `SocialContent[]` — BACKEND CONTRACT DEPENDENCY (this is the central §17 risk item) |
| `socialApi.getPostStats` | `app/api/socials/post-stats/[id]` | `/socials/post/${id}/stats/all` | not explicitly covered by supplied contract | UNVERIFIED whether `PostStats` shape is superseded by `SocialContent.metrics`/`viewer` or remains a separate detail endpoint — no evidence either way in this repo or in the contract you supplied |

---

## 9. Query & Cache Migration

### Current

| Query | Key | Input | Returns | Pagination | Notes |
|---|---|---|---|---|---|
| Feed (3 variants) | `feedKeys.forYou/following/bookmarks` | none | `Post[]` | infinite, cursor via `next` URL | `hooks/use-feed.ts` |
| Post detail | `postDetailKeys.detail(pkid)` | `pkid: number` | `Post` | n/a | `hooks/use-post-detail.ts:18-44`; has `placeholderData` fallback that scans feed caches by pkid |
| Top-level comments | `commentKeys.list(pkid)` | `pkid: number` | `Comment[]`, paginated | infinite | `hooks/use-post-detail.ts:46-56` |
| Direct replies of **one comment only** | `commentKeys.replies(commentId)` | `commentId: string` (already UUID) | `Comment[]` | **single page, no pagination** | `hooks/use-post-detail.ts:58-65`; cannot be called against a reply today because no UI ever passes a reply's id in |
| Profile tabs (posts/reposts/liked/media) | `profileFeedKeys.{kind}(id)` | user id | `Post[]` | infinite | `hooks/use-profile-feeds.ts` |
| Profile replies | `profileFeedKeys.replies(id)` | user id | `UserReplyItem[]` | infinite | separate shape from every other query above |

### Target

The repository's existing convention already favors semantic query names (`commentKeys.list`, `commentKeys.replies`) over generic ones — per your instruction not to force a generic abstraction where the current structure benefits from semantic naming, the target keeps this pattern but makes it **depth-agnostic and content-id-keyed instead of pkid/comment-id-keyed**:

- `contentDetailKeys.detail(id)` — any single `SocialContent` by UUID (post, comment, or reply) — replaces `postDetailKeys.detail(pkid)`, and newly also serves the "open a comment/reply as its own focused node" need identified as a GAP in §8.
- `contentChildrenKeys.direct(parentId)` — direct children of any content id, paginated — replaces both `commentKeys.list(pkid)` (called with a post id) and `commentKeys.replies(commentId)` (called with a comment id), unified into one paginated query shape usable at any depth. This directly resolves the depth-1 ceiling: the same hook works whether `parentId` is a post, a comment, or a reply.
- Profile tabs unify onto `contentChildrenKeys`/`contentDetailKeys` shapes where the response is `SocialContent[]`; the current `profileFeedKeys.{posts,reposts,liked,media}` pattern is retained for those four (they're genuinely `Post`-only lists per the current backend paths), but `profileFeedKeys.replies(id)` returns `SocialContent[]` (kind `"reply"`) instead of `UserReplyItem[]`.

For each: **invalidation** — creating a child invalidates/patches its direct parent's `contentChildrenKeys.direct(parentId)` entry and increments the parent's `metrics.replies`, not any ancestor further up. **Optimistic updates** — insertion targets `contentChildrenKeys.direct(newContent.parent_id ?? newContent.post_id)` specifically (the direct parent, per your decision #3's core rule), never the root post's own children list when the new content is a nested reply. **Deletion** — per §11/§17, cascade behavior belongs to the backend; the frontend's job is to stop rendering the deleted node and evict its own `contentChildrenKeys.direct(deletedId)` entry so no stale descendant list can be displayed if the same id is ever reused as a cache key. This does not attempt to walk and evict a full descendant tree client-side.

---

## 10. Reply Tree / Thread Architecture

**Current limitation:** `Post → Comment → Reply` is a fixed three-tier structure baked into distinct components (`CommentRow`, `RepliesSection`, `ReplyRow`) with no recursion — confirmed by `ReplyRow` (`post-detail.tsx:318-359`) having no reply button and `RepliesSection` never being invoked with anything but a top-level comment's id.

**Target, per decision #3 (focused-thread, not infinite indentation):**

```
Post
  ↓
Top-level comments (direct children of Post)
  ↓
Open a Comment → focused view = Comment + its direct replies
  ↓
Open a Reply → focused view = that Reply + its direct replies
  ↓
Continue at any depth — same view shape every time
```

The critical rule carried over verbatim from your decision: **the UI may change *presentation* depth, but must never change or obscure `parent_id`.** A reply composed while a Reply is focused must send `parent_id = focusedContent.id`, where `focusedContent.kind` may itself be `"reply"` — not the root comment's id, and not `post_id`.

**State required to implement this correctly** (documented now so a future regression — "reply lands under the wrong parent" — has an obvious place to look, per your Debugging Playbook requirement in §19):

- `focusedContent: SocialContent` — the node currently being viewed as a sub-thread root (a comment or a reply).
- `focusedContent.post_id` — used to confirm every fetched child belongs to the same conversation (cross-root protection, §7).
- `contentChildrenKeys.direct(focusedContent.id)` — the query backing the visible direct-replies list for that node.
- Reply composer's parent — must be bound to `focusedContent.id`, not to any ancestor id cached earlier in the session. This is exactly the bug class named in your spec's §16/Bug list ("replying to a reply creates a sibling") — the composer's parent binding is the single highest-risk piece of state in this whole migration.

This replaces `CommentRow`/`RepliesSection`/`ReplyRow` as three fixed tiers with one recursive-capable `SocialContentThread` concept operating at whatever `focusedContent` currently is. Concrete component boundaries will be proposed at implementation time per §6's presentation-vs-canonical-model distinction — not decided here.

---

## 11. Mutation Mapping

| Mutation | Request fields | Relationship fields | Affected queries | Cache behavior | Current status |
|---|---|---|---|---|---|
| Create post | `content`, `medial_urls`, `hashtags?`, `location?`, `who_can_see`, `who_can_reply` | `post_id=null, parent_id=null` (implicit) | `feedKeys.forYou` | optimistic prepend, no `onError` rollback (pre-existing gap, see below) | Migrate existing `useCreatePost` |
| Create comment | `post_id`, `content`, `medial_urls?` | `parent_id` not sent | `contentChildrenKeys.direct(post_id)`, parent `metrics.replies` | optimistic prepend + count patch | Migrate existing `useAddComment`/`usePrependComment` |
| Create reply | `parent_id`, `content`, `medial_urls?` | `post_id` **not sent — server derives root from `parent_id`** (per decision, contract §8) | `contentChildrenKeys.direct(parent_id)`, direct parent's `metrics.replies` only | optimistic prepend under the exact `parent_id`, never the root post's list | Migrate existing `useAddComment`/`usePrependReply` — today's version already keys by direct parent correctly, just never exercised beyond depth 1 |
| Edit post | `content`, `medial_urls` (relationship fields immutable) | none | `postDetailKeys`/feed caches | patch in place | Migrate existing `useUpdatePost` |
| Edit comment | `content`, `medial_urls` | none | `contentChildrenKeys.direct(post_id)` | patch in place | **GAP — build new**, no existing implementation (§8) |
| Edit reply | `content`, `medial_urls` | none | `contentChildrenKeys.direct(parent_id)` | patch in place | **GAP — build new** |
| Delete post | — | cascades to all descendant comments/replies (backend) | remove from all feed/profile caches, `removeQueries` on detail | frontend does not attempt to replicate cascade; evicts what it can see | Migrate existing `useDeletePost` |
| Delete comment | — | cascades to descendant replies (backend) | remove from `contentChildrenKeys.direct(post_id)`; evict `contentChildrenKeys.direct(deletedId)` | same as above | **GAP — build new** |
| Delete reply | — | cascades to descendant replies (backend) | remove from `contentChildrenKeys.direct(parent_id)`; evict own children key | same as above | **GAP — build new** |
| Repost post | `original_post` (already UUID) | `original.kind` on response should be `"post"` | `feedKeys.forYou`, engagement patch on original | Migrate existing `useRepost` |
| Repost comment | `original_comment` (already UUID) | `original.kind` should be `"comment"` | same pattern via `useRepostComment` | Migrate existing |
| Repost reply | same field name as comment repost, per contract | `original.kind` should be `"reply"` | same pattern | **Untested today** — no reply-level UI exists to trigger this yet; payload shape is assumed identical to comment repost since the contract doesn't distinguish them, marked INFERRED in §17 |

**Pre-existing gap noted, not introduced by this migration:** `useCreatePost` has no `onError` handler (`hooks/use-create-post.ts:66-96`) — a failed optimistic post creation can get stuck visible in the feed. This predates the migration; flagging it here because the create-post mutation is being touched anyway, and it's a reasonable moment to fix, but it is not itself a contract-migration item.

---

## 12. Repost Migration

**Current (two kinds, forced binary):** `reposted_object_type: "Comment" | "Post" | null` + `isOriginalComment()` guard, checked at `post-card.tsx` (2 sites), `post-helpers.ts` (2 sites), `use-post-detail.ts`, `use-comment.ts`, `post-engagement.ts` (2 sites) — nine call sites total, all replaced by checking `original.kind`.

**Target (three kinds, `original.original` forced null):** `original: SocialContent | null`; when present, `original.original === null` always. This is a **strengthening** of the current type — today `OriginalComment.replies: OriginalComment[]` is *unboundedly* recursive in the type system even though nothing reads past `.length` (§2.4, §6). The new type must make that recursion structurally impossible, not merely unused-by-convention.

Every current-code assumption identified and its replacement:

| Current assumption | Location | Replacement |
|---|---|---|
| `reposted_object_type === "Post"` | `post-helpers.ts:22`, `post-card.tsx:752` | `original?.kind === "post"` |
| `reposted_object_type === "Comment"` | `post-card.tsx:752` | `original?.kind === "comment" \| "reply"` |
| `original_post` field name | pervasive | `original` |
| `OriginalComment` type / `isOriginalComment()` guard | 9 sites (listed above) | `original.kind` discriminant, no separate type |
| `original.replies.length` as a count | `post-card.tsx:93` | `original.metrics.replies` |
| `isUnquotedPostRepost` only resolving Post-kind bare reposts | `post-helpers.ts:17-26` | must extend to resolve any `original.kind`, including reposted comments/replies — this is new behavior, not currently exercised for comment/reply bare reposts |

---

## 13. Permissions Migration

**Current:** only `Post.viewer_permissions?: ViewerPermissions` (`can_view`, `can_reply`) exists (`types/api.ts:200-203`). `lib/post-permissions.ts::canReplyToPost(post)` is called exclusively with the root `post`, even from `ReplyModal` when replying to a comment — meaning comments/replies today already *implicitly* inherit the root post's reply policy, just because there's no other permissions object to consult. This happens to align with the target's inheritance rule, but it's accidental (there's no comment/reply `permissions` field to diverge from), not a deliberate inheritance implementation.

**Target:** every `SocialContent` (post, comment, reply) carries its own `permissions: {visibility, reply_policy, can_view, can_reply}`, with comments/replies' values inherited from the root post server-side. `canReplyToPost` generalizes to operate on `content.permissions.can_reply` for any kind, not just `Post`.

**Deletion vs. visibility (your explicit rule):** deletion must remain available to the content owner even when root-post visibility has changed (e.g., root post later restricted). The frontend must not gate a delete action on `permissions.can_view` — that check is for *reading*, not *owning*. No current code conflates these (delete today is Post-only and owner-gated via `PostOptionsMenu`, not via `viewer_permissions`), but this is worth stating explicitly since edit/delete-comment are new code being written from scratch (§11) and could easily reuse `can_view` incorrectly if not careful.

---

## 14. Engagement & Metrics Migration

| Current field | Location | Target |
|---|---|---|
| `Comment.replies_count` | `types/api.ts:310` | `metrics.replies` — **semantically already correct** (direct children only), low-risk rename |
| `original.replies.length` | `post-card.tsx:93` | `original.metrics.replies` — semantically **different**: today it's a live array length (only ever populated as `[]` by the frontend itself in `quote-comment-modal.tsx:61`, so in practice always renders `0` for any comment being quoted — worth independently confirming this isn't a live display bug already, since `asOriginalComment` always sends `replies: []`) |
| `Post.post_like_count`, `post_comment_count`, `repost_count` | `types/api.ts:225-227` | `metrics.likes`, `metrics.replies`, `metrics.reposts` |
| `Comment.like_count`, `repost_count` | `types/api.ts:309,311` | `metrics.likes`, `metrics.reposts` |
| `liked_by_me`, `bookmarked_by_me`, `reposted_by_me` | `Post`/`Comment` | `viewer.liked/bookmarked/reposted` |
| — | — | `metrics.reactions`, `metrics.shares`, `metrics.views`, `viewer.shared` are **new fields with no current frontend equivalent** — nothing to migrate, net-new UI surface if used |

**Cache patching migration:** `patchEngagementEverywhere`/`patchCommentEverywhere` (two systems, §2.5) collapse toward one content-kind-agnostic patcher keyed by `id`, eliminating the `id`/`pkid` dual matcher in `EntityMatcher` (`post-engagement.ts:10`) entirely since the new model has no `pkid` to match against.

---

## 15. Legacy Compatibility Audit

| Legacy field | Occurrences found | Disposition |
|---|---|---|
| `content_text` | `types/api.ts` (Post, CreatePostPayload, UpdatePostPayload, OriginalPost, UpdatePostResponseData), `edit-post-modal.tsx:162`, `quote-modal.tsx:65`, `post-card.tsx` (repost builders) | replace → `content` |
| `message` | `types/api.ts` (Comment, AddCommentPayload, OriginalComment, UserReplyParentComment), `reply-modal.tsx`, `comment-modal.tsx`, `post-detail.tsx`, `user-profile-view.tsx` | replace → `content` |
| `media_urls` (payload field) | `AddCommentPayload`, `RepostPayload`, `RepostCommentPayload`, `CreatePostPayload`, `UpdatePostPayload` | replace → `medial_urls` (contract's field name, not a typo on my part — matches your original spec verbatim) |
| `uploaded_media` (response field) | `Comment`, `OriginalComment`, `UserReplyItem` | replace → `media` (per canonical `SocialContent.media: string[]`) |
| `post` (as relationship field) | `Comment.post`, `AddCommentPayload.post`, `OriginalComment.post` | replace → `post_id` |
| `parent_comment` | `Comment.parent_comment`, `AddCommentPayload.parent_comment`, `UserReplyItem.parent_comment` | replace → `parent_id` |

No frontend code currently reads any of these as a **fallback/compat** path (e.g. `data.content ?? data.content_text`) — they're simply the only names used today. There is nothing to "retain for compatibility" on the frontend; per decision #2, the frontend adopts canonical names outright and relies on the backend's temporary dual-acceptance for anything not yet migrated on the server side, which is out of this repo's control.

---

## 16. Known Risks

1. `pkid`→UUID migration touching ~30 files (§2.7) — mechanical but high surface area; a single missed `Number()` coercion fails silently (`NaN` in a query key) rather than loudly.
2. Route/public-URL migration (§5) — six navigation call sites plus the route file itself; a missed site produces a working-looking link that 404s.
3. Depth-1 reply architecture (§2.2, §10) — the largest *behavioral* (not just typing) change; genuinely new component/state design, not a mechanical contract swap.
4. Three competing content representations collapsing to one (`Post`/`Comment`/`UserReplyItem`, §6) — `UserReplyItem` removal is the riskiest of the three because it's the one place losing an existing UX capability (embedded parent preview) unless the backend supplies an equivalent (§17).
5. Repost model: 2 kinds → 3, plus removing real (if unused) recursion in `OriginalComment.replies` (§12).
6. Two independent engagement-patch systems merging into one (§2.5, §14) — regression risk is "like on a comment silently stops updating the post-detail cache" if the merge misses a call site.
7. Cascade-delete UI correctness (§11) — frontend does not replicate backend cascade logic; must not leave stale children visible without literally re-implementing tree deletion client-side.
8. **Comment/reply edit and delete are new features, not migrations** (§8, §11) — confirmed zero existing implementation. Treating this as "migrate the edit/delete flow" would be building on a false premise; it must be scoped as new work.
9. Zero automated test coverage for any social-content code (`__tests__/` is 100% auth-flow, confirmed by direct listing) — verification after this migration is typecheck + lint + manual QA only.
10. `getPostStats`/`PostStats` relationship to `metrics`/`viewer` is unresolved (§8) — could be redundant with the new contract or could remain a genuinely separate detail endpoint; not clear from either the repo or the supplied contract.
11. Reposting a **reply** specifically (as opposed to a post or top-level comment) is entirely untested in the current codebase, since no UI can currently select a reply to repost — first real exercise of this path happens during this migration, not before it (§11).
12. `original.replies.length` in `post-card.tsx:93` may already be a live display bug (always renders 0 for quoted comments, per §14) — worth a quick independent check before assuming its replacement (`metrics.replies`) is purely a rename and not also a bug fix.

---

## 17. Backend Contract Dependencies

| Frontend expectation | Backend contract requirement | Verified? | Action |
|---|---|---|---|
| UUID post reads (`GET .../post/{id}/get`) | Response is `SocialContent`-shaped, not current `Post` shape | UNVERIFIED — path shape OBSERVED to already match; response body shape is CONTRACTED only | Build against contract; confirm against real backend response before/during implementation |
| Canonical comment/reply shape from list & replies endpoints | `GET .../post/comment/list/{post_uuid}`, `.../comments/{id}/replies` return `SocialContent[]` | Path OBSERVED to already exist and match; response shape CONTRACTED only | same |
| Reply derives root post from `parent_id` (client never sends `post_id` on reply create) | Backend resolves `post_id` server-side | CONTRACTED (explicit in your original spec §8), not independently observable from this frontend-only repo | Implement client to omit `post_id` on reply create per contract; cannot verify server behavior from here |
| User replies return `SocialContent`, not `UserReplyItem` | `GET user-handle/{id}/replies` response migrates | UNVERIFIED — current response (`UserReplyItem[]`, including embedded `parent_comment` preview) is OBSERVED; whether the new response still includes an equivalent parent-preview is CONTRACTED-silent — the canonical `SocialContent` object has no field for "preview of my parent" | **Real open question, not just a formality:** if the backend's new `user-handle/{id}/replies` only returns bare `SocialContent` with a `parent_id` UUID and nothing else, the profile Replies tab loses today's "replying to @user: message preview" UX unless the frontend does a second fetch per row (N+1, explicitly against your §24 "no unnecessary abstraction / no speculative fetching" guidance) or the backend adds a lightweight parent-preview alongside the canonical object. Recommend confirming with the backend team before implementing this specific tab. |
| Repost original can be `post`, `comment`, or `reply` | `original.kind` discriminant on repost responses | CONTRACTED (spec §13), zero current backend response observed with three kinds — today's backend only ever sends `reposted_object_type: "Comment" | "Post"` | Build against contract; if backend genuinely still only distinguishes two kinds, `original.kind` for a reposted reply is UNVERIFIED to arrive as `"reply"` vs. `"comment"` |
| Edit/delete comment endpoints exist at the paths implied by your spec §9/§18 | `PATCH`/`DELETE .../post/comment/{comment_uuid}` | UNVERIFIED — no current frontend evidence these paths exist or behave as described; entirely new integration | Implement against contract; treat first real call as the verification step, not an assumption |
| `metrics`/`viewer`/`permissions` supersede `PostStats` | Unclear | UNVERIFIED, no evidence either way | Flag for a direct question rather than a guess when this endpoint is reached in implementation |
| Write endpoint paths unchanged (decision #2) | `/socials/post/create`, `/socials/post/comment`, `/socials/post/repost`, `/socials/post/comment/repost` | OBSERVED (these paths exist today, confirmed by reading every route handler) — your decision affirms only the *payload* changes, not the path | Implement as decided; this is the one row in this table with the strongest evidence behind it |

---

## 18. Test & Verification Matrix

*(Checklist form retained as requested; execution happens after implementation, per §26 of the original spec. Recorded here so the scope is explicit before code changes begin.)*

**Type/system**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run test` — note per §16 risk 9, this currently exercises zero social-content code; a clean run does not itself validate this migration

**Post** — [ ] create · [ ] read · [ ] edit · [ ] delete · [ ] feed · [ ] detail · [ ] bookmark · [ ] repost

**Comment** — [ ] create · [ ] read · [ ] edit *(new)* · [ ] delete *(new)* · [ ] list · [ ] direct child count · [ ] permissions

**Reply** — [ ] create under comment · [ ] create under reply · [ ] read direct children · [ ] edit *(new)* · [ ] delete *(new)* · [ ] nested depth > 1 · [ ] direct child count · [ ] correct root post · [ ] correct parent

**Reposts** — [ ] repost post · [ ] repost comment · [ ] repost reply *(first-ever exercise of this path, §16 risk 11)* · [ ] render each kind · [ ] `original.original === null`

**Profile** — [ ] posts · [ ] comments · [ ] replies *(highest-risk tab, §17)* · [ ] liked posts · [ ] reposts

**Cache** — [ ] create updates correct collection · [ ] edit updates correct object · [ ] delete removes correct object · [ ] parent deletion removes descendants from visible UI · [ ] no stale reply collection survives deletion · [ ] direct-child counts remain correct

---

## 19. Debugging Playbook

| Symptom | First things to inspect |
|---|---|
| Reply appears under wrong parent | `reply.parent_id`, the composer's bound `focusedContent.id` at submit time (§10), `contentChildrenKeys.direct(parentId)` key actually used for the optimistic insert |
| Reply appears in wrong post | `reply.post_id` vs. `parent.post_id` — must match (§7 cross-root invariant) |
| Nested reply becomes a top-level comment | `parent_id === null` on the created object — check whether the composer sent `parent_id` at all vs. omitting it |
| Nested reply cannot be created | reply composer's `focusedContent` state, mutation payload's `parent_id`, whether `contentDetailKeys.detail` for that node ever resolved (§9 GAP — single-content fetch) |
| Reply count wrong | `metrics.replies` vs. any leftover `.replies.length`/`replies_count` reference (§14) |
| Profile reply looks different from thread-view reply | `UserReplyItem` migration — confirm the profile Replies tab is actually consuming `SocialContent`, not a leftover shape (§6, §17) |
| Reposted reply renders incorrectly | `original.kind` — confirm it's `"reply"`, not defaulting to `"comment"` or `"post"` (§12) |
| Repost renders recursively / infinitely | `original.original` — must be `null`, always (§12) |
| Deleted descendants remain visible | React Query cache: was `contentChildrenKeys.direct(deletedId)` evicted? Was the parent's `contentChildrenKeys.direct(parentId)` patched to remove the deleted entry? (§9, §11) |
| Post detail cannot load after migration | UUID route param (`app/(dashboard)/posts/[id]/page.tsx`) vs. API proxy route (`app/api/socials/post/[id]/route.ts`) — confirm both sides actually migrated together, not just one (§5) |
| Feed object has old field names | API response type/normalization — confirm `types/api.ts` types were actually swapped at the call site, not just declared (TypeScript won't catch a `.content_text` read against an untyped/`any` API response) |
| Engagement update affects wrong content | canonical `id`-only cache identity — confirm no leftover `pkid` matcher path survived the `EntityMatcher` migration (§14) |
| Comment/reply cannot be edited | this is new functionality (§8) — confirm the edit endpoint/payload was actually implemented and matches `{content, medial_urls}`, not assumed to already exist |
| User cannot delete hidden content they own | confirm delete logic checks ownership, not `permissions.can_view` (§13) |
| "Reply" button doesn't appear on a Reply row | confirm the component actually was migrated off `ReplyRow`'s current no-reply-affordance behavior (§2.2) — this is the most likely place for a leftover depth-1 assumption to survive |

---

## 20. File-by-File Affirmation Checklist

*Files confirmed via direct inspection in this pass and the prior pass. "Verified before implementation" reflects whether the specific usage inside that file has actually been read and classified (yes, throughout this document) vs. only located by filename.*

| File | Current responsibility | Why it changes | Expected change | Risk | Dependencies | Verified |
|---|---|---|---|---|---|---|
| `types/api.ts` | All API request/response/domain types | Canonical model replaces 5 fragmented types | Add `SocialContent`; remove `Post`'s pkid/repost fields folded in, `Comment`, `OriginalPost`, `OriginalComment`, `UserReplyItem`, `UserReplyParentComment`, `PostCommentDetail` (dead) | High (everything downstream depends on this file) | none upstream — this is the root of the dependency graph | YES |
| `lib/api.ts` | `socialApi`/`userApi` HTTP client | Payload/response types change; pkid params become id | Migrate `getPostDetail`, `getPostComments`, `updatePost`, `deletePost`, `addComment`, `createPost`, `repost`, `repostComment` signatures | High | `types/api.ts` | YES |
| `app/api/socials/post/[pkid]/route.ts` | Post GET/PATCH/DELETE proxy | Route identity migrates | Rename `[pkid]`→`[id]`, drop int typing | Medium | route consumers in §5 | YES |
| `app/api/socials/post-comments/[pkid]/route.ts` | Top-level comments list proxy | Route identity migrates | Rename `[pkid]`→`[id]` | Medium | `usePostComments` | YES |
| `app/api/socials/post/[pkid]/toggle-pinned-post/route.ts` | Toggle pin proxy | Cosmetic only | Rename param `pkid`→`id` (already string) | Low | none functional | YES |
| `app/api/socials/add-comment/route.ts` | Comment/reply create proxy | Body forwarded verbatim today | No functional change needed at proxy level (body passthrough); canonical fields originate at the call site | Low | `AddCommentPayload` type | YES |
| `app/api/socials/create-post/route.ts` | Post create proxy | Same as above | No functional change needed at proxy level | Low | `CreatePostPayload` type | YES |
| *(new)* `app/api/socials/comment/[id]/route.ts` (or equivalent) | — | Edit/delete comment/reply — GAP per §8/§11 | New file | High (new integration, unverified backend paths) | backend confirmation | N/A — does not exist yet |
| `hooks/use-post-detail.ts` | Post detail + comment/reply query hooks | Depth-1 architecture + pkid keys | Unify into id-keyed, depth-agnostic direct-children query (§9) | High | `types/api.ts`, `lib/api.ts` | YES |
| `hooks/use-comment.ts` | Comment/reply create mutation + cache prepend | pkid-keyed cache writes, depth-1 `usePrependReply` | Migrate to id-keyed; generalize prepend to work at any depth | High | `hooks/use-post-detail.ts` | YES |
| `hooks/use-comment-actions.ts` | Like/repost comment mutations | Uses `lib/comment-engagement.ts`, separate patch system | Fold into unified engagement patcher (§14) | Medium | `lib/comment-engagement.ts` | YES |
| `lib/comment-engagement.ts` | Comment-only cache patch/find | Duplicate of `post-engagement.ts` | Merge or generalize (§2.5, §14) | Medium | — | YES |
| `lib/post-engagement.ts` | Post-only cache patch/find, dual id/pkid matcher | `EntityMatcher` pkid branch removed | Simplify to id-only matcher | Medium | `types/api.ts` | YES |
| `lib/post-helpers.ts` | `isOriginalComment`, `resolveEngagementPost`, `toStandalonePost`, `isSettledRepostPkid` | Two-kind repost model, pkid coercions | Replace guard with `kind` check; id-based settled-repost check | Medium | `types/api.ts` | YES |
| `lib/post-permissions.ts` | `canReplyToPost` (Post-only) | Comments/replies gain own `permissions` | Generalize to any `SocialContent` | Low | `types/api.ts` | YES |
| `components/dashboard/post-detail.tsx` | Post detail page: comment/reply thread rendering | Depth-1 `CommentRow`/`RepliesSection`/`ReplyRow`, pkid props | Rework into focused-thread model (§10); id-based props | High | `hooks/use-post-detail.ts`, `hooks/use-comment.ts` | YES |
| `components/dashboard/reply-modal.tsx` | Reply composer | pkid payload fields; only ever invoked from top-level comments | Canonical `parent_id`/`content` payload; must work when invoked from a reply too | High | `hooks/use-comment.ts` | YES |
| `components/dashboard/comment-modal.tsx` | Top-level comment composer | pkid payload field | Canonical `post_id`/`content` payload | Medium | `hooks/use-comment.ts` | YES |
| `components/dashboard/post-card.tsx` | Feed post card, repost rendering, navigation | 7 `/posts/pkid` nav sites, two-kind repost discriminator | Migrate nav to `/posts/[id]`; `original.kind` discriminant | High (highest single-file risk — most nav sites) | `types/api.ts`, `lib/post-helpers.ts` | YES |
| `components/dashboard/post-accounts-panel.tsx` | Post detail sidebar account cards | pkid prop | id prop | Low | `hooks/use-post-detail.ts` | YES |
| `components/dashboard/edit-post-modal.tsx` | Post edit composer | pkid in mutation call | id in mutation call | Low | `hooks/use-post-actions.ts` | YES |
| `components/dashboard/quote-modal.tsx` | Quote-repost-a-post composer | fabricates `OriginalPost` incl. pkid | fabricates `SocialContent` original, no pkid | Low | `types/api.ts` | YES |
| `components/dashboard/quote-comment-modal.tsx` | Quote-repost-a-comment composer | fabricates `OriginalComment` incl. pkid + fake `replies: []` | fabricates `SocialContent` original | Medium | `types/api.ts` | YES |
| `hooks/use-repost.ts` | Repost/undo-repost mutations | `reposted_object_type: "Post"` hard-coded, `my_repost_pkid` | `original.kind`, `my_repost_id` | Medium | `types/api.ts`, `lib/post-helpers.ts` | YES |
| `hooks/use-create-post.ts` | Create post mutation | pkid in optimistic post; no `onError` (pre-existing, §11 note) | id-only optimistic post | Low | `types/api.ts` | YES |
| `hooks/use-post-actions.ts` | Update/delete/pin/like/bookmark post mutations | pkid-keyed everywhere, dual coercion pattern | id-keyed throughout | High | `types/api.ts`, `lib/post-engagement.ts` | YES |
| `hooks/use-profile-feeds.ts` | Profile tab queries incl. `useUserReplies` | `UserReplyItem` shape | `SocialContent` shape for replies tab | High (§17 backend-dependency risk) | `types/api.ts` | YES |
| `components/dashboard/user-profile-view.tsx` | Profile page incl. Replies tab rendering | `UserReplyItem`-shaped `ReplyThreadCard`, 2 nav sites | `SocialContent`-shaped rendering | High | `hooks/use-profile-feeds.ts` | YES |
| `app/(dashboard)/posts/[pkid]/page.tsx` | Post detail route | Route identity | Rename `[pkid]`→`[id]` | Medium | §5 | YES |
| `app/(dashboard)/profile/[pkid]/page.tsx` | Profile route | **User** pkid, not social-content — confirmed unrelated | No change | — | — | YES (confirmed out of scope) |
| `components/NotificationPopover.tsx` | Notification list | 100% static mock data, not API-wired | No change | — | — | YES (confirmed out of scope) |
| `stores/post-interactions-store.ts` | Legacy follow/mute/block override store | Zero imports anywhere — dead code | No change (out of scope, unrelated to social-content identity) | — | — | YES (confirmed dead/unrelated) |
| `docs/social/social-content-architecture.md` | *(to be created)* | Final reference doc, §28 of original spec | New file, written after implementation from actual resulting code | — | entire migration | N/A — not yet written |

---

## 21. Implementation Order

Determined from the actual dependency graph traced in this document, not the generic template order:

1. **`types/api.ts`** — everything else fails to typecheck without this first.
2. **`lib/api.ts` + route proxies** (`post/[pkid]→[id]`, `post-comments/[pkid]→[id]`, `toggle-pinned-post` rename) — the identity migration has to land before any hook can be honestly id-typed.
3. **`lib/post-helpers.ts`, `lib/post-engagement.ts`, `lib/comment-engagement.ts`** — shared low-level utilities every hook depends on; migrating hooks before these would mean migrating them twice.
4. **`hooks/use-post-detail.ts`, `hooks/use-comment.ts`** — the query/cache architecture (§9), including the new depth-agnostic direct-children query. This is the load-bearing piece for everything in step 6.
5. **`hooks/use-post-actions.ts`, `hooks/use-create-post.ts`, `hooks/use-repost.ts`, `hooks/use-comment-actions.ts`** — mutations, now that the query layer they patch is stable.
6. **Route identity** (`app/(dashboard)/posts/[pkid]/page.tsx` → `[id]`) — done here rather than earlier because steps 2–5 need to compile and be internally consistent before the public-facing route changes; done here rather than later because step 7 (post-card navigation) depends on the route existing.
7. **`components/dashboard/post-card.tsx`** — highest nav-site count (§20); depends on steps 1–6 all being in place.
8. **`components/dashboard/post-detail.tsx` + `reply-modal.tsx` + `comment-modal.tsx`** — the focused-thread rework (§10), the single largest behavioral change; deliberately sequenced after the mechanical pkid/type work so this step is purely about UX/component structure, not simultaneously fighting type errors.
9. **New: comment/reply edit + delete** (§8, §11 GAPs) — genuinely new integration, sequenced after the thread UX exists since it needs the same focused-content state to know what's being edited/deleted.
10. **Repost rendering** (`quote-modal.tsx`, `quote-comment-modal.tsx`, repost sections of `post-card.tsx`) — depends on `original.kind` existing (step 1) and on comment/reply UI existing (step 8) to have somewhere to test a reposted reply.
11. **`hooks/use-profile-feeds.ts` + `user-profile-view.tsx`** (Replies tab) — sequenced last among functional work because of the open backend question in §17; doing this last maximizes the chance that question has been answered by the time it's reached.
12. **`docs/social/social-content-architecture.md`** — written from the actual resulting code, not before it exists.
13. **Validation** — typecheck, lint, test, build, manual QA against §18.

---

## 22. Pre-Implementation Sign-Off

- [x] Current architecture inspected (§2, plus prior-turn inspection)
- [x] All affected files identified (§20)
- [x] UUID migration scope identified (§2.7, §4)
- [x] Route migration scope identified (§5)
- [x] Write endpoint assumptions verified against decision #2 (§8)
- [x] SocialContent target model defined (§3)
- [x] UserReplyItem migration defined (§6, with open backend question flagged in §17 — not blocking, but not silently assumed resolved either)
- [x] Repost migration defined (§12)
- [x] Recursive reply architecture defined (§10, per decision #3 — focused-thread)
- [x] Query/cache architecture defined (§9)
- [x] Mutation/cache behavior defined (§11)
- [x] Permission behavior defined (§13)
- [x] Backend dependencies identified (§17)
- [x] Testing strategy defined (§18)
- [x] Debugging playbook created (§19)

**STATUS: READY FOR IMPLEMENTATION**, with two items you should be aware aren't fully closed rather than silently glossed over:

1. §17's profile-replies parent-preview question — I'll implement against the contract as given, but if the backend's actual response drops the parent-preview data, that specific tab's UX will regress until that's resolved with the backend team. Flagging now so it isn't a surprise later.
2. §8/§11's comment/reply edit-delete endpoints are genuinely new integration work, not verified against a live backend from this repo. First real call is the verification.

Everything else in this document reflects what was actually read in the repository, cross-referenced against your four decisions.

---

## Addendum — found during implementation, not during inspection

**`hooks/use-follow-actions.ts` was missed in the original "must change" list (§20).** It surfaced only via typecheck errors after the mutation-hook pass, not from reading. It patches `original_post`/`viewer_permissions`/`who_can_reply` on every cached post to keep an author's follow/mute/block state in sync across feeds and nested reposts (`patchAuthorFlagInFeeds`) — exactly the fields this migration renamed. The pkid it keys by is the *user's* pkid (out of scope, unchanged); only the Post-shaped fields it patches needed migrating. Fixed; noted here rather than silently folded into the original list, since the whole point of this document is to be an honest record of what was actually found and when.

This is worth calling out on its own terms: it means the original inspection's file search (grep for `pkid`, `parent_comment`, `reposted_object_type`, `original_post`, `OriginalComment`, `UserReplyItem`) was thorough but not literally exhaustive against every consumer of `original_post`/`viewer_permissions` — `use-follow-actions.ts` uses both without the word `reposted_object_type` appearing anywhere in it, so it didn't surface in that particular grep. Typecheck is what caught it. Any remaining files with a similar profile (touching `original_post`/`viewer_permissions`/`who_can_reply` without also using one of the originally-grepped terms) would be caught the same way as implementation continues.
