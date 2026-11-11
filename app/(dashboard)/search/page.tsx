"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { socialApi } from "@/lib/api"
import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import type { MentionUser } from "@/types/socials/api"
function Person({ user }: { user: MentionUser }) {
	const follow = useFollowUser()
	const unfollow = useUnfollowUser()
	return (
		<li className="flex items-center justify-between gap-4 border-b border-border p-5">
			<Link href={`/profile/${user.id}`} className="min-w-0">
				<p className="truncate font-semibold">
					{[user.first_name, user.last_name].filter(Boolean).join(" ") ||
						user.username}
				</p>
				<p className="text-sm text-muted-foreground">@{user.username}</p>
			</Link>
			<button
				disabled={follow.isPending || unfollow.isPending}
				onClick={() =>
					(user.youFollowThisUser ? unfollow : follow).mutate(user.id)
				}
				className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50"
			>
				{user.youFollowThisUser ? "Unfollow" : "Follow"}
			</button>
		</li>
	)
}
function SearchResults() {
	const query = useSearchParams().get("q")?.trim() || ""
	const result = useQuery({
		queryKey: ["social-search", query],
		queryFn: () => socialApi.searchPeople(query),
		enabled: !!query,
	})
	return (
		<section className="min-w-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-card">
			<h1 className="p-5 text-xl font-semibold">
				People {query && `matching “${query}”`}
			</h1>
			{result.isPending && query && <p className="p-5">Searching…</p>}
			{result.isError && (
				<button
					className="p-5 text-destructive"
					onClick={() => result.refetch()}
				>
					Could not search. Retry
				</button>
			)}
			{result.data && (
				<ul>
					{result.data.data.results.map((user) => (
						<Person key={user.id} user={user} />
					))}
				</ul>
			)}
			{result.data?.data.results.length === 0 && (
				<p className="p-5 text-muted-foreground">No users found.</p>
			)}
		</section>
	)
}
export default function SearchPage() {
	return (
		<Suspense fallback={<p>Loading search…</p>}>
			<SearchResults />
		</Suspense>
	)
}
