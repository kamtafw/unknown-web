import { showMutationErrorToast } from "@/lib/api-error"
import { socialsApi } from "@/lib/socials/api"
import {
	applyContentPatch,
	findEngagementEntity,
	findEngagementEntityAnywhere,
	patchEngagementEverywhere,
	patchEngagementInFeeds,
	SocialContentPatch,
} from "@/lib/socials/content-engagement"
import { toStandaloneContent } from "@/lib/socials/content-resolvers"
import { contentKeys, feedKeys } from "@/lib/socials/query-keys"
import { toast } from "@/lib/toast"
import { SocialContent, UpdatePostPayload } from "@/types/socials/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"

type FeedCache = InfiniteData<{ posts: SocialContent[]; nextPage: string | null }>

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

function patchIsPinned(
	old: FeedCache | undefined,
	id: string,
	pinned: boolean,
): FeedCache | undefined {
	if (!old) return old
	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.map((p) => (p.id === id ? applyContentPatch(p, { flags: { pinned } }) : p)),
		})),
	}
}

export function useUpdatePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) =>
			socialsApi.updatePost(id, payload),

		onSuccess: (res) => {
			if (!res.success) return

			// response is already a full canonical SocialContent — no more
			// hand-mapping a separate UpdatePostResponseData shape onto Post
			const updated = res.data

			patchEngagementInFeeds(qc, updated.id, updated)
			qc.setQueryData<SocialContent>(contentKeys.detail(updated.id), updated)

			toast.success("Post updated successfully.")
		},

		onError: (error) => showMutationErrorToast(error, "Failed to update post. Please try again."),
	})
}

interface DeletePostVars {
	id: string
	/** set when the post being deleted is itself a repost, so the post it
	 * reposted gets its repost count (and shaded state, if this was the
	 * bare/unquoted repost) rolled back everywhere it's cached */
	originalPost?: { id: string; wasBareRepost: boolean }
}

export function useDeletePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ id }: DeletePostVars) => socialsApi.deletePost(id),

		onMutate: async ({ id, originalPost }) => {
			await Promise.all(feedKeys.engagement().map((key) => qc.cancelQueries({ queryKey: key })))

			const snapshot: FeedSnapshot = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				following: qc.getQueryData<FeedCache>(feedKeys.following()),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks()),
			}

			let originalRevert: {
				id: string
				repostCount: number
				myRepostId: string | null
			} | null = null

			if (originalPost) {
				const current = findEngagementEntityAnywhere(qc, originalPost.id)
				const prevCount = current?.metrics.reposts ?? 0
				originalRevert = {
					id: originalPost.id,
					repostCount: prevCount,
					myRepostId: current?.my_repost_id ?? null,
				}

				const patch: SocialContentPatch = { metrics: { reposts: Math.max(0, prevCount - 1) } }
				if (originalPost.wasBareRepost) patch.my_repost_id = null
				patchEngagementEverywhere(qc, originalPost.id, patch)
			}

			removePostFromAllFeeds(qc, id)

			return { snapshot, originalRevert }
		},

		onSuccess: (_data, { id, originalPost }) => {
			qc.removeQueries({ queryKey: contentKeys.detail(id) })
			toast.success(originalPost?.wasBareRepost ? "Repost removed" : "Post deleted")
		},

		onError: (error, _vars, ctx) => {
			restoreSnapshot(qc, ctx?.snapshot)
			if (ctx?.originalRevert) {
				patchEngagementEverywhere(qc, ctx.originalRevert.id, {
					metrics: { reposts: ctx.originalRevert.repostCount },
					my_repost_id: ctx.originalRevert.myRepostId,
				})
			}
			showMutationErrorToast(error, "Failed to delete post. Please try again.")
		},
	})
}

