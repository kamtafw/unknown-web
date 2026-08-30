"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useMyStatuses, useStatusFeed } from "@/hooks/messenger/use-status"
import {
	buildMyStatusEntry,
	groupStatusesByUser,
	type StatusListEntry,
} from "@/lib/messenger/status-grouping"
import { getInitials } from "@/lib/messenger/user-display"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { useStatusMuteStore } from "@/stores/status-mute.store"
import type { Pkid, StatusUser, Uuid } from "@/types/messenger"
import { Plus } from "lucide-react"
import { Avatar } from "radix-ui"
import { useMemo, useState } from "react"
import { StatusCreateDialog } from "./status-create-dialog"
import { StatusViewerDialog } from "./status-viewer-dialog"

function StatusRow({
	entry,
	isMe,
	onClick,
}: {
	entry: StatusListEntry
	isMe: boolean
	onClick: () => void
}) {
	const hasStories = entry.totalSegments > 0
	const unseen = entry.viewedSegments < entry.totalSegments
	return (
		<button
			onClick={onClick}
			className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
		>
			<div
				className={cn(
					"h-14 w-14 shrink-0 rounded-full p-[2px]",
					!hasStories ? "bg-transparent" : unseen ? "bg-primary" : "bg-muted-foreground/30",
				)}
			>
				<Avatar.Root className="h-full w-full rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-background">
					<Avatar.Image
						src={entry.avatarUrl ?? undefined}
						alt={entry.name}
						className="h-full w-full object-cover"
					/>
					<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
						{getInitials(entry.user.first_name, entry.user.last_name)}
					</Avatar.Fallback>
				</Avatar.Root>
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold truncate">{isMe ? "My Status" : entry.name}</p>
				<p className="text-xs text-muted-foreground truncate">{entry.timestamp}</p>
			</div>
			{isMe && !hasStories && (
				<span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
					<Plus size={16} />
				</span>
			)}
		</button>
	)
}

function SectionHeader({ label, count }: { label: string; count: number }) {
	return (
		<div className="px-4 py-2 bg-muted/50">
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
				{label} · {count}
			</p>
		</div>
	)
}

export function StatusListPanel() {
	const currentUser = useAuthStore((s) => s.user)
	const { data: myData, isLoading: myLoading } = useMyStatuses()
	const { data: feedData, isLoading: feedLoading } = useStatusFeed()
	const mutedPkids = useStatusMuteStore((s) => s.mutedPkids)
	const [createOpen, setCreateOpen] = useState(false)
	const [viewerEntry, setViewerEntry] = useState<StatusListEntry | null>(null)

	const grouped = useMemo(
		() => groupStatusesByUser(feedData?.results ?? [], new Set(mutedPkids)),
		[feedData, mutedPkids],
	)

	const myEntry = useMemo(() => {
		const fallbackUser: StatusUser | undefined = currentUser
			? {
					id: currentUser.id as Uuid,
					pkid: currentUser.pkid as Pkid,
					username: currentUser.username,
					first_name: currentUser.first_name ?? "",
					last_name: currentUser.last_name ?? "",
					email: "",
					phone_number: "",
					profile_photo: currentUser.profile_photo ?? null,
				}
			: undefined
		return buildMyStatusEntry(myData?.results ?? [], fallbackUser)
	}, [myData, currentUser])

	const isLoading = myLoading || feedLoading
	const totalOthers = grouped.recent.length + grouped.viewed.length + grouped.muted.length

	return (
		<div className="w-full flex flex-col h-full bg-background">
			<div className="flex items-center justify-between px-4 pt-4 pb-3">
				<h1 className="text-xl font-bold">Status</h1>
				<button
					onClick={() => setCreateOpen(true)}
					className="px-3 py-1.5 rounded-full text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
				>
					New status
				</button>
			</div>

			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="px-4 py-2 space-y-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-14 w-14 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-3.5 w-2/3" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							</div>
						))}
					</div>
				) : (
					<>
						{myEntry && (
							<StatusRow
								entry={myEntry}
								isMe
								onClick={() =>
									myEntry.stories.length > 0 ? setViewerEntry(myEntry) : setCreateOpen(true)
								}
							/>
						)}

						{grouped.recent.length > 0 && (
							<>
								<SectionHeader label="Recent updates" count={grouped.recent.length} />
								{grouped.recent.map((entry) => (
									<StatusRow
										key={entry.id}
										entry={entry}
										isMe={false}
										onClick={() => setViewerEntry(entry)}
									/>
								))}
							</>
						)}
						{grouped.viewed.length > 0 && (
							<>
								<SectionHeader label="Viewed updates" count={grouped.viewed.length} />
								{grouped.viewed.map((entry) => (
									<StatusRow
										key={entry.id}
										entry={entry}
										isMe={false}
										onClick={() => setViewerEntry(entry)}
									/>
								))}
							</>
						)}
						{grouped.muted.length > 0 && (
							<>
								<SectionHeader label="Muted updates" count={grouped.muted.length} />
								{grouped.muted.map((entry) => (
									<StatusRow
										key={entry.id}
										entry={entry}
										isMe={false}
										onClick={() => setViewerEntry(entry)}
									/>
								))}
							</>
						)}

						{!myEntry && totalOthers === 0 && (
							<p className="text-sm text-muted-foreground text-center py-16">
								No updates yet — statuses from your contacts will show up here.
							</p>
						)}
					</>
				)}
			</div>

			<StatusCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
			{viewerEntry && (
				<StatusViewerDialog
					entry={viewerEntry}
					isOwn={viewerEntry.id === "my"}
					onClose={() => setViewerEntry(null)}
				/>
			)}
		</div>
	)
}
