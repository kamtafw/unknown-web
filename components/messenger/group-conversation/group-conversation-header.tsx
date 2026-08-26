"use client"

import { toast } from "@/lib/toast"
import type { Group } from "@/types/messenger"
import { ArrowLeft, MoreVertical, Pause, Phone, Search, Video } from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"
import { useState } from "react"
import { GroupInfoDialog } from "./group-info-dialog"

interface GroupConversationHeaderProps {
	group: Group | null
}

function InertIconButton({ label, icon: Icon }: { label: string; icon: typeof Phone }) {
	return (
		<button
			title={`${label} — coming soon`}
			onClick={() => toast.info(`${label} is coming in a later milestone`)}
			className="text-muted-foreground/40 hover:bg-accent/40 rounded-full p-2 transition-colors cursor-not-allowed"
		>
			<Icon size={18} />
		</button>
	)
}

/** Deliberately its own component rather than reusing 1:1's
 * ConversationHeader — a group has no first_name/last_name/username to
 * satisfy PeerDisplay, and PeerDisplay's own doc comment is explicit
 * about not inventing fields it doesn't have. */
export function GroupConversationHeader({ group }: GroupConversationHeaderProps) {
	const [infoOpen, setInfoOpen] = useState(false)
	const name = group?.name ?? "Group"

	return (
		<>
			<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
				<Link href="/messenger/groups" className="sm:hidden text-muted-foreground">
					<ArrowLeft size={20} />
				</Link>

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
					<InertIconButton label="Voice call" icon={Phone} />
					<InertIconButton label="Video call" icon={Video} />
					<InertIconButton label="Search in chat" icon={Search} />
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
