import { userApi } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"

export function useInitiateDeleteAccount() {
	return useMutation({
		mutationFn: (payload: { email: string; password: string }) =>
			userApi.initiateDeleteAccount(payload),
	})
}

export function useConfirmDeleteAccount() {
	return useMutation({
		mutationFn: (payload: { otp_token: string; reason: string; feedback?: string }) =>
			userApi.confirmDeleteAccount(payload),
	})
}
