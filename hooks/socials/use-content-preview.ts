import { socialsApi } from "@/lib/socials/api"
import { contentKeys } from "@/lib/socials/query-keys"
import { SocialContent } from "@/types/socials/api"
import { useQueries } from "@tanstack/react-query"

/**
 * Batch-loads a preview for each id in `ids` and returns them as a
 * Map<id, SocialContent>. This is NOT a new representation of content — a
 * "preview" here is a real, full SocialContent, fetched through the exact
 * same single-content-detail path (getPostDetail / getContentDetail) that
 * already backs the focused-thread view (usePostDetail / useContentDetail).
 * It's cached under the same contentKeys.detail(id) namespace they use, so
 * a parent already loaded elsewhere in the session costs nothing extra.
 *
 * Bounded to whatever `ids` passed in — this is called with only the current
 * page's ids (usually 10-25), not the whole replies list, so this stays a
 * "batch the visible page" fetch rather than an N+1-per-scroll one.
 *
 * If the backend later adds an embedded preview field directly on the
 * reply object (parent_preview / post_preview), this hook becomes
 * unnecessary and the batching goes away entirely — that's the more
 * optimal long-term fix, this is the efficient one for now.
 */
function useContentPreviews(
	ids: (string | null | undefined)[],
	fetcher: (id: string) => Promise<{ data: SocialContent }>,
): Map<string, SocialContent> {
	const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)))

	const results = useQueries({
		queries: uniqueIds.map((id) => ({
			queryKey: contentKeys.detail(id),
			queryFn: () => fetcher(id).then((r) => r.data),
			staleTime: 1000 * 60 * 5,
			// a preview that fails to load shouldn't retry aggressively or
			// surface an error state — the reply itself still renders fine
			// without it, this tier is a nice-to-have
			retry: 1,
		})),
	})

	const map = new Map<string, SocialContent>()
	results.forEach((r, i) => {
		if (r.data) map.set(uniqueIds[i], r.data)
	})
	return map
}

/** Preview for a reply's immediate parent — always a comment or reply,
 * never a post, so this always goes through getContentDetail. */
export function useParentPreviews(parentIds: (string | null | undefined)[]) {
	return useContentPreviews(parentIds, socialsApi.getContentDetail)
}

/** Preview for a reply's root post. Separate from useParentPreviews because
 * it hits a different endpoint (getPostDetail vs getContentDetail) even
 * though both write into the same contentKeys.detail cache. */
export function usePostPreviews(postIds: (string | null | undefined)[]) {
	return useContentPreviews(postIds, socialsApi.getPostDetail)
}
