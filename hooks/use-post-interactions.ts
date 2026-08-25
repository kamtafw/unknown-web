import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { toast } from "@/lib/toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface FeedSnapshot {
	forYou?: FeedCache
	following?: FeedCache
	bookmarks?: FeedCache
}

function removePost(old: FeedCache | undefined, postId: string): FeedCache | undefined {
	if (!old) return old
	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.filter((p) => p.id !== postId),
		})),
	}
}

function removePostFromAllFeeds(qc: ReturnType<typeof useQueryClient>, postId: string) {
	qc.setQueryData<FeedCache>(feedKeys.forYou(), (old) => removePost(old, postId))
	qc.setQueryData<FeedCache>(feedKeys.following(), (old) => removePost(old, postId))
	qc.setQueryData<FeedCache>(feedKeys.bookmarks(), (old) => removePost(old, postId))
}

function restoreSnapshot(qc: ReturnType<typeof useQueryClient>, snapshot?: FeedSnapshot) {
	if (!snapshot) return
	if (snapshot.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou(), snapshot.forYou)
	if (snapshot.following) qc.setQueryData<FeedCache>(feedKeys.following(), snapshot.following)
	if (snapshot.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks(), snapshot.bookmarks)
}

/**
 * called from the "Undo" action on the not-interested toast; restores the
 * post in every feed cache right away for instant feedback, then tells the
 * server to actually lift the not-interested mark; if that call fails, the
 * post is removed again so the UI doesn't drift from what the backend has
 */
export function useUndoNotInterested() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ postId }: { postId: string; snapshot?: FeedSnapshot }) =>
			socialApi.undoNotInterested(postId),

		onMutate: ({ snapshot }) => restoreSnapshot(qc, snapshot),

		onError: (error, { postId }) => {
			qc.setQueryData<FeedCache>(feedKeys.forYou(), (old) => removePost(old, postId))
			qc.setQueryData<FeedCache>(feedKeys.following(), (old) => removePost(old, postId))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks(), (old) => removePost(old, postId))
			showMutationErrorToast(error, "Couldn't undo — this post will stay hidden.")
		},
	})
}

export function useNotInterested() {
	const qc = useQueryClient()
	const undoNotInterested = useUndoNotInterested()

	return useMutation({
		mutationFn: (id: string) => socialApi.notInterested({ post_id: id }),

		onMutate: async (id): Promise<FeedSnapshot> => {
			await Promise.all(feedKeys.engagement().map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshot: FeedSnapshot = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				following: qc.getQueryData<FeedCache>(feedKeys.following()),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks()),
			}

			removePostFromAllFeeds(qc, id)

			return snapshot
		},

		onSuccess: (_data, id, snapshot) => {
			toast.info("You'll see fewer posts like this", {
				action: {
					label: "Undo",
					onClick: () => undoNotInterested.mutate({ postId: id, snapshot }),
				},
			})
		},

		onError: (error, _id, snapshot) => {
			restoreSnapshot(qc, snapshot)
			showMutationErrorToast(error, "Couldn't process that. Please try again.")
		},
	})
}

export function useRequestCommunityNote() {
	return useMutation({
		mutationFn: (payload: { post: string; reason?: string }) =>
			socialApi.requestCommunityNote(payload),
		onError: (error) => {
			showMutationErrorToast(error, "Couldn't submit your request. Please try again.")
		},
	})
}
