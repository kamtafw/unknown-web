"use client"

import type { Pkid } from "@/types/messenger"
import { useEffect, useState } from "react"
import { useMediaViewer } from "../media/media-viewer-context"
import { MediaViewerPanel } from "../media/media-viewer-panel"
import { GroupConversationView } from "./group-conversation-view"
import { GroupProfilePanel } from "./group-profile-panel"

interface GroupConversationWorkspaceProps {
	groupId: Pkid
}

function GroupConversationWorkspaceInner({ groupId }: GroupConversationWorkspaceProps) {
	const [profileOpen, setProfileOpen] = useState(false)
	const { viewer, closeMedia } = useMediaViewer()

	useEffect(() => {
		if (viewer) setProfileOpen(false)
	}, [viewer])

	const handleOpenProfile = () => {
		closeMedia()
		setProfileOpen(true)
	}

	return (
		<div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
			<div className="min-w-0 flex-1">
				<GroupConversationView groupId={groupId} onOpenProfile={handleOpenProfile} />
			</div>

			{viewer ? (
				<MediaViewerPanel />
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
