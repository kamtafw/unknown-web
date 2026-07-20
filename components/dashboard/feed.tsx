"use client"

import {
	feedBase,
	feedKeys,
	flattenFeedPages,
	useFollowingFeed,
	useForYouFeed,
} from "@/hooks/use-feed"
import { useFeedFreshness } from "@/hooks/use-feed-freshness"
import { Post } from "@/types/api"
import { Loader2 } from "lucide-react"
import { Tabs } from "radix-ui"
import { RefObject, useEffect, useRef, useState } from "react"
import { NewPostsPill } from "./new-posts-pill"
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
	flashIds: Set<string>
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
	flashIds,
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
			{posts.map((post) =>
				flashIds.has(post.id) ? (
					<div
						key={post.id}
						className="animate-in fade-in slide-in-from-top-3 duration-500 bg-primary/5"
					>
						<PostCard post={post} />
					</div>
				) : (
					<PostCard key={post.id} post={post} />
				),
			)}
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

function scrollFeedToTop() {
	document.getElementById("feed-scroll")?.scrollTo({ top: 0, behavior: "smooth" })
}

function ForYouPanel({ isActive }: { isActive: boolean }) {
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useForYouFeed()
	const [flashIds, setFlashIds] = useState<Set<string>>(new Set())

	const posts = flattenFeedPages(data?.pages)

	const freshness = useFeedFreshness({
		feedType: "user_feed",
		feedQueryKey: feedKeys.forYou,
		basePath: feedBase.forYou,
		deltaSort: "newest",
		currentPosts: posts,
		isActive,
	})

	const handleApply = () => {
		const insertedIds = freshness.applyNewPosts()
		if (!insertedIds.length) return
		setFlashIds(new Set(insertedIds))
		scrollFeedToTop()
		setTimeout(() => setFlashIds(new Set()), 1500)
	}

	return (
		<>
			{freshness.hasNewPosts && (
				<NewPostsPill
					count={freshness.newPostCount}
					avatarUrls={freshness.pendingPosts.slice(0, 3).map((p) => p.user.profile_photo)}
					loading={freshness.isLoadingPending}
					onClick={handleApply}
				/>
			)}
			<FeedContent
				posts={posts}
				isLoading={isLoading}
				isError={isError}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				feedType="for-you"
				sentinel={sentinel}
				flashIds={flashIds}
			/>
		</>
	)
}

function FollowingPanel({ isActive }: { isActive: boolean }) {
	const sentinel = useRef<HTMLDivElement>(null)
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useFollowingFeed()
	const [flashIds, setFlashIds] = useState<Set<string>>(new Set())

	const posts = flattenFeedPages(data?.pages)

	const freshness = useFeedFreshness({
		feedType: "following_feed",
		feedQueryKey: feedKeys.following,
		basePath: feedBase.following,
		currentPosts: posts,
		isActive,
	})

	const handleApply = () => {
		const insertedIds = freshness.applyNewPosts()
		if (!insertedIds.length) return
		setFlashIds(new Set(insertedIds))
		scrollFeedToTop()
		setTimeout(() => setFlashIds(new Set()), 1500)
	}

	return (
		<>
			{freshness.hasNewPosts && (
				<NewPostsPill
					count={freshness.newPostCount}
					avatarUrls={freshness.pendingPosts.slice(0, 3).map((p) => p.user.profile_photo)}
					loading={freshness.isLoadingPending}
					onClick={handleApply}
				/>
			)}
			<FeedContent
				posts={posts}
				isLoading={isLoading}
				isError={isError}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				feedType="following"
				sentinel={sentinel}
				flashIds={flashIds}
			/>
		</>
	)
}

export function Feed() {
	const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you")

	return (
		<Tabs.Root
			value={activeTab}
			onValueChange={(v) => setActiveTab(v as "for-you" | "following")}
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
					<ForYouPanel isActive={activeTab === "for-you"} />
				</Tabs.Content>
				<Tabs.Content
					value="following"
					forceMount
					className="focus:outline-none data-[state=inactive]:hidden"
				>
					<FollowingPanel isActive={activeTab === "following"} />
				</Tabs.Content>
			</div>
		</Tabs.Root>
	)
}
