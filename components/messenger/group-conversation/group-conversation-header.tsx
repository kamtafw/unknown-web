"use client"

import type { Group } from "@/types/messenger"
import { ArrowLeft, MoreVertical, Pause, Search } from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"
import { useState } from "react"
import { GroupInfoDialog } from "./group-info-dialog"

interface GroupConversationHeaderProps {
	group: Group | null
	onOpenSearch: () => void
	onOpenProfile: () => void
}

/** Deliberately its own component rather than reusing 1:1's
 * ConversationHeader — a group has no first_name/last_name/username to
 * satisfy PeerDisplay, and PeerDisplay's own doc comment is explicit
 * about not inventing fields it doesn't have. */
export function GroupConversationHeader({
	group,
	onOpenSearch,
	onOpenProfile,
}: GroupConversationHeaderProps) {
	const [infoOpen, setInfoOpen] = useState(false)
	const name = group?.name ?? "Group"

	return (
		<>
			<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
				<Link href="/messenger/groups" className="sm:hidden text-muted-foreground">
					<ArrowLeft size={20} />
				</Link>

				<button
					onClick={onOpenProfile}
					disabled={!group}
					className="flex items-center gap-3 flex-1 min-w-0 disabled:cursor-default"
				>
					<Avatar.Root className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
						<Avatar.Image
							src={group?.icon_url ?? undefined}
							alt={name}
							className="h-full w-full object-cover"
						/>
						<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
							{name.charAt(0).toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
				</button>

				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold truncate">{name}</p>
					<p className="text-xs text-muted-foreground truncate flex items-center gap-2">
						{group ? `${group.members_count} members` : ""}
						{group?.is_paused && (
							<span className="inline-flex items-center gap-1 text-amber-600">
								<Pause size={10} /> Paused
							</span>
						)}
					</p>
				</div>

				<div className="flex items-center gap-0.5 shrink-0">
					<button
						onClick={onOpenSearch}
						title="Search in chat"
						className="text-muted-foreground hover:bg-accent rounded-full p-2 transition-colors"
					>
						<Search size={18} />
					</button>
					<button
						onClick={() => setInfoOpen(true)}
						disabled={!group}
						title="Group info"
						className="text-muted-foreground hover:bg-accent rounded-full p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<MoreVertical size={18} />
					</button>
				</div>
			</div>

			{group && <GroupInfoDialog groupId={group.id} open={infoOpen} onOpenChange={setInfoOpen} />}
		</>
	)
}
