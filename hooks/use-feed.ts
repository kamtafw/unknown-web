import { socialApi } from "@/lib/api"
import { Post } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"

export const feedKeys = {
	forYou: ["feed", "for-you"] as const,
	following: ["feed", "following"] as const,
	bookmarks: ["feed", "bookmarks"] as const,
}

const feedBase = {
	forYou: "/api/socials/for-you-feed" as const,
	following: "/api/socials/following-feed" as const,
	bookmarks: "/api/socials/bookmarks" as const,
}

function toPath(basePath: string, fullUrl: string): string {
	try {
		const { search } = new URL(fullUrl)
		return `${basePath}${search}`
	} catch {
		return basePath
	}
}

async function fetchFeed(path: string) {
	const res = await socialApi.getFeedByPath(path)
	return {
		posts: res.data.results as Post[],
		nextPage: res.data.next as string | null,
	}
}

export function useForYouFeed() {
	return useInfiniteQuery({
		queryKey: feedKeys.forYou,
		queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
		initialPageParam: feedBase.forYou as string,
		getNextPageParam: (last) =>
			last.nextPage ? toPath(feedBase.forYou, last.nextPage) : undefined,
		placeholderData: (prev) => prev,
	})
}

export function useFollowingFeed() {
	return useInfiniteQuery({
		queryKey: feedKeys.following,
		queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
		initialPageParam: feedBase.following as string,
		getNextPageParam: (last) =>
			last.nextPage ? toPath(feedBase.following, last.nextPage) : undefined,
		placeholderData: (prev) => prev,
	})
}

export function useBookmarks() {
	return useInfiniteQuery({
		queryKey: feedKeys.bookmarks,
		queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
		initialPageParam: feedBase.bookmarks as string,
		getNextPageParam: (last) =>
			last.nextPage ? toPath(feedBase.bookmarks, last.nextPage) : undefined,
		placeholderData: (prev) => prev,
	})
}

export function flattenFeedPages(
	pages: { posts: Post[]; nextPage: string | null }[] | undefined,
): Post[] {
	return pages?.flatMap((p) => p.posts) ?? []
}
