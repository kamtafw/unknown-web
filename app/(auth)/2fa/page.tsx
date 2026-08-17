"use client"

import { TwoFactorVerification, TwoFAMethod } from "@/components/auth/two-factor-verification"
import { useResendOtp, useSwitchOtpDefault, useVerifyOtp } from "@/hooks/use-auth"
import { extractFieldErrors, extractMessage, extractOtpMessage } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth-store"
import { OtpDefault } from "@/types/socials/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function toMethod(otp_default: string): TwoFAMethod {
	if (otp_default === "2fa") return "authenticator"
	if (otp_default === "pin") return "pin"
	return "otp"
}

function methodToOtpDefault(method: TwoFAMethod): OtpDefault {
	if (method === "authenticator") return "2fa"
	if (method === "pin") return "pin"
	return "email"
}

const TwoFAPage = () => {
	const router = useRouter()

	const pendingAuth = useAuthStore((s) => s.pendingAuth)
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
	const verifyOtp = useVerifyOtp("signin")
	const resendOtp = useResendOtp()
	const switchOtpDefault = useSwitchOtpDefault()

	const [email] = useState(() => pendingAuth?.email ?? "")
	const [otp_default] = useState(() => pendingAuth?.otp_default ?? "otp")
	const [pre_auth_token] = useState(() => pendingAuth?.pre_auth_token)
	const [availableMethods] = useState<TwoFAMethod[]>(() => [
		...(pendingAuth?.is_2fa_enabled ? (["authenticator"] as TwoFAMethod[]) : []),
		"otp",
		...(pendingAuth?.is_pin_enabled ? (["pin"] as TwoFAMethod[]) : []),
	])

	// the otp_default the backend currently has on file
	const [confirmedOtpDefault, setConfirmedOtpDefault] = useState<OtpDefault>(
		() => pendingAuth?.otp_default ?? "email",
	)
	const [isProcessing, setIsProcessing] = useState(false)

	useEffect(() => {
		if (!pendingAuth && !isAuthenticated && !verifyOtp.isSuccess) router.replace("/sign-in")
	}, [pendingAuth, isAuthenticated, verifyOtp.isSuccess, router])

	if (!email) return null

	return (
		<TwoFactorVerification
			initialMethod={toMethod(otp_default)}
			availableMethods={availableMethods}
			isPending={isProcessing || verifyOtp.isPending || verifyOtp.isSuccess}
			onVerify={async (method, code) => {
				setIsProcessing(true)

				const targetOtpDefault = methodToOtpDefault(method)

				if (targetOtpDefault !== confirmedOtpDefault) {
					try {
						await switchOtpDefault.mutateAsync({ identifier: email, otp_default: targetOtpDefault })
						setConfirmedOtpDefault(targetOtpDefault)
					} catch (error) {
						setIsProcessing(false)
						const fieldErrors = extractFieldErrors(error)
						toast.error(
							fieldErrors.otp_default ??
								extractMessage(error, "Couldn't switch verification method. Please try again."),
						)
						return
					}
				}

				verifyOtp.mutate(
					{
						email: email,
						otp: code,
						need_tokens: true,
						need_otp_token: true,
						pre_auth_token: pre_auth_token ?? undefined,
					},
					{
						onError: (error) => {
							setIsProcessing(false)
							toast.error(extractOtpMessage(error))
						},
					},
				)
			}}
			onResend={(method) => {
				if (method === "otp") resendOtp.mutate(email)
			}}
			onBack={() => router.back()}
		/>
	)
}

export default TwoFAPage
