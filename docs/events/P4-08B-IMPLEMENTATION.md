# P4-08B — Live Comment Query and Submit Hooks

**Status:** Implemented on `feat/events-p4-08-live-comments-reactions`; owner-side verification pending.  
**Scope:** React Query infinite-read hook, page flattening/deduplication, and create-comment mutation/cache insertion. No socket integration, reaction cache handling, or UI is included.

## Read hook

`useLiveSessionComments(sessionId, limit = 50)`:

- Uses `liveSessionApi.getCommentsPage` and `liveSessionKeys.comments`.
- The default page size is 50, matching the reviewed mobile client.
- The key is scoped by account ID, login generation, session ID and page size.
- The query is disabled for an invalid session ID or when there is no authenticated account.
- `getNextPageParam` advances only when the last response's `hasNext` is true. Page length and comment count are not used to infer continuation; an empty page with a next link remains pageable.
- Flattening preserves backend page order and keeps the first occurrence of each numeric comment ID. The client does not sort by `createdAt`; ordering remains an unresolved backend contract.
- Initial, next-page and refresh errors are distinguishable. Previously loaded pages remain visible after a later-page failure.
- 401, 403, 404 and 429 are not automatically retried. Other errors receive at most one retry.
- No polling or socket subscription is introduced here; realtime synchronization belongs to P4-08C.

## Submit hook

`usePostLiveSessionComment(sessionId, limit = 50)`:

- Trims input and rejects whitespace-only content. It does not impose an unverified character limit.
- Prevents concurrent submissions from the same hook instance, including calls in the same render tick.
- Uses the canonical comment returned by the create endpoint. It does not fabricate an optimistic comment.
- If the matching comments query is already loaded, inserts the server response at the end of the last loaded page, matching the reviewed mobile cache behavior.
- Checks every loaded page for the returned comment ID before insertion, preventing duplicate rows if the same comment has already arrived through another path.
- Does not create a synthetic cache entry when comments have not been loaded, and does not refetch after a successful create.
- Captures account, login-generation, session and page-size scope in mutation variables. If the account changes while the request is in flight, the response can update only the original account's cache key.

## Files

- `hooks/events/use-live-session-comments.ts`
- `hooks/events/use-live-session-comments.test.tsx`

## Verification

The focused test suite covers page-size default, next-link pagination, empty pages with next links, duplicate IDs across pages, backend ordering, later-page error retention, invalid session/account disabling, query-key isolation, canonical response insertion, duplicate prevention, no-cache behavior, blank input, concurrent-submit protection, account switching during an in-flight mutation, and failure without cache mutation.

Owner-side checks:

```powershell
npx vitest run hooks/events/use-live-session-comments.test.tsx
npx tsc --noEmit
npx eslint hooks/events/use-live-session-comments.ts hooks/events/use-live-session-comments.test.tsx
git diff --check
```

The authoring environment committed through the GitHub repository API and did not execute these checks. No live backend request is claimed.
