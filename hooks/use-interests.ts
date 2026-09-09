import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useGetInterests() {
	return useQuery({
		queryKey: ["interests", "available"],
		queryFn: userApi.getInterests,
		staleTime: 1000 * 60 * 60,
	})
}

export function useSaveInterests() {
	const router = useRouter()

	return useMutation({
		mutationFn: userApi.saveInterests,
		onSuccess: (res) => {
			if (!res.success) return

			toast.success("Interests saved! Let's find you some people to follow.")
			router.push("/friend-suggestions")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Couldn't save your interests. Please try again.")
		},
	})
}
