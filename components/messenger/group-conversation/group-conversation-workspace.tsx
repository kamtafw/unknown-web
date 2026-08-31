"use client"

import type { Pkid } from "@/types/messenger"
import { MediaViewerPanel } from "../media/media-viewer-panel"
import { GroupConversationView } from "./group-conversation-view"

interface GroupConversationWorkspaceProps {
	groupId: Pkid
}

function GroupConversationWorkspaceInner({ groupId }: GroupConversationWorkspaceProps) {
	return (
		<div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
			<div className="min-w-0 flex-1">
				<GroupConversationView groupId={groupId} />
			</div>

			<MediaViewerPanel />
		</div>
	)
}

export function GroupConversationWorkspace({ groupId }: GroupConversationWorkspaceProps) {
	return <GroupConversationWorkspaceInner groupId={groupId} />
}
