"use client"

import { SuccessDialog } from "@/components/auth/success-dialog"
import { OTPVerification } from "@/components/onboarding/otp-verification"
import { useVerifyOtp } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Flow = "signup" | "signin" | "reset"

export function VerifyContent({ flow }: { flow: Flow }) {
	const router = useRouter()

	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
	const verifyOtp = useVerifyOtp(flow)

	const [email] = useState(() => pendingAuth?.email ?? "")

	useEffect(() => {
		if (!pendingAuth && !isAuthenticated && !verifyOtp.isSuccess) router.replace("/sign-in")
	}, [pendingAuth, isAuthenticated, verifyOtp.isSuccess, router])

	if (!email) return null

	return (
		<>
			<OTPVerification
				email={email}
				isPending={verifyOtp.isPending}
				onVerify={(code) =>
					verifyOtp.mutate({
						email: email,
						otp: code,
						type: "otp",
						need_tokens: true,
						need_otp_token: true,
					})
				}
				onResend={() => console.log("Resend clicked")} // TODO: replace with dedicated resend endpoint
				onBack={() => router.back()}
			/>

			<SuccessDialog
				open={verifyOtp.isSuccess && flow === "signup"}
				onOpenChange={() => {}}
				title="Account created!"
				description="Your account was created successfully. Let's set up your profile."
				actionLabel="Continue"
				onAction={() => router.push("/complete-profile")}
			/>
		</>
	)
}
