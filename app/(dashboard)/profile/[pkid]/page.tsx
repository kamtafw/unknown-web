import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"
import { UserProfileView } from "@/components/dashboard/user-profile-view"

export default async function ProfilePage({ params }: { params: Promise<{ pkid: string }> }) {
	const { pkid } = await params

	return (
		<div className="flex flex-1 gap-5 h-full min-h-0 overflow-hidden">
			<UserProfileView pkid={Number(pkid)} />
			<FriendSuggestions />
		</div>
	)
}
