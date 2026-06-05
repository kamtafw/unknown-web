import { Feed } from "@/components/dashboard/feed"
import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"

const HomePage = () => {
	return (
		<div className="flex flex-1 gap-5 h-full min-h-0 overflow-hidden">
			<Feed />
			<FriendSuggestions/>
		</div>
	)
}

export default HomePage
