"use client"

import { TwoFactorVerification, TwoFAMethod } from "@/components/auth/two-factor-verification"
import { useResendOtp, useVerifyOtp } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function toMethod(otp_default: string): TwoFAMethod {
	if (otp_default === "2fa") return "authenticator"
	if (otp_default === "pin") return "pin"
	return "otp"
}

function methodToApiType(method: TwoFAMethod): "otp" | "pin" | "2fa" {
	if (method === "authenticator") return "2fa"
	if (method === "pin") return "pin"
	return "otp"
}

const TwoFAPage = () => {
	const router = useRouter()

	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
	const verifyOtp = useVerifyOtp("signin")
	const resendOtp = useResendOtp()

	const [email] = useState(() => pendingAuth?.email ?? "")
	const [otp_default] = useState(() => pendingAuth?.otp_default ?? "otp")

	useEffect(() => {
		if (!pendingAuth && !isAuthenticated && !verifyOtp.isSuccess) router.replace("/sign-in")
	}, [pendingAuth, isAuthenticated, verifyOtp.isSuccess, router])

	if (!email) return null

	const availableMethods: TwoFAMethod[] = [
		...(pendingAuth?.is_2fa_enabled ? (["authenticator"] as TwoFAMethod[]) : []),
		"otp", // email OTP is always available
		...(pendingAuth?.is_pin_enabled ? (["pin"] as TwoFAMethod[]) : []),
	]

	return (
		<TwoFactorVerification
			initialMethod={toMethod(otp_default)}
			availableMethods={availableMethods}
			isPending={verifyOtp.isPending || verifyOtp.isSuccess}
			onVerify={(method, code) => {
				verifyOtp.mutate({
					email: email,
					otp: code,
					type: methodToApiType(method),
					need_tokens: true,
					need_otp_token: true,
				})
			}}
			onResend={(method) => {
				if (method === "otp") resendOtp.mutate(email)
			}}
			onBack={() => router.back()}
		/>
	)
}

export default TwoFAPage
