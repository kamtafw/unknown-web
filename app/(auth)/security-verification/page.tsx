"use client"

import { SecurityVerification } from "@/components/auth/security-verification"

const SecurityVerificationPage = () => {
	return (
		<SecurityVerification
			email="chiomachukwu@gmail.com"
			onVerify={(code) => console.log("Submitted code:", code)}
			onResend={() => console.log("Resend clicked")}
			onBack={() => console.log("Back clicked")}
		/>
	)
}

export default SecurityVerificationPage
