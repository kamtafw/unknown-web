import { PostDetailView } from "@/components/dashboard/post-detail"

export default async function PostPage({ params }: { params: Promise<{ pkid: number }> }) {
	const { pkid } = await params
	return <PostDetailView pkid={Number(pkid)} />
}