export function useTogglePinnedPost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialsApi.togglePinnedPost(id),

		onSuccess: (res, id) => {
			if (!res.success) return
			const { is_pinned, message } = res.data

			const applyPatch = (old: FeedCache | undefined) => patchIsPinned(old, id, is_pinned)
			qc.setQueryData<FeedCache>(feedKeys.forYou(), applyPatch)
			qc.setQueryData<FeedCache>(feedKeys.following(), applyPatch)
			qc.setQueryData<FeedCache>(feedKeys.bookmarks(), applyPatch)

			// profile page tabs (posts / media / liked / reposts) share the exact
			// same { pages: [{ posts: SocialContent[] }] } shape as the main feeds
			;(["posts", "media", "liked", "reposts"] as const).forEach((kind) => {
				qc.setQueriesData<FeedCache>({ queryKey: ["profile-feed", kind] }, applyPatch)
			})

			qc.setQueriesData<SocialContent>({ queryKey: contentKeys.details() }, (old) =>
				old && old.id === id ? applyContentPatch(old, { flags: { pinned: is_pinned } }) : old,
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
		mutationFn: (id: string) => socialsApi.likeContent({ type: "post", entity_uuid: id }),
		onMutate: async (id) => {
			await Promise.all(feedKeys.engagement().map((key) => qc.cancelQueries({ queryKey: key })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				following: qc.getQueryData<FeedCache>(feedKeys.following()),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks()),
				detail: undefined as SocialContent | undefined,
			}

			const current = findEngagementEntity(qc, id)
			const wasLiked = current?.viewer.liked ?? false
			const patch: SocialContentPatch = {
				viewer: { liked: !wasLiked },
				metrics: { likes: (current?.metrics.likes ?? 0) + (wasLiked ? -1 : 1) },
			}

			patchEngagementInFeeds(qc, id, patch)

			if (current) {
				const detailKey = contentKeys.detail(current.id)
				await qc.cancelQueries({ queryKey: detailKey })
				const detailPrev = qc.getQueryData<SocialContent>(detailKey)
				snapshots.detail = detailPrev
				if (detailPrev)
					qc.setQueryData<SocialContent>(detailKey, applyContentPatch(detailPrev, patch))
			}

			return snapshots
		},

		onError: (_err, id, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou(), ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following(), ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks(), ctx.bookmarks)
			if (ctx?.detail) qc.setQueryData(contentKeys.detail(id), ctx.detail)
		},
	})
}

export function useBookmarkPost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialsApi.bookmarkPost({ post: id }),
		onMutate: async (id) => {
			await Promise.all(feedKeys.engagement().map((key) => qc.cancelQueries({ queryKey: key })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				following: qc.getQueryData<FeedCache>(feedKeys.following()),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks()),
				detail: undefined as SocialContent | undefined,
			}

			const current = findEngagementEntity(qc, id)
			const wasBookmarked = current?.viewer.bookmarked ?? false
			const patch: SocialContentPatch = { viewer: { bookmarked: !wasBookmarked } }

			patchEngagementInFeeds(qc, id, patch)

			if (wasBookmarked) {
				qc.setQueryData<FeedCache>(feedKeys.bookmarks(), (old) => {
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
				qc.setQueryData<FeedCache>(feedKeys.bookmarks(), (old) => {
					if (!old) return old
					const standalone = toStandaloneContent(current)
					const bookmarkedPost = applyContentPatch(standalone, { viewer: { bookmarked: true } })
					return {
						...old,
						pages: old.pages.map((page, i) =>
							i === 0 ? { ...page, posts: [bookmarkedPost, ...page.posts] } : page,
						),
					}
				})
			}

			if (current) {
				const detailKey = contentKeys.detail(current.id)
				await qc.cancelQueries({ queryKey: detailKey })
				const detailPrev = qc.getQueryData<SocialContent>(detailKey)
				snapshots.detail = detailPrev
				if (detailPrev)
					qc.setQueryData<SocialContent>(detailKey, applyContentPatch(detailPrev, patch))
			}

			return snapshots
		},

		onError: (_err, id, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou(), ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following(), ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks(), ctx.bookmarks)
			if (ctx?.detail) qc.setQueryData(contentKeys.detail(id), ctx.detail)
		},
	})
}
