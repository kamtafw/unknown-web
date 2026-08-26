import { socialsApi } from "@/lib/socials/api"
import { toStandaloneContent } from "@/lib/socials/content-resolvers"
import { contentKeys, FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { CommentsResponse, SocialContent } from "@/types/socials/api"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"

export function usePostDetail(id: string | undefined) {
	const qc = useQueryClient()

	return useQuery({
		queryKey: contentKeys.detail(id!),
		queryFn: () => socialsApi.getPostDetail(id!).then((r) => r.data),
		staleTime: 1000 * 60 * 2,
		placeholderData: (): SocialContent | undefined => {
			for (const key of feedKeys.engagement()) {
				const cache = qc.getQueryData<FeedCache>(key)
				for (const page of cache?.pages ?? []) {
					for (const p of page.posts) {
						if (p.id === id) return p
						if (p.original && p.original.id === id) {
							return toStandaloneContent(p.original)
						}
					}
				}
			}
			return undefined
		},
	})
}

/** Single comment/reply fetch — closes the migration doc S~8 GAP, needed to
 * render a focused reply's own header when it's opened as its own thread
 * node (migration doc S~10). Shares `contentKeys.detail` with usePostDetail:
 * same identity namespace, different endpoint underneath. */
export function useContentDetail(id: string | undefined, enabled = true) {
	return useQuery({
		queryKey: contentKeys.detail(id!),
		queryFn: () => socialsApi.getContentDetail(id!).then((r) => r.data),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 2,
	})
}

/** Top-level comments of a post — direct children of a post id. */
export function usePostComments(postId: string | undefined) {
	return useInfiniteQuery({
		queryKey: contentKeys.child(postId!),
		queryFn: ({ pageParam }) => socialsApi.getPostComments(postId!, pageParam as number),
		initialPageParam: 1,
		getNextPageParam: (lastPage: CommentsResponse) =>
			lastPage.data.next ? lastPage.data.current + 1 : undefined,
		enabled: !!postId,
		staleTime: 1000 * 60,
	})
}

/** Direct replies of a comment or reply — same shape as usePostComments,
 * now paginated (the pre-migration `useCommentReplies` was single-page
 * only, which was part of what capped the thread UI at depth 1; see
 * migration doc S~2.2/S~10). Works identically whether `parentId` is a
 * top-level comment or a reply — the caller doesn't need to know or care. */
export function useContentReplies(parentId: string | undefined, enabled = true) {
	return useInfiniteQuery({
		queryKey: contentKeys.child(parentId!),
		queryFn: ({ pageParam }) => socialsApi.getContentReplies(parentId!, pageParam as number),
		initialPageParam: 1,
		getNextPageParam: (lastPage: CommentsResponse) =>
			lastPage.data.next ? lastPage.data.current + 1 : undefined,
		enabled: enabled && !!parentId,
		staleTime: 1000 * 60,
	})
}
