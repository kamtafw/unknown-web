"use client"

import { flattenFeedPages, useFollowingFeed, useForYouFeed } from "@/hooks/use-feed"
import { usePostInteractionsStore } from "@/stores/post-interactions-store"
import { Post } from "@/types/api"
import { Loader2 } from "lucide-react"
import { Tabs } from "radix-ui"
import { RefObject, useEffect, useRef } from "react"
import { PostCard } from "./post-card"

function PostSkeleton() {
	return (
		<div className="px-5 py-5 border-b border-border animate-pulse">
			<div className="flex gap-3">
				<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
				<div className="flex-1 space-y-2">
					<div className="h-3 bg-muted rounded-full w-2/5" />
					<div className="h-3 bg-muted rounded-full w-1/4" />
					<div className="h-3 bg-muted rounded-full w-full mt-4" />
					<div className="h-3 bg-muted rounded-full w-5/6" />
					<div className="h-44 bg-muted rounded-2xl mt-3" />
				</div>
			</div>
		</div>
	)
}

interface FeedContentProps {
	posts: Post[]
	isLoading: boolean
	isError: boolean
	isFetchingNextPage: boolean
	hasNextPage: boolean
	fetchNextPage: () => void
	feedType: "for-you" | "following"
	sentinel: RefObject<HTMLDivElement | null>
}

function FeedContent({
	posts,
	isLoading,
	isError,
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
	feedType,
	sentinel,
}: FeedContentProps) {
	useEffect(() => {
		const el = sentinel.current
		if (!el) return
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
			},
			{ rootMargin: "200px" },
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, sentinel])

	if (isLoading)
		return (
			<>
				{[0, 1, 2].map((i) => (
					<PostSkeleton key={i} />
				))}
			</>
		)

	if (isError) {
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">
				Failed to load posts.
			</p>
		)
	}

	if (!posts.length) {
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">
				{feedType === "following" ? "Follow some people to see their posts here." : "No posts yet."}
			</p>
		)
	}

	return (
		<>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
			<div ref={sentinel} className="h-1" />
			{isFetchingNextPage && (
				<div className="flex justify-center py-8">
					<Loader2 size={20} className="animate-spin text-primary" />
				</div>
			)}
			{!hasNextPage && posts.length > 0 && (
				<p className="text-center text-[11px] text-muted-foreground/50 py-8">•</p>
			)}
		</>
	)
}

function ForYouPanel() {
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useForYouFeed()

	useEffect(() => {
		const el = sentinel.current
		if (!el) return
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
			},
			{ rootMargin: "200px" },
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage])

	const notInterestedIds = usePostInteractionsStore((s) => s.notInterestedPostIds)
	const posts = flattenFeedPages(data?.pages).filter((p) => !notInterestedIds.includes(p.id))
	// const posts = flattenFeedPages(data?.pages)

	return (
		<FeedContent
			{...{
				posts,
				isLoading,
				isError,
				isFetchingNextPage,
				hasNextPage,
				fetchNextPage,
				feedType: "for-you" as const,
				sentinel,
			}}
		/>
	)
}

function FollowingPanel() {
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useFollowingFeed()

	const notInterestedIds = usePostInteractionsStore((s) => s.notInterestedPostIds)
	const posts = flattenFeedPages(data?.pages).filter((p) => !notInterestedIds.includes(p.id))
	// const posts = flattenFeedPages(data?.pages)

	return (
		<FeedContent
			{...{
				posts,
				isLoading,
				isError,
				isFetchingNextPage,
				hasNextPage,
				fetchNextPage,
				feedType: "following" as const,
				sentinel,
			}}
		/>
	)
}

export function Feed() {
	return (
		<Tabs.Root
			defaultValue="for-you"
			className="flex-1 min-w-0 flex flex-col bg-card rounded-t-2xl border border-border min-h-0 overflow-hidden pb-0"
		>
			<div className="bg-card px-2 rounded-t-2xl border-b border-border shrink-0">
				<Tabs.List className="flex">
					{(["for-you", "following"] as const).map((tab) => (
						<Tabs.Trigger
							key={tab}
							value={tab}
							className="
                group flex-1 py-4 text-[13.5px] font-medium transition-colors relative
                text-muted-foreground hover:text-foreground
                data-[state=active]:text-foreground
                focus:outline-none
              "
						>
							{tab === "for-you" ? "For You" : "Following"}
							<span
								className="
                absolute bottom-0 left-1/2 -translate-x-1/2
                h-[2.5px] w-14 rounded-full bg-primary
                scale-x-0 transition-transform duration-200
                group-data-[state=active]:scale-x-100
              "
							/>
						</Tabs.Trigger>
					))}
				</Tabs.List>
			</div>

			<div
				id="feed-scroll"
				className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
			>
				<Tabs.Content value="for-you" className="focus:outline-none">
					<ForYouPanel />
				</Tabs.Content>
				<Tabs.Content
					value="following"
					forceMount
					className="focus:outline-none data-[state=inactive]:hidden"
				>
					<FollowingPanel />
				</Tabs.Content>
			</div>
		</Tabs.Root>
	)
}
