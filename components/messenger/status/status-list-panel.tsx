"use client"

import { ChatListEmptyState } from "@/components/messenger/chat-list/chat-list-empty-state"
import { FAB } from "@/components/messenger/icons/group-list-icons"
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
import { useStatusViewedStore } from "@/stores/status-viewed-store"
import type { Pkid, StatusUser, Uuid } from "@/types/messenger"
import { Camera, ChevronDown, Clock, PenLine, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu } from "radix-ui"
import { useMemo, useState } from "react"
import { StatusCreateDialog } from "./status-create-dialog"
import { StatusRingAvatar } from "./status-ring-avatar"

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
	return (
		<button
			onClick={onClick}
			className={cn(
				"group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-accent",
				isActive ? "bg-accent" : "hover:bg-accent/50",
			)}
		>
			<div className="relative shrink-0">
				<StatusRingAvatar
					total={entry.totalSegments}
					viewedFlags={entry.viewedFlags}
					avatarUrl={entry.avatarUrl}
					name={entry.name}
					initials={getInitials(entry.user.first_name, entry.user.last_name)}
					isMuted={entry.isMuted}
				/>
				{isMe && entry.totalSegments === 0 && (
					<span className="absolute bottom-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
						<Plus size={11} strokeWidth={2.75} />
					</span>
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold">{isMe ? "My Status" : entry.name}</p>
				<p className="truncate text-xs text-muted-foreground">{entry.timestamp}</p>
			</div>
		</button>
	)
}

/** Plain label + whitespace, not a shaded band — a full-width tinted bar
 * per section reads as a stack of separate little cards; a quiet label
 * with a hairline above it reads as one continuous list with hierarchy,
 * matching the reference more closely and the spacing principle used
 * elsewhere in Messenger (thin separators, not container chrome). */
function SectionHeader({ label }: { label: string }) {
	return (
		<div className="border-t border-border/60 px-4 pt-4 pb-1.5">
			<p className="text-xs font-semibold capitalize tracking-wide text-muted-foreground">
				{label}
			</p>
		</div>
	)
}

/** Viewed/Muted only — Recent stays always-open by design. */
function CollapsibleSectionHeader({
	label,
	expanded,
	onToggle,
}: {
	label: string
	expanded: boolean
	onToggle: () => void
}) {
	return (
		<button
			onClick={onToggle}
			className="flex w-full items-center justify-between border-t border-border/60 px-4 pt-4 pb-1.5 text-left transition-colors hover:bg-accent/30"
		>
			<p className="text-xs font-semibold capitalize tracking-wide text-muted-foreground">
				{label}
			</p>
			<ChevronDown
				size={14}
				className={cn(
					"text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
					expanded ? "rotate-180" : "",
				)}
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
	const [createIntent, setCreateIntent] = useState<"text" | "camera">("text")
	const [viewedExpanded, setViewedExpanded] = useState(true)
	const [mutedExpanded, setMutedExpanded] = useState(true)

	const viewedIds = useStatusViewedStore((s) => s.viewedIds)
	const grouped = useMemo(
		() => groupStatusesByUser(feedData?.results ?? [], new Set(mutedPkids), new Set(viewedIds)),
		[feedData, mutedPkids, viewedIds],
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

	const openCreate = (intent: "text" | "camera") => {
		setCreateIntent(intent)
		setCreateOpen(true)
	}

	return (
		<div className="relative flex h-full w-full shrink-0 flex-col border-r border-border bg-background sm:w-90">
			<div className="flex items-center justify-between px-4 pt-4 pb-3">
				<h1 className="text-xl font-bold">Status</h1>
			</div>

			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="space-y-4 px-4 py-2">
						{[...Array(5)].map((_, i) => (
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
									myEntry.stories.length > 0 ? openEntry(myEntry) : openCreate("text")
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
							<ChatListEmptyState
								icon={Clock}
								title="No updates yet"
								description="Statuses from your contacts disappear after 24 hours — check back soon, or share your own."
								action={{ label: "Add a status", onClick: () => openCreate("text") }}
							/>
						)}
					</>
				)}
			</div>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<button
						title="New status"
						aria-label="Create a new status"
						className="absolute bottom-7 right-7 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-transform hover:opacity-90 active:scale-95 motion-reduce:transition-none"
					>
						<FAB />
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content
						align="end"
						side="top"
						sideOffset={10}
						className="z-150 rounded-2xl border-0 bg-transparent px-2 shadow-none outline-none backdrop-blur-md
							data-[state=open]:animate-in data-[state=closed]:animate-out
							data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
							data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					>
						<div className="flex flex-col items-end gap-2">
							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => openCreate("camera")}
							>
								<span className="text-[13px] text-foreground">Camera</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<Camera size={17} />
								</div>
							</DropdownMenu.Item>

							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => openCreate("text")}
							>
								<span className="text-[13px] text-foreground">Text status</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<PenLine size={17} />
								</div>
							</DropdownMenu.Item>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

			<StatusCreateDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				initialIntent={createIntent}
			/>
		</div>
	)
}
