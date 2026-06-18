"use client"

import { OTPVerification } from "@/components/auth/otp-verification"
import { SuccessDialog } from "@/components/auth/success-dialog"
import { useResendOtp, useVerifyOtp } from "@/hooks/use-auth"
import { extractOtpMessage } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Flow = "signup" | "signin" | "reset" | "change"

export function VerifyContent({ flow }: { flow: Flow }) {
	const router = useRouter()

	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
	const verifyOtp = useVerifyOtp(flow)
	const resendOtp = useResendOtp()

	const [email] = useState(() => pendingAuth?.email ?? "")
	const [pre_auth_token] = useState(() => pendingAuth?.pre_auth_token)

	useEffect(() => {
		if (!pendingAuth && !isAuthenticated && !verifyOtp.isSuccess) router.replace("/sign-in")
	}, [pendingAuth, isAuthenticated, verifyOtp.isSuccess, router])

	if (!email) return null

	const otpError = verifyOtp.isError ? extractOtpMessage(verifyOtp.error) : undefined

	return (
		<>
			<OTPVerification
				email={email}
				isPending={verifyOtp.isPending || verifyOtp.isSuccess}
				error={otpError}
				onVerify={(code) =>
					verifyOtp.mutate({
						email: email,
						otp: code,
						otp_default: "otp",
						need_tokens: flow !== "reset",
						need_otp_token: true,
						pre_auth_token: pre_auth_token ?? undefined,
					})
				}
				onResend={() => resendOtp.mutate(email)}
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
