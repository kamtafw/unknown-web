import { Post, PostDetailResponse } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { socialApi } from "@/lib/api"
import { postDetailKeys } from "./use-post-detail"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

function patchFeedPost(
	old: FeedCache | undefined,
	id: string,
	patch: Partial<Post>,
): FeedCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
		})),
	}
}

function findPostInFeeds(qc: ReturnType<typeof useQueryClient>, id: string): Post | undefined {
	for (const key of [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]) {
		const hit = qc
			.getQueryData<FeedCache>(key)
			?.pages.flatMap((p) => p.posts)
			.find((p) => p.id === id)

		return hit
	}
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

			const current = findPostInFeeds(qc, id)
			const wasLiked = current?.liked_by_me ?? false
			const patch: Partial<Post> = {
				liked_by_me: !wasLiked,
				post_like_count: (current?.post_like_count ?? 0) + (wasLiked ? -1 : 1),
			}

			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => patchFeedPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => patchFeedPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => patchFeedPost(old, id, patch))

			if (current) {
				const detailKey = postDetailKeys.detail(current.pkid)
				await qc.cancelQueries({ queryKey: detailKey })
				const detailPrev = qc.getQueryData<Post>(detailKey)

				snapshots.detail = detailPrev
				snapshots.pkid = current.pkid

				console.log("CURRENT POST", JSON.stringify(current))
				console.log("DETAIL PREV", JSON.stringify(detailPrev))
				console.log("PATCH", JSON.stringify(patch))

				if (detailPrev) qc.setQueryData<Post>(detailKey, { ...detailPrev, ...patch })

				qc.getQueriesData<PostDetailResponse>({ queryKey: ["post", "detail"] }).forEach(
					([queryKey, raw]) => {
						if (raw?.data.pkid === current.pkid) {
							qc.setQueryData<PostDetailResponse>(queryKey, (old) =>
								old ? { ...old, data: { ...old.data, ...patch } } : old,
							)
						}
					},
				)
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
			qc.cancelQueries({ queryKey: feedKeys.forYou })
			qc.cancelQueries({ queryKey: feedKeys.following })
			qc.cancelQueries({ queryKey: feedKeys.bookmarks })

			const forYouFeedPrev = qc.getQueryData<FeedCache>(feedKeys.forYou)
			const followingFeedPrev = qc.getQueryData<FeedCache>(feedKeys.following)
			const bookmarksPrev = qc.getQueryData<FeedCache>(feedKeys.bookmarks)

			const currentPost =
				forYouFeedPrev?.pages.flatMap((p) => p.posts).find((p) => p.id === id) ??
				followingFeedPrev?.pages.flatMap((p) => p.posts).find((p) => p.id === id) ??
				bookmarksPrev?.pages.flatMap((p) => p.posts).find((p) => p.id === id)

			const wasBookmarked = currentPost?.bookmarked_by_me ?? false
			const patch = { bookmarked_by_me: !wasBookmarked }

			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => patchFeedPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => patchFeedPost(old, id, patch))

			if (wasBookmarked) {
				// if un-bookmarking, remove from bookmarks list
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
			} else if (currentPost) {
				// prepend to bookmarks @ the top
				qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => {
					if (!old) return old
					const bookmarkedPost = { ...currentPost, bookmarked_by_me: true }
					return {
						...old,
						pages: old.pages.map((page, i) =>
							i === 0 ? { ...page, posts: [bookmarkedPost, ...page.posts] } : page,
						),
					}
				})
			}

			return { forYouFeedPrev, followingFeedPrev, bookmarksPrev }
		},

		onError: (_err, _id, ctx) => {
			if (ctx?.forYouFeedPrev) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYouFeedPrev)
			if (ctx?.followingFeedPrev)
				qc.setQueryData<FeedCache>(feedKeys.following, ctx.followingFeedPrev)
			if (ctx?.bookmarksPrev) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarksPrev)
		},
	})
}
