import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"
import { PostAccountsPanel } from "@/components/dashboard/post-accounts-panel"
import { PostDetailView } from "@/components/dashboard/post-detail"

export default async function PostPage({
	params,
	searchParams,
}: {
	params: Promise<{ pkid: number }>
	searchParams: Promise<{ comment?: string }>
}) {
	const { pkid } = await params
	const { comment } = await searchParams

	return (
		<div className="flex flex-1 gap-5 h-full min-h-0 overflow-hidden">
			<PostDetailView pkid={Number(pkid)} highlightCommentId={comment} />
			<div className="flex flex-col gap-5 shrink-0 h-full min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<PostAccountsPanel pkid={Number(pkid)} />
				<FriendSuggestions />
			</div>
		</div>
	)
}
