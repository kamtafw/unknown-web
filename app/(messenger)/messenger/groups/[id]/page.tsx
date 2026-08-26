import { GroupConversationView } from "@/components/messenger/group-conversation/group-conversation-view"

export default async function GroupConversationPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <GroupConversationView groupId={Number(id)} />
}
