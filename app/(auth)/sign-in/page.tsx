"use client"

import { SignIn } from "@/components/auth/sign-in"
import { useLogin } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

const SignInPage = () => {
	const router = useRouter()
	const login = useLogin()

	return (
		<SignIn
			onSignIn={(data) => {
				login.mutate({ identifier: data.identifier, password: data.password })
			}}
			isPending={login.isPending}
			onForgotPassword={() => router.push("/forgot-password")}
			onSignUp={() => router.push("/sign-up")}
			onTerms={() => router.push("/terms")}
			onPrivacyPolicy={() => router.push("/privacy-policy")}
		/>
	)
}

export default SignInPage
