"use client"

import { CompleteProfile } from "@/components/onboarding/complete-profile"

const CompleteProfilePage = () => {
	return <CompleteProfile onContinue={(data) => console.log("COMPLETE PROFILE")} />
}

export default CompleteProfilePage
