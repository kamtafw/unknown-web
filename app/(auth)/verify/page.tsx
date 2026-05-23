"use client"

import { OTPVerification } from "@/components/onboarding/otp-verification"
import { useVerifyOtp } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

type Flow = "signup" | "signin" | "reset"

const VerifyPage = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const flow = (searchParams.get("flow") ?? "signin") as Flow

	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const verifyOtp = useVerifyOtp(flow)

	useEffect(() => {
		// guard: if somehow no pending auth: bounce back
		if (!pendingAuth) {
			router.replace("/sign-in")
		}
	}, [pendingAuth, router])

	if (!pendingAuth) return null

	return (
		<OTPVerification
			email={pendingAuth.email}
			isPending={verifyOtp.isPending}
			onVerify={(code) =>
				verifyOtp.mutate({
					email: pendingAuth.email,
					otp: code,
					need_tokens: true,
					need_otp_token: true,
				})
			}
			onResend={() => console.log("Resend clicked")} // TODO: replace with dedicated resend endpoint
			onBack={() => router.back()}
		/>
	)
}

export default VerifyPage
