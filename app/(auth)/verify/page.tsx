"use client"

import { OTPVerification } from "@/components/onboarding/otp-verification"

const VerifyPage = () => {
	return (
		<OTPVerification
			email="chiomachukwu@gmail.com"
			onVerify={(code) => console.log("Submitted code:", code)}
			onResend={() => console.log("Resend clicked")}
			onBack={() => console.log("Back clicked")}
		/>
	)
}

export default VerifyPage
