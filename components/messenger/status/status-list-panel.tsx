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
import { ChevronDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { useMemo, useState } from "react"
import { StatusCreateDialog } from "./status-create-dialog"

interface StatusListPanelProps {
	activeEntryId: string | null
}

function StatusRow({
	entry,
	isMe,
	isActive,
	onClick,
}: {
	entry: StatusListEntry
	isMe: boolean
	isActive: boolean
	onClick: () => void
}) {
	const hasStories = entry.totalSegments > 0
	const unseen = entry.viewedSegments < entry.totalSegments
	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
				isActive ? "bg-accent" : "hover:bg-accent/50",
			)}
		>
			<div
				className={cn(
					"h-14 w-14 shrink-0 rounded-full p-0.5",
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

function SectionHeader({ label }: { label: string }) {
	return (
		<div className="px-4 py-2 bg-muted/50">
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
		</div>
	)
}

/** Viewed/Muted only — Recent stays always-open by design. */
function CollapsibleSectionHeader({
	label,
	count,
	expanded,
	onToggle,
}: {
	label: string
	count: number
	expanded: boolean
	onToggle: () => void
}) {
	return (
		<button
			onClick={onToggle}
			className="w-full flex items-center justify-between px-4 py-2 bg-muted/50 hover:bg-muted transition-colors"
		>
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
				{label} · {count}
			</p>
			<ChevronDown
				size={14}
				className={cn("text-muted-foreground transition-transform", expanded ? "rotate-180" : "")}
			/>
		</button>
	)
}

export function StatusListPanel({ activeEntryId }: StatusListPanelProps) {
	const router = useRouter()
	const currentUser = useAuthStore((s) => s.user)
	const { data: myData, isLoading: myLoading } = useMyStatuses()
	const { data: feedData, isLoading: feedLoading } = useStatusFeed()
	const mutedPkids = useStatusMuteStore((s) => s.mutedPkids)
	const [createOpen, setCreateOpen] = useState(false)
	const [viewedExpanded, setViewedExpanded] = useState(true)
	const [mutedExpanded, setMutedExpanded] = useState(true)

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
	const openEntry = (entry: StatusListEntry) => router.push(`/messenger/status/${entry.id}`)

	return (
		<div className="w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
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
								isActive={activeEntryId === "my"}
								onClick={() =>
									myEntry.stories.length > 0 ? openEntry(myEntry) : setCreateOpen(true)
								}
							/>
						)}

						{grouped.recent.length > 0 && (
							<>
								<SectionHeader label="Recent updates" />
								{grouped.recent.map((entry) => (
									<StatusRow
										key={entry.id}
										entry={entry}
										isMe={false}
										isActive={activeEntryId === entry.id}
										onClick={() => openEntry(entry)}
									/>
								))}
							</>
						)}

						{grouped.viewed.length > 0 && (
							<>
								<CollapsibleSectionHeader
									label="Viewed updates"
									count={grouped.viewed.length}
									expanded={viewedExpanded}
									onToggle={() => setViewedExpanded((v) => !v)}
								/>
								{viewedExpanded &&
									grouped.viewed.map((entry) => (
										<StatusRow
											key={entry.id}
											entry={entry}
											isMe={false}
											isActive={activeEntryId === entry.id}
											onClick={() => openEntry(entry)}
										/>
									))}
							</>
						)}

						{grouped.muted.length > 0 && (
							<>
								<CollapsibleSectionHeader
									label="Muted updates"
									count={grouped.muted.length}
									expanded={mutedExpanded}
									onToggle={() => setMutedExpanded((v) => !v)}
								/>
								{mutedExpanded &&
									grouped.muted.map((entry) => (
										<StatusRow
											key={entry.id}
											entry={entry}
											isMe={false}
											isActive={activeEntryId === entry.id}
											onClick={() => openEntry(entry)}
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
		</div>
	)
}
