import { socialApi } from "@/lib/api"
import { CommentsResponse, Post, PostDetail } from "@/types/api"
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

export const postDetailKeys = {
	detail: (pkid: number) => ["post", "detail", pkid] as const,
}

export const commentKeys = {
	list: (pkid: number) => ["post", "comments", pkid] as const,
	replies: (commentId: string) => ["comment", "replies", commentId] as const,
}

export function usePostDetail(pkid: number) {
	const qc = useQueryClient()

	return useQuery({
		queryKey: postDetailKeys.detail(pkid),
		queryFn: () => socialApi.getPostDetail(pkid).then((r) => r.data),
		staleTime: 1000 * 60 * 2,
		// seeds from feed cache → post renders immediately, comments load in background
		// isPlaceholderData will be true until real fetch completes
		placeholderData: (): PostDetail | undefined => {
			for (const key of [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]) {
				const cache = qc.getQueryData<FeedCache>(key)
				const post = cache?.pages.flatMap((p) => p.posts).find((p) => p.pkid === pkid)
				if (post) {
					return {
						...post,
						post_comment: [],
						post_bookmarked: [],
						post_liked: [],
						repost: [],
						post_hashtagged: post.post_hashtagged ?? [],
					} as unknown as PostDetail
				}
			}
		},
	})
}

export function usePostComments(pkid: number | undefined) {
	return useInfiniteQuery({
		queryKey: commentKeys.list(pkid!),
		queryFn: ({ pageParam }) => socialApi.getPostComments(pkid!, pageParam as number),
		initialPageParam: 1,
		getNextPageParam: (lastPage: CommentsResponse) =>
			lastPage.data.next ? lastPage.data.current + 1 : undefined,
		enabled: !!pkid,
		staleTime: 1000 * 60,
	})
}

export function useCommentReplies(commentId: string, enabled: boolean) {
	return useQuery({
		queryKey: commentKeys.replies(commentId),
		queryFn: () => socialApi.getCommentReplies(commentId),
		enabled,
		staleTime: 1000 * 60,
	})
}
