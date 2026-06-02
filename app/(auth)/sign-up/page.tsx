"use client"

import { SignUp } from "@/components/auth/sign-up"
import { useSignup } from "@/hooks/use-auth"
import { extractFieldErrors, extractMessage } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const SignUpPage = () => {
	const router = useRouter()
	const signup = useSignup()
	const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({})

	return (
		<SignUp
			fieldErrors={fieldErrors}
			onSuccess={(formData) => {
				setFieldErrors({})
				useAuthStore.setState({
					pendingAuth: {
						email: formData.email,
						otp_default: "email",
						is_2fa_enabled: false,
						is_pin_enabled: false,
					},
				})

				signup.mutate(
					{
						email: formData.email,
						phone_number: formData.phone,
						password: formData.password,
					},
					{
						onError: (error) => {
							const raw = extractFieldErrors(error)
							const errs: { email?: string; phone?: string } = {}
							if (raw.email) errs.email = raw.email
							if (raw.phone_number) errs.phone = raw.phone_number

							if (Object.keys(errs).length) {
								setFieldErrors(errs)
							} else {
								toast.error(extractMessage(error))
							}
						},
					},
				)
			}}
			isPending={signup.isPending}
			onSignIn={() => router.push("/sign-in")}
			onTerms={() => router.push("/terms")}
			onPrivacyPolicy={() => router.push("/privacy-policy")}
		/>
	)
}

export default SignUpPage
