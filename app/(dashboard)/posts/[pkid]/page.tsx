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

	return <PostDetailView pkid={Number(pkid)} highlightCommentId={comment} />
}
