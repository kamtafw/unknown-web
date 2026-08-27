"use client"

import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { Pkid, Uuid } from "@/types/messenger"
import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"
import { useState } from "react"
import { ProfileDialog } from "./profile-dialog"

/** Deliberately smaller than ChatListItem — only what the header actually
 * renders, so it can be satisfied either by list-cache data or by a
 * profile derived from message history (see derivePeerFromMessages). */
interface PeerDisplay {
	first_name: string | null
	last_name: string | null
	username: string
	profile_photo?: string | null
}

interface ConversationHeaderProps {
	peer: PeerDisplay | null
	/** Needed for the profile dialog — ConversationView already derives
	 * both from history/cache; not folded into PeerDisplay to keep that
	 * type's minimal-shape guarantee intact. */
	peerUuid: Uuid
	peerPkid: Pkid | null
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

export function ConversationHeader({ peer, peerUuid, peerPkid }: ConversationHeaderProps) {
	const [profileOpen, setProfileOpen] = useState(false)
	const name = peer ? getDisplayName(peer) : "Conversation"
	// A brand-new, message-less conversation opened from search has no
	// recoverable pkid yet (see usePeerProfile's documented gap) — profile
	// stays disabled rather than fetching with a fabricated id.
	const canOpenProfile = peerPkid != null

	return (
		<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
			<Link href="/messenger" className="sm:hidden text-muted-foreground">
				<ArrowLeft size={20} />
			</Link>

			<button
				onClick={() => canOpenProfile && setProfileOpen(true)}
				disabled={!canOpenProfile}
				className="flex items-center gap-3 flex-1 min-w-0 disabled:cursor-default"
			>
				<Avatar.Root className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
					<Avatar.Image
						src={peer?.profile_photo ?? undefined}
						alt={name}
						className="h-full w-full object-cover"
					/>
					<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
						{peer ? getInitials(peer.first_name, peer.last_name) : "?"}
					</Avatar.Fallback>
				</Avatar.Root>

				<div className="min-w-0 flex-1 text-left">
					<p className="text-sm font-semibold truncate">{name}</p>
				</div>
			</button>

			<div className="flex items-center gap-0.5 shrink-0">
				<InertIconButton label="Voice call" icon={Phone} />
				<InertIconButton label="Video call" icon={Video} />
				<InertIconButton label="Search in chat" icon={Search} />
				<button
					onClick={() => canOpenProfile && setProfileOpen(true)}
					disabled={!canOpenProfile}
					title="More options"
					className="text-muted-foreground hover:bg-accent rounded-full p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<MoreVertical size={18} />
				</button>
			</div>

			{canOpenProfile && (
				<ProfileDialog
					peerUuid={peerUuid}
					peerPkid={peerPkid}
					open={profileOpen}
					onOpenChange={setProfileOpen}
					onMessage={() => setProfileOpen(false)}
				/>
			)}
		</div>
	)
}
