import { socialsApi } from "@/lib/socials/api"
import { feedKeys } from "@/lib/socials/query-keys"
import { Post } from "@/types/socials/api"
import { useInfiniteQuery } from "@tanstack/react-query"

export const feedBase = {
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
	const res = await socialsApi.getFeedByPath(path)
	return {
		posts: res.results as Post[],
		nextPage: res.next as string | null,
	}
}

export function useForYouFeed() {
	return useInfiniteQuery({
		queryKey: feedKeys.forYou(),
		queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
		initialPageParam: feedBase.forYou as string,
		getNextPageParam: (last) =>
			last.nextPage ? toPath(feedBase.forYou, last.nextPage) : undefined,
		placeholderData: (prev) => prev,
	})
}

export function useFollowingFeed() {
	return useInfiniteQuery({
		queryKey: feedKeys.following(),
		queryFn: ({ pageParam }) => fetchFeed(pageParam as string),
		initialPageParam: feedBase.following as string,
		getNextPageParam: (last) =>
			last.nextPage ? toPath(feedBase.following, last.nextPage) : undefined,
		placeholderData: (prev) => prev,
	})
}

export function useBookmarks() {
	return useInfiniteQuery({
		queryKey: feedKeys.bookmarks(),
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
