"use client"

import type { Uuid } from "@/types/messenger"
import { useState } from "react"
import { ConversationView } from "./conversation-view"
import { ProfilePanel } from "./profile-panel"

interface ConversationWorkspaceProps {
	uuid: Uuid
}

export function ConversationWorkspace({ uuid }: ConversationWorkspaceProps) {
	const [profileOpen, setProfileOpen] = useState(false)

	return (
		<div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
			<div className="min-w-0 flex-1">
				<ConversationView uuid={uuid} onOpenProfile={() => setProfileOpen(true)} />
			</div>

			{profileOpen && (
				<div className="w-100 shrink-0">
					<ProfilePanel peerUuid={uuid} onClose={() => setProfileOpen(false)} />
				</div>
			)}
		</div>
	)
}
