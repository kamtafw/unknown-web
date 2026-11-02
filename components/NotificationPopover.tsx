"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Loader2 } from "lucide-react"
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { apiClient } from "@/lib/axios"
import { showMutationErrorToast } from "@/lib/api-error"
import type { ApiResponse, PaginatedResponse } from "@/types/api"

export interface SocialAlert {
	id: number
	object_id: number | null
	notification_type: string
	message: string
	user: {
		id: string
		username: string
		first_name: string | null
		last_name: string | null
	} | null
	you_are_following_back: boolean
	connection_status: string | null
	sent_at: string
}
const tabs = {
	all: "All",
	follow: "Follows",
	mention: "Mentions",
	birthday: "Birthdays",
} as const
function AlertRow({ alert, close }: { alert: SocialAlert; close: () => void }) {
	const router = useRouter()
	const client = useQueryClient()
	const follow = useFollowUser()
	const unfollow = useUnfollowUser()
	const accept = useMutation({
		mutationFn: () =>
			apiClient.post(`/api/users/connections/respond/${alert.object_id}`, {
				action: "accept",
			}),
		onSuccess: () => client.invalidateQueries({ queryKey: ["social-alerts"] }),
		onError: (error) =>
			showMutationErrorToast(error, "Could not accept this request."),
	})
	const busy = follow.isPending || unfollow.isPending
	const actor = alert.user
	return (
		<li className="border-b border-border p-4 last:border-b-0">
			{actor && (
				<Link
					href={`/profile/${actor.id}`}
					onClick={close}
					className="text-sm font-semibold hover:underline"
				>
					@{actor.username}
				</Link>
			)}
			<p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
			{actor &&
				["follow", "connection_request", "connection_accepted"].includes(
					alert.notification_type,
				) && (
					<div className="mt-3 flex flex-wrap gap-2">
						{alert.notification_type === "connection_request" &&
						alert.connection_status !== "accepted" ? (
							<button
								disabled={accept.isPending}
								onClick={() => accept.mutate()}
								className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"
							>
								Accept
							</button>
						) : (
							alert.notification_type === "follow" && (
								<button
									disabled={busy}
									onClick={() =>
										(alert.you_are_following_back ? unfollow : follow).mutate(
											actor.id,
										)
									}
									className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"
								>
									{busy
										? "Updating…"
										: alert.you_are_following_back
											? "Unfollow"
											: "Follow back"}
								</button>
							)
						)}
						<button
							onClick={() => {
								close()
								router.push(`/messenger/${actor.id}`)
							}}
							className="rounded-full border border-primary px-4 py-2 text-xs text-primary"
						>
							Message
						</button>
					</div>
				)}
		</li>
	)
}
export default function NotificationPopover() {
	const [open, setOpen] = useState(false)
	const [tab, setTab] = useState<keyof typeof tabs>("all")
	const query = useInfiniteQuery({
		queryKey: ["social-alerts", tab],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) =>
			(
				await apiClient.get<ApiResponse<PaginatedResponse<SocialAlert>>>(
					`/api/notifications/${tab}/alerts?page=${pageParam}`,
				)
			).data.data,
		getNextPageParam: (last) =>
			last.current < last.total_pages ? last.current + 1 : undefined,
		enabled: open,
	})
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					aria-label="Notifications"
					className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
				>
					<Bell size={19} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl p-0"
			>
				<h2 className="p-4 font-semibold">Notifications</h2>
				<div
					className="flex border-b border-border px-2"
					role="tablist"
					aria-label="Notification categories"
				>
					{Object.entries(tabs).map(([key, label]) => (
						<button
							key={key}
							role="tab"
							aria-selected={key === tab}
							onClick={() => setTab(key as keyof typeof tabs)}
							className="flex-1 rounded-lg px-2 py-3 text-xs hover:bg-accent"
						>
							{label}
						</button>
					))}
				</div>
				<div className="max-h-[60vh] overflow-y-auto">
					{query.isPending && (
						<Loader2
							aria-label="Loading notifications"
							className="m-6 animate-spin"
						/>
					)}
					{query.isError && (
						<button
							className="p-4 text-sm text-destructive"
							onClick={() => query.refetch()}
						>
							Could not load notifications. Retry
						</button>
					)}
					{query.data && (
						<ul>
							{query.data.pages
								.flatMap((page) => page.results)
								.map((alert) => (
									<AlertRow
										key={alert.id}
										alert={alert}
										close={() => setOpen(false)}
									/>
								))}
						</ul>
					)}
					{query.data?.pages[0].results.length === 0 && (
						<p className="p-4 text-sm text-muted-foreground">
							No notifications yet.
						</p>
					)}
					{query.hasNextPage && (
						<button
							className="w-full p-3 text-sm text-primary"
							disabled={query.isFetchingNextPage}
							onClick={() => query.fetchNextPage()}
						>
							Load more
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
