import AuthLayout from "@/components/layout/authLayout";
import SignupFormModule from "@/components/modules/authModules/SignupFormModule";
import React from "react";

const Signup = () => {
  return (
    <AuthLayout>
      <section className="mx-auto flex flex-col-reverse md:flex-row items-center justify-center w-full gap-[20px] md:gap-[60px] px-6">
        <div className="w-full md:w-[384px] flex flex-col gap-[12px] ">
          <h2 className="text-[28px] font-bold text-[#111827]">
            Sign up to AppsCombo
          </h2>
          <SignupFormModule />
        </div>
      </section>
    </AuthLayout>
  );
};
export default Signup;
