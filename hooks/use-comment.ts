import { socialApi } from "@/lib/api"
import { AddCommentPayload, Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { commentKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

function incrementCommentCount(old: FeedCache | undefined, pkid: number): FeedCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.map((p) =>
				p.pkid === pkid ? { ...p, post_comment_count: p.post_comment_count + 1 } : p,
			),
		})),
	}
}

export function useAddComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: AddCommentPayload) => socialApi.addComment(payload),

		onSuccess: (_data, variables) => {
			const pkid = variables.post

			// patch comment count in every feed cache
			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => incrementCommentCount(old, pkid))

			// invalidate the comments list so the detail view refreshes
			qc.invalidateQueries({ queryKey: commentKeys.list(pkid) })
		},
	})
}
