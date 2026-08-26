"use client"

import { resolvePreviewFallbackLabel, resolvePreviewIcon } from "@/lib/messenger/preview"
import { cn } from "@/lib/utils"
import type { GroupListItem as GroupListItemType } from "@/types/messenger"
import {
	BarChart3,
	FileText,
	Image as ImageIcon,
	MapPin,
	Mic,
	Pause,
	Phone,
	Share2,
	User,
	Video,
	VolumeX,
} from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"

const PREVIEW_ICONS = {
	image: ImageIcon,
	video: Video,
	voice: Mic,
	document: FileText,
	location: MapPin,
	contact: User,
	poll: BarChart3,
	call: Phone,
	share: Share2,
} as const

function formatTimestamp(iso: string | null): string {
	if (!iso) return ""
	return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

interface GroupListItemProps {
	group: GroupListItemType
	isActive: boolean
}

/** No per-row menu yet (mute/pause/leave) — that's the admin-surfaces
 * slice. Read-only row, same visual language as ChatListItem. */
export function GroupListItem({ group, isActive }: GroupListItemProps) {
	const PreviewIcon = resolvePreviewIcon(group.last_message_type)
	const Icon = PreviewIcon ? PREVIEW_ICONS[PreviewIcon] : null
	const previewText =
		group.last_message_preview ||
		(group.last_message_type ? resolvePreviewFallbackLabel(group.last_message_type) : "")

	return (
		<Link
			href={`/messenger/groups/${group.id}`}
			className={cn(
				"flex items-center gap-3 px-4 py-3 transition-colors",
				isActive ? "bg-accent" : "hover:bg-accent/50",
			)}
		>
			<Avatar.Root className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image
					src={group.icon_url}
					alt={group.name}
					className="h-full w-full object-cover"
				/>
				<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
					{group.name.charAt(0).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-semibold text-sm truncate">{group.name}</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatTimestamp(group.last_message_time)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					<span className="flex items-center gap-1 min-w-0 text-sm text-muted-foreground">
						{Icon && <Icon size={13} className="shrink-0" />}
						<span className="truncate">{previewText}</span>
					</span>
					<div className="flex items-center gap-1 shrink-0">
						{group.is_muted && <VolumeX size={13} className="text-muted-foreground" />}
						{group.is_paused && <Pause size={12} className="text-muted-foreground" />}
						{!!group.unread_count && (
							<span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
								{group.unread_count > 99 ? "99+" : group.unread_count}
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	)
}
