import { GroupConversationWorkspace } from "@/components/messenger/group-conversation/group-conversation-workspace"
import { Pkid } from "@/types/messenger"

export default async function GroupConversationPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <GroupConversationWorkspace groupId={Number(id) as Pkid} />
}
