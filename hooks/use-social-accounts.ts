import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { SocialAccountsResponse } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const socialAccountsKey = ["users", "social-accounts"] as const

export function useSocialAccounts() {
	return useQuery({
		queryKey: socialAccountsKey,
		queryFn: userApi.getSocialAccounts,
		staleTime: 1000 * 60 * 2,
	})
}

export function useInitiateSocialLink() {
	return useMutation({
		mutationFn: (linkUrl: string) => userApi.initiateSocialLink(linkUrl),
		onError: (error) => {
			showMutationErrorToast(error, "Could not initiate connection. Please try again.")
		},
	})
}

export function useUnlinkSocialAccount() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (unlinkUrl: string) => userApi.unlinkSocialAccount(unlinkUrl),
		onSuccess: (data, platform) => {
			if (!data.success) return

			// optimistic cache patch — no refetch needed
			qc.setQueryData<SocialAccountsResponse>(socialAccountsKey, (old) => {
				if (!old?.data?.linked_accounts) return old
				return {
					...old,
					data: {
						...old.data,
						linked_accounts: old.data.linked_accounts.map((acc) =>
							acc.platform === platform ? { ...acc, linked: false, user_id: null } : acc,
						),
					},
				}
			})

			toast.success("Social account unlinked successfully")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to unlink account. Please try again.")
		},
	})
}
