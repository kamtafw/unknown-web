"use client"

import { ForgotPassword } from "@/components/auth/forgot-password"
import { useForgotPassword } from "@/hooks/use-auth"
import { extractMessage } from "@/lib/api-error"
import { useRouter } from "next/navigation"

const ForgotPasswordPage = () => {
	const router = useRouter()
	const forgotPassword = useForgotPassword()

	return (
		<ForgotPassword
			onBack={() => router.back()}
			isPending={forgotPassword.isPending || forgotPassword.isSuccess}
			error={forgotPassword.isError ? extractMessage(forgotPassword.error) : undefined}
			onContinue={(data) => forgotPassword.mutate(data.identifier)}
		/>
	)
}

export default ForgotPasswordPage
