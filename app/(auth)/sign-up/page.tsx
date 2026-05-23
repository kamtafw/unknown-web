"use client"

import { SignUp } from "@/components/auth/sign-up"
import { useSignup } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"

const SignUpPage = () => {
	const router = useRouter()
	const signup = useSignup()

	return (
		<SignUp
			onSuccess={(formData) => {
				useAuthStore.setState({
					pendingAuth: {
						email: formData.email,
						otp_default: "email",
						is_2fa_enabled: false,
						is_pin_enabled: false,
					},
				})

				signup.mutate({
					email: formData.email,
					phone_number: formData.phone,
					password: formData.password,
				})
			}}
			isPending={signup.isPending}
			onSignIn={() => router.push("/sign-in")}
		/>
	)
}

export default SignUpPage
