import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"
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
			<FriendSuggestions />
		</div>
	)
}
