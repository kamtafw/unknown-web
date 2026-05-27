import { userApi } from "@/lib/api"
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

			router.push("/friend-suggestions")
		},
	})
}
