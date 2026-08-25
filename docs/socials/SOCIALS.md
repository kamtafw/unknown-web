# SOCIALS.md — Unified Content Migration

## Overview

Posts, Comments, and Replies were three separate, inconsistently-shaped objects
(mixed pkid/UUID identity, divergent field names). Migrated to one canonical
`SocialContent` shape shared by all three, enabling arbitrarily-deep threads
and one engagement/cache system instead of two.

## Core Contract

- `kind: "post" | "comment" | "reply"`, `id` (UUID), `post_id` (root),
  `parent_id` (direct parent — not root, required for reply-to-reply).
- `Post`/`Comment` are type aliases of `SocialContent`, not separate shapes.
- Nested state objects: `metrics`, `viewer`, `flags`, `permissions` —
  replaces flat pre-migration fields.
- `original` (repost target) is itself a full `SocialContent`; never has its
  own `original` (no double-nesting).
- Confidence levels tagged per field during inspection: CONTRACTED /
  OBSERVED / INFERRED / UNVERIFIED — used to flag assumptions before they
  became bugs (see `my_repost_id` below).

## Architecture Decisions

- **`applyContentPatch`**: shallow-merges only within `metrics/viewer/flags/
  permissions`; naive spread on a nested-object patch would silently wipe
  sibling fields (e.g. patching `reposts` would erase `likes`).
- **`patchEngagementEverywhere`**: single entry point sweeping feed caches,
  open detail queries, and open children lists. Trade-off: O(n) scan across
  mounted queries per patch vs. a normalized/indexed store — accepted for
  simplicity given current cache sizes; revisit if feed caches grow large.
- **Focused-thread UX** (`focusStack`/`ThreadFocusPanel`) replaces hard
  depth-1 comment cap, enabled directly by `parent_id` being depth-agnostic.
- Query-key registry (`contentKeys`, `feedKeys`, `profileFeedKeys`)
  consolidated from 9 duplicate local definitions across hook files.
- Children-list *key* is unified (post's comments and comment's replies
  share key shape); the *fetcher* is intentionally NOT unified — backend
  genuinely exposes two different read endpoints.

## Reorg Fallout (found & fixed)

- Namespacing into `hooks/socials/`, `lib/socials/`, `types/socials/` broke
  import paths across 18 unrelated auth/account files (over-broad path
  redirect) — fixed.
- `comment/[id]` route was missing post-reorg — added.
- `UserProfileView` had been fully commented out as a build-error
  workaround — rebuilt from scratch.

## Dedup Pass

- Consolidated `getInitials`, `formatCount`, `FeedCache` type, and composer
  logic (emoji picker, hashtag extraction, media upload, location picker)
  from 7–13 duplicate copies each into shared files.
- Found 2 files still typed against dead pre-migration types (would've
  broken silently) — corrected as a side effect of consolidation.
- Found 2 genuine behavior differences between duplicated copies —
  deliberately NOT silently merged; flagged as open decisions (see below).

## Profile pkid → UUID Migration

- Backend switched user-profile lookup to UUID. Updated profile route,
  profile view, every profile-nav call site.
- `AuthorHoverCard` needs both identifiers: UUID (profile fetch/nav) + pkid
  (follow/mute/block, which backend did NOT move to UUID).
- Fixed cache bug: "mark user followed everywhere" couldn't locate cache
  entries once it only had the old pkid to key on.
- Known limitation: following from a context with zero cached content/
  profile for that user (e.g. cold friend-suggestion) skips that one cache
  write — not wrong, just not instant; self-corrects on next real fetch.

## Post-Migration Bugs Found & Fixed

1. **Repost `onSuccess` crash after 201**: read an UNVERIFIED, never-real
   `original_post.reposts[0].id` path instead of the contract's flat
   `repost_id`. Threw before `invalidateQueries` ran, stranding the feed
   mid-optimistic-removal until hard refresh. Fixed to read `repost_id`.
2. **Repost button state**: `my_repost_id` is frontend/session-only —
   confirmed with backend that it is never populated on GET. Switched
   primary "have I reposted" signal to contract-guaranteed `viewer.reposted`
   (matches how `viewer.liked`/`viewer.bookmarked` already work);
   `my_repost_id` retained only as a same-session id source for delete.
3. **"Undo repost" no-ops**: `ActionBar` receives the *resolved* engagement
   entity (original content for bare reposts), so `post.id` there is never
   the repost's own id. Added `myRepostId`, sourced only from the specific
   case where it's real backend data — the unresolved card IS the viewer's
   own bare repost. Falls back to session `my_repost_id` when available.
   Remaining gap: undoing from a bare view of a repost made in an earlier
   session, with no repost card on screen — no safe id exists (backend gap).
4. **Follow button shown on own `AuthorHoverCard`**: `isOwnProfile` compared
   `SocialContentUser.id` (UUID) against `FullUser.id`, an unverified/
   possibly-absent field. Switched to `pkid` comparison, matching the
   own-check pattern already used elsewhere (`PostCard`, mutations).
5. **Hover states dead in Brave, fine in Edge**: Tailwind v4's default
   `hover:` variant gates on `@media (hover: hover)`; Brave reports that
   `false` on this machine (fingerprinting-normalization or touch-detection
   difference — not app code). Fix identified (`@custom-variant hover
   (&:hover)` in `globals.css`) but **deferred, not integrated**.

## Deferred / Open Issues

- Backend never returns a repost identifier on GET — undo is unreliable
  outside the creating session / off the exact repost card.
- Embedded `author` object lacks reliable `pkid` on some responses — dead
  profile-link guard added frontend-side; backend gap unconfirmed/unfixed.
- Comment/reply edit & delete: backend routes exist, no UI wired yet.
- Reposting a reply: implemented, never tested against live backend.
- `hooks/use-post-stats.ts` still imports the old pre-migration API module.
- Hashtag format inconsistency: 2 composer files strip `#`/keep case, 5
  lowercase/keep `#` — both hit backend as-is; needs a backend-informed
  decision, not resolved.
- Tailwind v4 hover-variant override — written, not yet integrated
  (trade-off: restores hover on Brave/desktop but reintroduces "sticky
  hover" risk on genuine touchscreens; acceptable given desktop-first use).
- No automated tests exist for any social-content code (pre-existing gap).

## Proposed, Not Implemented

- Split `post-card.tsx` / `post-detail.tsx` / `user-profile-view.tsx` by
  responsibility (display vs. action menus vs. page orchestration).
- Move follow/mute/block/post-interactions/profile-feeds hooks into
  `hooks/socials/` for namespace consistency.
- Optional `(dashboard)/(social)/` route group — organizational only, no
  URL changes.