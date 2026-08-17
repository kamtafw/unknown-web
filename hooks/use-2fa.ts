import { authApi, userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser, OtpDefault } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authKeys } from "./use-auth"

export function useChangeOtpDefault() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { otp_default: OtpDefault }) => userApi.changeOtpDefault(payload),

		onSuccess: (data) => {
			if (!data.success) return
			const patch = { otp_default: data.data.otp_default }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},

		onError: (error) => {
			showMutationErrorToast(error, "Failed to update default verification method")
		},
	})
}

export function useSetPin() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (pin: string) => userApi.setPin({ pin }),

		onSuccess: (data) => {
			if (!data.success) return
			const patch = { is_pin_enabled: true, otp_default: "pin" as const }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
			toast.success("PIN set successfully")
		},

		onError: (error) => {
			showMutationErrorToast(error, "Failed to set your PIN. Please try again.")
		},
	})
}

export function useConfirmPassword() {
	return useMutation({
		mutationFn: (payload: { password: string }) => userApi.confirmPassword(payload),
	})
}

export function useGenerateTotp() {
	return useMutation({
		mutationFn: (payload: { email: string }) => authApi.generateTotp(payload),
		onError: (error) => {
			showMutationErrorToast(error, "Failed to generate your authenticator key.")
		},
	})
}

export function useVerifyTotp() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { email: string; otp: string }) => authApi.verifyTotp(payload),

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { is_2fa_enabled: true, otp_default: "2fa" as const }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))

			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })

			toast.success("Google Authenticator enabled successfully")
		},
	})
}
