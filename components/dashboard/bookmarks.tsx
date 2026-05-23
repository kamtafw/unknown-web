"use client"

import { flattenFeedPages, useBookmarks } from "@/hooks/use-feed"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Tabs } from "radix-ui"
import { useEffect, useRef } from "react"
import { PostCard } from "./post-card"
import { useRouter } from "next/navigation"

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

export function Bookmarks() {
	const router = useRouter()
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useBookmarks()

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

	const bookmarks = flattenFeedPages(data?.pages)

	return (
		<Tabs.Root
			defaultValue="bookmarks"
			className="flex-1 min-w-0 flex flex-col bg-white rounded-t-2xl border border-gray-100 min-h-0 overflow-hidden pb-0"
		>
			<div className="bg-white px-2 rounded-t-2xl border-b border-gray-100 shrink-0">
				<Tabs.List className="flex items-center justify-center">
					<button
						type="button"
						onClick={() => router.push("/home")}
						className="flex items-center justify-self-start hover:bg-gray-100 rounded-full px-3 py-2 transition-colors"
					>
						<ArrowLeft size={18} />
					</button>

					<Tabs.Trigger
						value="bookmarks"
						className="flex-1 py-4 text-[13.5px] font-semibold text-gray-900"
					>
						Bookmarks
					</Tabs.Trigger>
				</Tabs.List>
			</div>

			<div
				id="feed-scroll"
				className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
			>
				<Tabs.Content value="bookmarks" className="focus:outline-none">
					{isLoading ? (
						<>
							{[0, 1, 2].map((i) => (
								<PostSkeleton key={i} />
							))}
						</>
					) : isError ? (
						<p className="px-5 py-16 text-center text-[13px] text-gray-500">
							Failed to load bookmarks.
						</p>
					) : !bookmarks.length ? (
						<p className="px-5 py-16 text-center text-[13px] text-gray-500">"No bookmarks yet."</p>
					) : (
						<>
							{bookmarks.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
							<div ref={sentinel} className="h-1" />
							{isFetchingNextPage && (
								<div className="flex justify-center py-8">
									<Loader2 size={20} className="animate-spin text-primary" />
								</div>
							)}
							{!hasNextPage && bookmarks.length > 0 && (
								<p className="text-center text-[11px] text-gray-400 py-8">•</p>
							)}
						</>
					)}
				</Tabs.Content>
			</div>
		</Tabs.Root>
	)
}
