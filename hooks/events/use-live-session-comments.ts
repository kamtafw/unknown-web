"use client"

import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { LIVE_SESSION_COMMENTS_PAGE_SIZE, liveSessionApi } from "@/lib/events/live-api"
import { liveSessionKeys } from "@/lib/events/live-query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { LiveSessionComment, LiveSessionCommentsPage } from "@/types/events/live"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { InfiniteData } from "@tanstack/react-query"
import { useMemo, useRef } from "react"

function isValidSessionId(value: number): boolean {
	return Number.isSafeInteger(value) && value > 0
}

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * Flattens pages in backend order and keeps the first occurrence of each comment id.
 * We do not sort by timestamp because the live-comments ordering contract is not confirmed.
 */
export function flattenLiveSessionCommentPages(
	pages: LiveSessionCommentsPage[] | undefined,
): LiveSessionComment[] {
	const seen = new Set<number>()
	const comments: LiveSessionComment[] = []
	for (const page of pages ?? []) {
		for (const comment of page.comments) {
			if (seen.has(comment.id)) continue
			seen.add(comment.id)
			comments.push(comment)
		}
	}
	return comments
}

/**
 * Read side for one live session. Pagination follows the backend's `next` signal only.
 * Cache identity includes account, login generation, session and page size. It does not poll
 * or subscribe to sockets; live updates are handled separately in P4-08C.
 */
export function useLiveSessionComments(
	sessionId: number,
	limit = LIVE_SESSION_COMMENTS_PAGE_SIZE,
) {
	const accountId = useAuthStore((state) => state.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((state) => state.sessionGeneration)
	const valid = isValidSessionId(sessionId)

	const query = useInfiniteQuery({
		queryKey: liveSessionKeys.comments(accountId, sessionGeneration, sessionId, limit),
		queryFn: ({ pageParam, signal }) =>
			liveSessionApi.getCommentsPage({ sessionId, page: pageParam, limit }, signal),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
		enabled: valid && accountId !== null,
		staleTime: 30_000,
		retry: (count, error) => {
			const status = statusOf(error)
			return status === 401 || status === 403 || status === 404 || status === 429
				? false
				: count < 1
		},
	})

	const pages = valid ? query.data?.pages : undefined
	const comments = useMemo(() => flattenLiveSessionCommentPages(pages), [pages])
	const hasLoaded = pages !== undefined
	const error: EventErrorKind | null =
		valid && query.isError ? describeEventError(query.error).kind : null
	const phase: "initial" | "next-page" | "refresh" | null = !error
		? null
		: !hasLoaded
			? "initial"
			: query.isFetchNextPageError
				? "next-page"
				: "refresh"

	return {
		comments,
		hasLoaded,
		isInitialLoading: valid && accountId !== null && !hasLoaded && !query.isError,
		error,
		phase,
		hasNextPage: valid && hasLoaded && query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		isRefreshing: query.isRefetching && !query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch,
	}
}

interface PostVariables {
	content: string
	sessionId: number
	limit: number
	accountId: number
	sessionGeneration: number | null
}

/**
 * Posts a live-session comment. The response includes the canonical comment, so a successful
 * create is inserted into the last loaded page (matching mobile) rather than optimistically
 * fabricated or followed by a refetch. Duplicate ids are ignored. Scope is captured in mutation
 * variables so an account switch while the request is in flight cannot write into the new account.
 */
export function usePostLiveSessionComment(
	sessionId: number,
	limit = LIVE_SESSION_COMMENTS_PAGE_SIZE,
) {
	const client = useQueryClient()
	const accountId = useAuthStore((state) => state.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((state) => state.sessionGeneration)
	const inFlight = useRef(false)
	const mutation = useMutation({
		mutationFn: (variables: PostVariables) =>
			liveSessionApi.postComment(variables.sessionId, { content: variables.content }),
		gcTime: 0,
		onSuccess: (comment, variables) => {
			const key = liveSessionKeys.comments(
				variables.accountId,
				variables.sessionGeneration,
				variables.sessionId,
				variables.limit,
			)
			client.setQueryData<InfiniteData<LiveSessionCommentsPage, number>>(key, (old) => {
				if (!old || old.pages.length === 0) return old
				if (old.pages.some((page) => page.comments.some((item) => item.id === comment.id))) {
					return old
				}
				const lastIndex = old.pages.length - 1
				return {
					...old,
					pages: old.pages.map((page, index) =>
						index === lastIndex ? { ...page, comments: [...page.comments, comment] } : page,
					),
				}
			})
		},
	})
	const { mutateAsync, reset } = mutation

	async function post(raw: string): Promise<boolean> {
		const content = raw.trim()
		if (!content || !isValidSessionId(sessionId) || accountId === null || inFlight.current) {
			return false
		}
		inFlight.current = true
		try {
			await mutateAsync({ content, sessionId, limit, accountId, sessionGeneration })
			reset()
			return true
		} catch {
			return false
		} finally {
			inFlight.current = false
		}
	}

	const error: EventErrorKind | null = mutation.isError
		? describeEventError(mutation.error).kind
		: null

	return {
		post,
		isPending: mutation.isPending,
		error,
		clearError: reset,
	}
}
