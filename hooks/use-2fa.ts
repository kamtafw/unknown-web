import { userApi } from "@/lib/api"
import { extractMessage } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authKeys } from "./use-auth"

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
			toast.error(extractMessage(error, "Failed to set your PIN. Please try again."))
		},
	})
}
