import Form from "@/components/Form"
import AuthLayout from "@/components/layout/authLayout"
import LoginFormModule from "@/components/modules/authModules/LoginFormModule"
import React from "react"
import LoginPage from "./(auth)/login/page1"

const Page = () => {
	return (
		<Form />
		// <AuthLayout>
		//   <section className="mx-auto flex flex-col-reverse md:flex-row items-center justify-center w-full gap-[20px] md:gap-[60px] px-6">
		//     <div className="w-full md:w-[384px] flex flex-col gap-[12px] mt-25">
		//       <h2 className="text-[28px] font-bold text-[#111827]">
		//         Sign in to AppsCombo
		//       </h2>
		//       <LoginFormModule />
		//     </div>
		//   </section>
		// </AuthLayout>
	)
}
export default Page
