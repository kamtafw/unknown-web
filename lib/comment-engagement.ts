import { Comment, CommentsResponse } from "@/types/api"
import { InfiniteData, QueryClient } from "@tanstack/react-query"

type CommentsCache = InfiniteData<CommentsResponse>
type RepliesCache = CommentsResponse

/**
 * patches a comment by id wherever it currently lives — a top-level comment
 * list page, or a mounted replies cache — keeping like/repost state in sync
 * regardless of which view (post detail thread vs. an expanded reply list)
 * triggered the mutation
 */
export function patchCommentEverywhere(qc: QueryClient, id: string, patch: Partial<Comment>) {
	qc.setQueriesData<CommentsCache>({ queryKey: ["post", "comments"] }, (old) => {
		if (!old) return old
		return {
			...old,
			pages: old.pages.map((page) => ({
				...page,
				data: {
					...page.data,
					results: page.data.results.map((c) => (c.id === id ? { ...c, ...patch } : c)),
				},
			})),
		}
	})

	qc.setQueriesData<RepliesCache>({ queryKey: ["comment", "replies"] }, (old) => {
		if (!old) return old
		return {
			...old,
			data: {
				...old.data,
				results: old.data.results.map((c) => (c.id === id ? { ...c, ...patch } : c)),
			},
		}
	})
}

/** reads current like/repost state for a comment before optimistically flipping it */
export function findComment(qc: QueryClient, id: string): Comment | undefined {
	const listEntries = qc.getQueriesData<CommentsCache>({ queryKey: ["post", "comments"] })
	for (const [, data] of listEntries) {
		for (const page of data?.pages ?? []) {
			const found = page.data.results.find((c) => c.id === id)
			if (found) return found
		}
	}

	const replyEntries = qc.getQueriesData<RepliesCache>({ queryKey: ["comment", "replies"] })
	for (const [, data] of replyEntries) {
		const found = data?.data.results.find((c) => c.id === id)
		if (found) return found
	}

	return undefined
}
