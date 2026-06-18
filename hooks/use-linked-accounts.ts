import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authKeys } from "./use-auth"

export const linkedAccountsKeys = {
	list: ["users", "linked-accounts"] as const,
}

export function useLinkedAccounts() {
	return useQuery({
		queryKey: linkedAccountsKeys.list,
		queryFn: () => userApi.getLinkedAccounts(),
		staleTime: 1000 * 60 * 2,
	})
}

export function useAddLinkedAccount() {
	return useMutation({
		mutationFn: (payload: { identifier: string; password: string }) =>
			userApi.addLinkedAccount(payload),
	})
}

export function useConfirmLinkedAccount() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ id, otp_token }: { id: number; otp_token: string }) =>
			userApi.confirmLinkedAccount(id, { otp_token }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: linkedAccountsKeys.list })
			toast.success("Account linked successfully")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to confirm account. Please try again.")
		},
	})
}

export function useRemoveLinkedAccount() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: number) => userApi.removeLinkedAccount(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: linkedAccountsKeys.list })
			toast.success("Account removed")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to remove account")
		},
	})
}

export function useSwitchAccount() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)
	const router = useRouter()

	return useMutation({
		mutationFn: (linked_user_id: string) => userApi.switchAccount({ linked_user_id }),
		onSuccess: (data) => {
			if (!data.success) return
			const user = data.data.user as FullUser

			// seed the new user before clearing cache so the 'me' query is immediately warm
			qc.setQueryData(authKeys.me, user)
			setUser(user)
			qc.clear()
			qc.setQueryData(authKeys.me, user)

			toast.success(`Switched to @${user.username}`)
			router.push("/home")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to switch account. Please try again.")
		},
	})
}
