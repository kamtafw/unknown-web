import React from "react"
import LoginForm from "@/components/x-login/LoginForm"

const LoginPage = () => {
	return (
		<section className="mx-auto flex flex-col-reverse md:flex-row items-center justify-center w-full gap-5 md:gap-15 px-6 mt-20">
			<div className="w-full md:w-[384px] flex flex-col gap-4 pt-15 pb-10">
				<h2 className="text-[28px] font-bold text-gray-900">Sign in to AppsCombo</h2>
				<LoginForm />
			</div>
		</section>
	)
}

export default LoginPage
