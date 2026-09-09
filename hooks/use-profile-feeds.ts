import { socialApi } from "@/lib/api"
import { Post } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"

export const profileFeedKeys = {
	posts: (id: string) => ["profile-feed", "posts", id] as const,
	reposts: (id: string) => ["profile-feed", "reposts", id] as const,
	liked: (id: string) => ["profile-feed", "liked", id] as const,
	media: (id: string) => ["profile-feed", "media", id] as const,
	replies: (id: string) => ["profile-feed", "replies", id] as const,
}

const basePath = {
	posts: (id: string) => `/api/socials/user-handle/${id}/posts`,
	reposts: (id: string) => `/api/socials/user-handle/${id}/reposts`,
	liked: (id: string) => `/api/socials/user-handle/${id}/liked-posts`,
	media: (id: string) => `/api/socials/user-handle/${id}/posts-with-media`,
	replies: (id: string) => `/api/socials/user-handle/${id}/replies`,
}

function toPath(base: string, fullUrl: string): string {
	try {
		const { search } = new URL(fullUrl)
		return `${base}${search}`
	} catch {
		return base
	}
}

async function fetchProfileFeed(path: string) {
	const res = await socialApi.getFeedByPath(path)
	return {
		posts: res.data.results as Post[],
		nextPage: res.data.next as string | null,
	}
}

function useProfileFeedTab(
	kind: "posts" | "reposts" | "liked" | "media",
	id: string,
	enabled: boolean,
) {
	const base = basePath[kind](id)

	return useInfiniteQuery({
		queryKey: profileFeedKeys[kind](id),
		queryFn: ({ pageParam }) => fetchProfileFeed(pageParam as string),
		initialPageParam: base as string,
		getNextPageParam: (last) => (last.nextPage ? toPath(base, last.nextPage) : undefined),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 2,
	})
}

export function useUserPosts(id: string, enabled = true) {
	return useProfileFeedTab("posts", id, enabled)
}

export function useUserReposts(id: string, enabled = true) {
	return useProfileFeedTab("reposts", id, enabled)
}

export function useUserLikedPosts(id: string, enabled = true) {
	return useProfileFeedTab("liked", id, enabled)
}

export function useUserMediaPosts(id: string, enabled = true) {
	return useProfileFeedTab("media", id, enabled)
}

export function useUserReplies(id: string, enabled = true) {
	const base = basePath.replies(id)

	return useInfiniteQuery({
		queryKey: profileFeedKeys.replies(id),
		queryFn: async ({ pageParam }) => {
			const res = await socialApi.getUserRepliesByPath(pageParam as string)
			return {
				replies: res.data.results,
				nextPage: res.data.next as string | null,
			}
		},
		initialPageParam: base as string,
		getNextPageParam: (last) => (last.nextPage ? toPath(base, last.nextPage) : undefined),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 2,
	})
}

export function flattenProfileFeedPages(
	pages: { posts: Post[]; nextPage: string | null }[] | undefined,
) {
	return pages?.flatMap((p) => p.posts) ?? []
}
