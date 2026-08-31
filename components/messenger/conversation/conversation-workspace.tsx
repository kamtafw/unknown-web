"use client"

import type { Uuid } from "@/types/messenger"
import { useEffect, useState } from "react"
import { MediaViewerProvider, useMediaViewer } from "../media/media-viewer-context"
import { MediaViewerPanel } from "../media/media-viewer-panel"
import { ConversationView } from "./conversation-view"
import { ProfilePanel } from "./profile-panel"

interface ConversationWorkspaceProps {
	uuid: Uuid
}

function ConversationWorkspaceInner({ uuid }: ConversationWorkspaceProps) {
	const [profileOpen, setProfileOpen] = useState(false)
	const { viewer, closeMedia } = useMediaViewer()

	// Single right-panel slot: whichever opens last wins.
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
				<ConversationView uuid={uuid} onOpenProfile={handleOpenProfile} />
			</div>

			{viewer ? (
				<MediaViewerPanel />
			) : (
				profileOpen && (
					<div className="w-100 shrink-0">
						<ProfilePanel peerUuid={uuid} onClose={() => setProfileOpen(false)} />
					</div>
				)
			)}
		</div>
	)
}

export function ConversationWorkspace({ uuid }: ConversationWorkspaceProps) {
	return (
		<MediaViewerProvider>
			<ConversationWorkspaceInner uuid={uuid} />
		</MediaViewerProvider>
	)
}
