import { Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { socialApi } from "@/lib/api"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

function patchPost(
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

export function useLikePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialApi.likePost({ post: id }),
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

			const wasLiked = currentPost?.liked_by_me ?? false
			const patch = {
				liked_by_me: !wasLiked,
				post_like_count: (currentPost?.post_like_count ?? 0) + (wasLiked ? -1 : 1),
			}

			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => patchPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => patchPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.bookmarks, (old) => patchPost(old, id, patch))

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

			qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => patchPost(old, id, patch))
			qc.setQueryData<FeedCache>(feedKeys.following, (old) => patchPost(old, id, patch))

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
