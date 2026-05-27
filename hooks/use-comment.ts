import { socialApi } from "@/lib/api"
import { AddCommentPayload, Comment, Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { commentKeys, postDetailKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>
type CommentsCache = InfiniteData<{ comments: Comment[]; nextPage: string | null }>

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

function prependComment(qc: ReturnType<typeof useQueryClient>, pkid: number, comment: Comment) {
	const key = commentKeys.list(pkid)

	console.log("commentKey:", key)

	qc.setQueryData<CommentsCache>(key, (old) => {
		console.log("OLD:", JSON.stringify(old))
		if (!old) return
		return {
			...old,
			pages: old.pages.map((page, i) =>
				i === 0 ? { ...page, comments: [comment, ...page.comments] } : page,
			),
		}
	})
}

export function useAddComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: AddCommentPayload) => socialApi.addComment(payload),

		onSuccess: (data, vars) => {
			const pkid = vars.post
			const detailKey = postDetailKeys.detail(pkid)

			const newComment: Comment = {
				...data.data,
				like_count: data.data.like_count ?? 0,
				replies_count: data.data.replies_count ?? 0,
				repost_count: data.data.repost_count ?? 0,
				liked_by_me: data.data.liked_by_me ?? false,
				reposted_by_me: data.data.reposted_by_me ?? false,
			}

			// patch comment count in every feed cache
			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => incrementCommentCount(old, pkid))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => incrementCommentCount(old, pkid))

			qc.setQueryData<Post>(detailKey, (old) =>
				old ? { ...old, post_comment_count: old.post_comment_count + 1 } : old,
			)
			console.log("NEW COMMENT:", JSON.stringify(newComment))
			prependComment(qc, pkid, newComment)
		},
	})
}
