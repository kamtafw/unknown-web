"use client"

import { ForgotPassword } from "@/components/auth/forgot-password"
import { useRouter } from "next/navigation"

const ForgotPasswordPage = () => {
	const router = useRouter()

	return <ForgotPassword onBack={() => router.back()} onContinue={() => {}} />
}

export default ForgotPasswordPage
