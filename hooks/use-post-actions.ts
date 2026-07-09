import { socialApi } from "@/lib/api"
import { findEngagementEntity, patchEngagementInFeeds } from "@/lib/post-engagement"
import { toStandalonePost } from "@/lib/post-helpers"
import { Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { postDetailKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

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

			const current = findEngagementEntity(qc, id)
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

			const current = findEngagementEntity(qc, id)
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
