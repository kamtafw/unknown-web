import { ConversationWorkspace } from "@/components/messenger/conversation/conversation-workspace"
import type { Uuid } from "@/types/messenger"

export default async function ConversationPage({ params }: { params: Promise<{ uuid: string }> }) {
	const { uuid } = await params
	return <ConversationWorkspace uuid={uuid as Uuid} />
}
