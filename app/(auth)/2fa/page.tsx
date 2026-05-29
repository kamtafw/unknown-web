"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useVerifyOtp } from "@/hooks/use-auth"
import { TwoFactorVerification, TwoFAMethod } from "@/components/auth/two-factor-verification"
import { useEffect } from "react"

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
	const verifyOtp = useVerifyOtp("signin")

	useEffect(() => {
		if (!pendingAuth) router.replace("/sign-in")
	}, [pendingAuth, router])

	if (!pendingAuth) return null

	const availableMethods: TwoFAMethod[] = [
		...(pendingAuth.is_2fa_enabled ? (["authenticator"] as TwoFAMethod[]) : []),
		"otp", // email OTP is always available
		...(pendingAuth.is_pin_enabled ? (["pin"] as TwoFAMethod[]) : []),
	]

	return (
		<TwoFactorVerification
			initialMethod={toMethod(pendingAuth.otp_default)}
			availableMethods={availableMethods}
			isPending={verifyOtp.isPending}
			onVerify={(method, code) => {
				verifyOtp.mutate({
					email: pendingAuth.email,
					otp: code,
					type: methodToApiType(method),
					need_tokens: true,
					need_otp_token: true,
				})
			}}
			onResend={(method) => {
				if (method === "otp") {
					// TODO: call dedicated resend endpoint
				}
			}}
			onBack={() => router.back()}
		/>
	)
}

export default TwoFAPage
