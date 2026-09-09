import { Bookmarks } from "@/components/dashboard/bookmarks"
import { FriendSuggestions } from "@/components/dashboard/friend-suggestions"

const BookmarksPage = () => {
	return (
		<div className="flex flex-1 gap-5 h-full min-h-0 overflow-hidden">
			<Bookmarks />
			<FriendSuggestions />
		</div>
	)
}

export default BookmarksPage
