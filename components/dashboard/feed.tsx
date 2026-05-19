"use client"

import { flattenFeedPages, useFollowingFeed, useForYouFeed } from "@/hooks/use-feed"
import { Loader2 } from "lucide-react"
import { Tabs } from "radix-ui"
import { useEffect, useRef } from "react"
import { PostCard } from "./post-card"

type Tab = "for-you" | "following"

function PostSkeleton() {
	return (
		<div className="px-5 py-5 border-b border-gray-100 animate-pulse">
			<div className="flex gap-3">
				<div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
				<div className="flex-1 space-y-2">
					<div className="h-3 bg-gray-200 rounded-full w-2/5" />
					<div className="h-3 bg-gray-200 rounded-full w-1/4" />
					<div className="h-3 bg-gray-200 rounded-full w-full mt-4" />
					<div className="h-3 bg-gray-200 rounded-full w-5/6" />
					<div className="h-44 bg-gray-200 rounded-2xl mt-3" />
				</div>
			</div>
		</div>
	)
}

function FeedPanel({ feedType }: { feedType: "for-you" | "following" }) {
	const sentinel = useRef<HTMLDivElement>(null)

	const forYou = useForYouFeed()
	const following = useFollowingFeed(feedType === "following")
	const q = feedType === "for-you" ? forYou : following

	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = q

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

	const posts = flattenFeedPages(data?.pages)

	if (isLoading)
		return (
			<>
				{[0, 1, 2].map((i) => (
					<PostSkeleton key={i} />
				))}
			</>
		)

	if (isError) {
		return <p className="px-5 py-16 text-center text-[13px] text-gray-500">Failed to load posts.</p>
	}

	if (!posts.length) {
		return (
			<p className="px-5 py-16 text-center text-[13px] text-gray-500">
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
					<Loader2 size={20} className="animate-spin text-[#8892C4]" />
				</div>
			)}
			{!hasNextPage && posts.length > 0 && (
				<p className="text-center text-[11px] text-gray-400 py-8">You&rsquo;re all caught up 🎉</p>
			)}
		</>
	)
}

export function Feed() {
	return (
		<Tabs.Root
			defaultValue="for-you"
			className="flex-1 min-w-0 flex flex-col bg-white rounded-t-2xl border border-gray-100 min-h-0 overflow-hidden pb-0"
		>
			<div className="bg-white rounded-t-2xl border-b border-gray-100 shrink-0">
				<Tabs.List className="flex">
					{(["for-you", "following"] as const).map((tab) => (
						<Tabs.Trigger
							key={tab}
							value={tab}
							className="
                group flex-1 py-4 text-[13.5px] font-medium transition-colors relative
                text-gray-400 hover:text-gray-700
                data-[state=active]:text-gray-900
                focus:outline-none
              "
						>
							{tab === "for-you" ? "For You" : "Following"}
							<span
								className="
                absolute bottom-0 left-1/2 -translate-x-1/2
                h-[2.5px] w-14 rounded-full bg-[#8892C4]
                scale-x-0 transition-transform duration-200
                group-data-[state=active]:scale-x-100
              "
							/>
						</Tabs.Trigger>
					))}
				</Tabs.List>
			</div>

			<div id="feed-scroll" className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
				<Tabs.Content value="for-you" className="focus:outline-none">
					<FeedPanel feedType="for-you" />
				</Tabs.Content>
				<Tabs.Content value="following" className="focus:outline-none">
					<FeedPanel feedType="following" />
				</Tabs.Content>
			</div>
		</Tabs.Root>
	)
}
