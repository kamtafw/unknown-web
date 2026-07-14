"use client"

import { flattenFeedPages, useBookmarks } from "@/hooks/use-feed"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
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

export function Bookmarks() {
	const router = useRouter()
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
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
		<div className="flex-1 min-w-0 flex flex-col bg-card rounded-t-2xl border border-border min-h-0 overflow-hidden">
			{/* sticky header */}
			<div className="flex items-center gap-4 px-4 py-3 border-b border-border shrink-0 bg-card">
				<button
					onClick={() => router.push("/home")}
					className="p-2 rounded-full hover:bg-accent transition-colors"
				>
					<ArrowLeft size={18} className="text-foreground" />
				</button>
				<span className="font-bold text-[17px] text-foreground">Post</span>
			</div>
			{/* 
			<div className="bg-card px-2 rounded-t-2xl border-b border-border shrink-0">
				<Tabs.List className="flex items-center justify-center">
					<button
						type="button"
						onClick={() => router.push("/home")}
						className="flex items-center justify-self-start hover:bg-accent rounded-full px-3 py-2 transition-colors text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft size={18} />
					</button>

					<Tabs.Trigger
						value="bookmarks"
						className="flex-1 py-4 text-[13.5px] font-semibold text-foreground"
					>
						Bookmarks
					</Tabs.Trigger>
				</Tabs.List>
			</div> */}

			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
				{isLoading ? (
					<>
						{[0, 1, 2].map((i) => (
							<PostSkeleton key={i} />
						))}
					</>
				) : isError ? (
					<div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
						<p className="text-sm text-muted-foreground">Failed to load bookmarks.</p>
						<button
							onClick={() => refetch()}
							className="text-[13px] font-semibold text-primary hover:underline"
						>
							Try again
						</button>
					</div>
				) : !bookmarks.length ? (
					<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">
						No bookmarks yet.
					</p>
				) : (
					<>
						{bookmarks.map((post) => (
							<PostCard key={post.id} post={post} />
						))}
						<div ref={sentinel} className="h-1" />
						{isFetchingNextPage && (
							<div className="flex justify-center py-6">
								<Loader2 size={18} className="animate-spin text-primary" />
							</div>
						)}
						{!hasNextPage && bookmarks.length > 0 && (
							<p className="text-center text-[11px] text-muted-foreground/50 py-8">•</p>
						)}
					</>
				)}
			</div>
		</div>
	)
}
