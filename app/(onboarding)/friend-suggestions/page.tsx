"use client"

import { FriendSuggestions } from "@/components/onboarding/friend-suggestions"
import { OnboardingComplete } from "@/components/onboarding/onboarding-complete"
import { authKeys } from "@/hooks/use-auth"
import { useUsersList } from "@/hooks/use-users"
import { apiClient } from "@/lib/axios"
import { useAuthStore } from "@/stores/auth-store"
import { ApiResponse,FullUser } from "@/types/api"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

const FriendSuggestionsPage = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const user = useAuthStore((s) => s.user)
	const setUser = useAuthStore((s) => s.setUser)
	const { data, isLoading } = useUsersList()
	const [completing, setCompleting] = useState(false)

	const handleContinue = async () => {
		setCompleting(true)

		try {
			const res = await apiClient.get<ApiResponse<FullUser>>("/api/users/me")
			if (res.data.success && res.data.data) {
				queryClient.setQueryData(authKeys.me, res.data.data)
				setUser(res.data.data)
			}
		} catch {
			// non-fatal — user data will be re-fetched by useMe on /home anyway
		}

		setTimeout(() => {
			router.push("/home")
		}, 5000)
	}

	if (completing) {
		return <OnboardingComplete username={user?.first_name ?? undefined} />
	}

	return (
		<FriendSuggestions
			users={data?.data.results ?? []}
			isLoading={isLoading}
			onContinue={handleContinue}
		/>
	)
}

export default FriendSuggestionsPage
