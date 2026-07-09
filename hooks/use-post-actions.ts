import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { findEngagementEntity, patchEngagementInFeeds } from "@/lib/post-engagement"
import { toStandalonePost } from "@/lib/post-helpers"
import { toast } from "@/lib/toast"
import { Post, UpdatePostPayload, UpdatePostResponseData } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { postDetailKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

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
	qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => removePost(old, postId))
	qc.setQueryData<FeedCache>(feedKeys.following, (old) => removePost(old, postId))
	qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => removePost(old, postId))
}

function restoreSnapshot(qc: ReturnType<typeof useQueryClient>, snapshot?: FeedSnapshot) {
	if (!snapshot) return
	if (snapshot.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, snapshot.forYou)
	if (snapshot.following) qc.setQueryData<FeedCache>(feedKeys.following, snapshot.following)
	if (snapshot.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, snapshot.bookmarks)
}

function patchIsPinned(
	old: FeedCache | undefined,
	id: string,
	is_pinned: boolean,
): FeedCache | undefined {
	if (!old) return old
	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.map((p) => (p.id === id ? { ...p, is_pinned } : p)),
		})),
	}
}

function mapUpdateResponseToPatch(data: UpdatePostResponseData): Partial<Post> {
	return {
		content_text: data.content_text,
		who_can_see: data.who_can_see,
		who_can_reply: data.who_can_reply,
		updated_at: data.updated_at,
		post_media: data.uploaded_media.map((url) => ({ external_url: url })),
		post_location: data.post_location,
		post_hashtagged: data.post_hashtagged,
	}
}

export function useUpdatePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ pkid, payload }: { pkid: number; payload: UpdatePostPayload }) =>
			socialApi.updatePost(pkid, payload),

		onSuccess: (res, { pkid }) => {
			if (!res.success) return

			const patch = mapUpdateResponseToPatch(res.data)
			const id = res.data.id

			patchEngagementInFeeds(qc, id, patch)

			const detailKey = postDetailKeys.detail(pkid)
			qc.setQueryData<Post>(detailKey, (old) => (old ? { ...old, ...patch } : old))

			toast.success("Post updated successfully.")
		},

		onError: (error) => showMutationErrorToast(error, "Failed to update post. Please try again."),
	})
}

export function useDeletePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (pkid: number) => socialApi.deletePost(pkid),

		onMutate: async (pkid) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshot: FeedSnapshot = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
			}

			const current = findEngagementEntity(qc, { pkid })

			if (current) removePostFromAllFeeds(qc, current.id)

			return snapshot
		},

		onSuccess: (_data, pkid) => {
			qc.removeQueries({ queryKey: postDetailKeys.detail(pkid) })
			toast.success("Post deleted")
		},

		onError: (error, _pkid, snapshot) => {
			restoreSnapshot(qc, snapshot)
			showMutationErrorToast(error, "Failed to delete post. Please try again.")
		},
	})
}

export function useTogglePinnedPost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialApi.togglePinnedPost(id),

		onSuccess: (res, id) => {
			if (!res.success) return
			const { is_pinned, message } = res.data

			const applyPatch = (old: FeedCache | undefined) => patchIsPinned(old, id, is_pinned)
			qc.setQueryData<FeedCache>(feedKeys.forYou, applyPatch)
			qc.setQueryData<FeedCache>(feedKeys.following, applyPatch)
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, applyPatch)

			qc.setQueriesData<Post>({ queryKey: ["post", "detail"] }, (old) =>
				old && old.id === id ? { ...old, is_pinned } : old,
			)

			toast.success(
				message ?? (is_pinned ? "Post pinned to profile" : "Post unpinned from profile"),
			)
		},

		onError: (error) => {
			showMutationErrorToast(error, "Failed to update pin status. Please try again.")
		},
	})
}

export function useLikePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialApi.likePost({ post: id }),
		onMutate: async (id) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
				detail: undefined as Post | undefined,
				pkid: undefined as number | undefined,
			}

			const current = findEngagementEntity(qc, { id })
			const wasLiked = current?.liked_by_me ?? false
			const patch: Partial<Post> = {
				liked_by_me: !wasLiked,
				post_like_count: (current?.post_like_count ?? 0) + (wasLiked ? -1 : 1),
			}

			patchEngagementInFeeds(qc, id, patch)

			if (current) {
				const pkid = typeof current.pkid === "number" ? current.pkid : Number(current.pkid)
				const detailKey = postDetailKeys.detail(pkid)
				await qc.cancelQueries({ queryKey: detailKey })
				const detailPrev = qc.getQueryData<Post>(detailKey)

				snapshots.detail = detailPrev
				snapshots.pkid = pkid

				if (detailPrev) qc.setQueryData<Post>(detailKey, { ...detailPrev, ...patch })
			}

			return snapshots
		},

		onError: (_err, _id, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following, ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarks)
			if (ctx?.detail && ctx.pkid) qc.setQueryData(postDetailKeys.detail(ctx.pkid), ctx.detail)
		},
	})
}

export function useBookmarkPost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialApi.bookmarkPost({ post: id }),
		onMutate: async (id) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
				detail: undefined as Post | undefined,
				pkid: undefined as number | undefined,
			}

			const current = findEngagementEntity(qc, { id })
			const wasBookmarked = current?.bookmarked_by_me ?? false
			const patch = { bookmarked_by_me: !wasBookmarked }

			patchEngagementInFeeds(qc, id, patch)

			if (wasBookmarked) {
				qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => {
					if (!old) return old
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							posts: page.posts.filter((p) => p.id !== id),
						})),
					}
				})
			} else if (current) {
				qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => {
					if (!old) return old
					const bookmarkedPost = { ...toStandalonePost(current), bookmarked_by_me: true }
					return {
						...old,
						pages: old.pages.map((page, i) =>
							i === 0 ? { ...page, posts: [bookmarkedPost, ...page.posts] } : page,
						),
					}
				})
			}

			if (current) {
				const pkid = typeof current.pkid === "number" ? current.pkid : Number(current.pkid)
				const detailKey = postDetailKeys.detail(pkid)
				await qc.cancelQueries({ queryKey: detailKey })
				const detailPrev = qc.getQueryData<Post>(detailKey)
				snapshots.detail = detailPrev
				snapshots.pkid = pkid
				if (detailPrev) qc.setQueryData<Post>(detailKey, { ...detailPrev, ...patch })
			}

			return snapshots
		},

		onError: (_err, _id, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following, ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarks)
			if (ctx?.detail && ctx.pkid) qc.setQueryData(postDetailKeys.detail(ctx.pkid), ctx.detail)
		},
	})
}
