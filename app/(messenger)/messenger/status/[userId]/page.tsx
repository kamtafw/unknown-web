import { StatusViewerPanel } from "@/components/messenger/status/status-viewer-panel"

export default async function StatusViewerPage({
	params,
}: {
	params: Promise<{ userId: string }>
}) {
	const { userId } = await params
	return <StatusViewerPanel userId={userId} />
}
