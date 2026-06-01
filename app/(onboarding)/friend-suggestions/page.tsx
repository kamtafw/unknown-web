"use client"

import { FriendSuggestions } from "@/components/onboarding/friend-suggestions"
import { authKeys } from "@/hooks/use-auth"
import { useUsersList } from "@/hooks/use-users"
import { apiClient } from "@/lib/axios"
import { useAuthStore } from "@/stores/auth-store"
import { ApiResponse, FullUser } from "@/types/api"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const FriendSuggestionsPage = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
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
		} finally {
			setCompleting(false)
			router.push("/home")
		}
	}

	if (completing) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-500">
				<Loader2 size={28} className="animate-spin text-primary" />
				<p className="text-sm font-medium">Completing onboarding…</p>
			</div>
		)
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
