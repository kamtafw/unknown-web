import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"
import { UserProfileView } from "@/components/dashboard/user-profile-view"

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	return (
		<div className="flex flex-1 gap-5 h-full min-h-0 overflow-hidden">
			<UserProfileView id={id} />
			<FriendSuggestions />
		</div>
	)
}
