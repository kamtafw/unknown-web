import React from "react"
import SignupForm from "@/components/signup/SignupForm"

const SignupPage = () => {
	return (
		<section className="mx-auto flex flex-col-reverse md:flex-row items-center justify-center w-full gap-5 md:gap-15 px-6 mt-20">
			<div className="w-full md:w-[384px] flex flex-col gap-4 pt-5 pb-10">
				<h2 className="text-[28px] font-bold text-gray-900">Sign up to AppsCombo</h2>
				<SignupForm />
			</div>
		</section>
	)
}
export default SignupPage
