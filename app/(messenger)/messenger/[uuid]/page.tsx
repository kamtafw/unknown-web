import { ConversationView } from "@/components/messenger/conversation/conversation-view"
import type { Uuid } from "@/types/messenger"

export default async function ConversationPage({ params }: { params: Promise<{ uuid: string }> }) {
	const { uuid } = await params
	return <ConversationView uuid={uuid as Uuid} />
}
