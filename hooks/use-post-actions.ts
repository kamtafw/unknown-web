import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import {
	findEngagementEntity,
	findEngagementEntityAnywhere,
	patchEngagementEverywhere,
	patchEngagementInFeeds,
} from "@/lib/post-engagement"
import { toStandalonePost } from "@/lib/post-helpers"
import { toast } from "@/lib/toast"
import { Post,UpdatePostPayload,UpdatePostResponseData } from "@/types/api"
import { InfiniteData,useMutation,useQueryClient } from "@tanstack/react-query"
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

interface DeletePostVars {
	pkid: number
	/** the deleted post's own id — pass directly when known; falls back to a
	 * cache lookup by pkid when the caller doesn't have it (e.g. "Undo repost"
	 * fired from the original post's card, which only knows my_repost_pkid) */
	id?: string
	/** set when the post being deleted is itself a repost, so the post it
	 * reposted gets its repost_count (and shaded state, if this was the
	 * bare/unquoted repost) rolled back everywhere it's cached */
	originalPost?: { id: string; wasBareRepost: boolean }
}

export function useDeletePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ pkid }: DeletePostVars) => socialApi.deletePost(pkid),

		onMutate: async ({ pkid, id, originalPost }) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshot: FeedSnapshot = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
			}

			let originalRevert: {
				id: string
				repostCount: number
				myRepostPkid: number | null
			} | null = null

			if (originalPost) {
				const current = findEngagementEntityAnywhere(qc, { id: originalPost.id })
				const prevCount = current?.repost_count ?? 0
				originalRevert = {
					id: originalPost.id,
					repostCount: prevCount,
					myRepostPkid: current?.my_repost_pkid ?? null,
				}

				const patch: Partial<Post> = { repost_count: Math.max(0, prevCount - 1) }
				if (originalPost.wasBareRepost) patch.my_repost_pkid = null
				patchEngagementEverywhere(qc, originalPost.id, patch)
			}

			const resolvedId = id ?? findEngagementEntity(qc, { pkid })?.id
			if (resolvedId) removePostFromAllFeeds(qc, resolvedId)

			return { snapshot, originalRevert }
		},

		onSuccess: (_data, { pkid, originalPost }) => {
			qc.removeQueries({ queryKey: postDetailKeys.detail(pkid) })
			toast.success(originalPost?.wasBareRepost ? "Repost removed" : "Post deleted")
		},

		onError: (error, _vars, ctx) => {
			restoreSnapshot(qc, ctx?.snapshot)
			if (ctx?.originalRevert) {
				patchEngagementEverywhere(qc, ctx.originalRevert.id, {
					repost_count: ctx.originalRevert.repostCount,
					my_repost_pkid: ctx.originalRevert.myRepostPkid,
				})
			}
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

			// profile page tabs (posts / media / liked / reposts) share the exact
			// same { pages: [{ posts: Post[] }] } shape as the main feeds — "replies"
			// is excluded, its pages are shaped { replies: UserReplyItem[] } instead
			;(["posts", "media", "liked", "reposts"] as const).forEach((kind) => {
				qc.setQueriesData<FeedCache>({ queryKey: ["profile-feed", kind] }, applyPatch)
			})

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
