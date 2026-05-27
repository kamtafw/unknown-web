"use client"

import { FriendSuggestions } from "@/components/onboarding/friend-suggestions"
import { useUsersList } from "@/hooks/use-users"
import { useRouter } from "next/navigation"

const FriendSuggestionsPage = () => {
	const router = useRouter()
	const { data, isLoading } = useUsersList()

	return (
		<FriendSuggestions
			users={data?.data.results ?? []}
			isLoading={isLoading}
			onContinue={() => router.push("/home")}
		/>
	)
}

export default FriendSuggestionsPage
