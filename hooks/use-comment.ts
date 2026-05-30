import { socialApi } from "@/lib/api"
import { AddCommentPayload, Comment, CommentsResponse, Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { commentKeys, postDetailKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>
type CommentsCache = InfiniteData<CommentsResponse>
type RepliesCache = CommentsResponse

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

export function usePrependComment() {
	const qc = useQueryClient()

	return (pkid: number, comment: Comment) => {
		const key = commentKeys.list(pkid)

		qc.setQueryData<CommentsCache>(key, (old) => {
			if (!old) return
			return {
				...old,
				pages: old.pages.map((page, i) =>
					i === 0
						? { ...page, data: { ...page.data, results: [comment, ...page.data.results] } }
						: page,
				),
			}
		})
	}
}

export function usePrependReply() {
	const qc = useQueryClient()

	return (id: string, pkid: number, reply: Comment) => {
		const repliesKey = commentKeys.replies(id)
		const commentKey = commentKeys.list(pkid)

		qc.setQueryData<RepliesCache>(repliesKey, (old) => {
			if (!old) return
			return {
				...old,
				data: { ...old.data, results: [reply, ...old.data.results] },
			}
		})

		qc.setQueryData<CommentsCache>(commentKey, (old) => {
			if (!old) return
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					data: {
						...page.data,
						results: page.data.results.map((c) =>
							c.id === id ? { ...c, replies_count: c.replies_count + 1 } : c,
						),
					},
				})),
			}
		})
	}
}
export function useAddComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: AddCommentPayload) => socialApi.addComment(payload),

		onSuccess: (_data, vars) => {
			const pkid = vars.post
			const detailKey = postDetailKeys.detail(pkid)

			// patch comment count in every feed cache
			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => incrementCommentCount(old, pkid))

			qc.setQueryData<Post>(detailKey, (old) =>
				old ? { ...old, post_comment_count: old.post_comment_count + 1 } : old,
			)
		},
	})
}
