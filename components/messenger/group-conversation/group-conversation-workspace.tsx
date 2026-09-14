"use client"

import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import type { Message, Pkid } from "@/types/messenger"
import { useEffect, useState } from "react"
import { useMediaViewer } from "../media/media-viewer-context"
import { MediaViewerPanel } from "../media/media-viewer-panel"
import { GroupConversationView } from "./group-conversation-view"
import { GroupProfilePanel } from "./group-profile-panel"
import { ThreadPanel } from "./thread-panel"

interface GroupConversationWorkspaceProps {
	groupId: Pkid
}

/**
 * Single right-panel slot, same pattern the media viewer/profile panel
 * already established here — extended with a third mutually-exclusive
 * occupant, the thread panel. Priority: media viewer > thread > profile.
 * Opening any one of the three closes whichever of the other two was
 * open, matching the existing viewer-closes-profile behavior exactly
 * (no attempt at a panel "stack" that restores a previous occupant).
 */
function GroupConversationWorkspaceInner({ groupId }: GroupConversationWorkspaceProps) {
	const [profileOpen, setProfileOpen] = useState(false)
	const [threadParent, setThreadParent] = useState<Message | null>(null)
	const { viewer, closeMedia } = useMediaViewer()
	// Same cache entry GroupConversationView already reads via
	// useGroupDetail(groupId) — TanStack Query dedupes this, so calling
	// the hook again here isn't a second network request.
	const { data: group } = useGroupDetail(groupId)

	useEffect(() => {
		if (viewer) {
			setProfileOpen(false)
			setThreadParent(null)
		}
	}, [viewer])

	const handleOpenProfile = () => {
		closeMedia()
		setThreadParent(null)
		setProfileOpen(true)
	}

	const handleOpenThread = (message: Message) => {
		closeMedia()
		setProfileOpen(false)
		setThreadParent(message)
	}

	return (
		<div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
			<div className="min-w-0 flex-1">
				<GroupConversationView
					groupId={groupId}
					onOpenProfile={handleOpenProfile}
					onOpenThread={handleOpenThread}
				/>
			</div>

			{viewer ? (
				<MediaViewerPanel />
			) : threadParent ? (
				<div className="w-full shrink-0 sm:w-100">
					{/* Keyed by parent id so switching threads fully remounts the
					 * panel — clears any in-flight attachment/voice/composer-draft
					 * state from the previous thread instead of leaking it into
					 * the new one, and guarantees no stale reply list is ever
					 * visible while the new thread's query is still loading. */}
					<ThreadPanel
						key={threadParent.id}
						groupId={groupId}
						group={group ?? null}
						parentMessage={threadParent}
						onClose={() => setThreadParent(null)}
					/>
				</div>
			) : (
				profileOpen && (
					<div className="w-100 shrink-0">
						<GroupProfilePanel groupId={groupId} onClose={() => setProfileOpen(false)} />
					</div>
				)
			)}
		</div>
	)
}

export function GroupConversationWorkspace({ groupId }: GroupConversationWorkspaceProps) {
	return <GroupConversationWorkspaceInner groupId={groupId} />
}
