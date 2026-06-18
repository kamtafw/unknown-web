"use client"

import { CreateNewPassword } from "@/components/auth/create-new-password"
import { useResetPassword } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const CreateNewPasswordPage = () => {
	const router = useRouter()
	const resetPassword = useResetPassword()
	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const clearPendingAuth = useAuthStore((s) => s.clearPendingAuth)

	useEffect(() => {
		if (!pendingAuth?.reset_otp_token && !resetPassword.isSuccess) {
			router.replace("/forgot-password")
		}
	}, [pendingAuth, resetPassword.isSuccess, router])

	return (
		<CreateNewPassword
			isPending={resetPassword.isPending}
			isSuccess={resetPassword.isSuccess}
			onSubmit={(payload) => resetPassword.mutate(payload)}
			onDone={() => {
				clearPendingAuth()
				router.push("/sign-in")
			}}
		/>
	)
}

export default CreateNewPasswordPage
