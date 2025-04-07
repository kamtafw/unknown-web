import AuthLayout from '@/components/layout/authLayout';
import OtpInputFormModule from '@/components/modules/authModules/OtpInputFormModule';
import { BackAuthIcon } from '@/components/shared/Icons';
import Link from 'next/link';
import React from 'react';

const OtpPage = () => {
    return (
        <AuthLayout>
            <section className='w-full flex items-center justify-center mx-auto'>
                <div className='flex items-center justify-center gap-[66px] w-full lg:w-[598px] max-w-[598px] mx-auto'>
                    <Link href="/auth/signup" style={{
                        boxShadow: "0px 8px 15px 0px #48488A14"

                    }} className='text-sm text-[#6A88D1] font-medium flex items-center justify-center gap-2 bg-[#FFFFFF] py-[9px] px-[12px] rounded-[40px]'><BackAuthIcon />Back</Link>
                    <aside className='flex flex-col gap-[20px]'>
                        <div className='w-full flex flex-col gap-[28px]'>
                            <div className='flex flex-col gap-1'>
                                <h2 className='text-3xl text-[#111827] font-semibold'>Enter code</h2>
                                <div className='flex flex-col gap-[2px]'>
                                    <p className='text-sm text-[#4B5563] font-normal'>Enter the 5 digit code we sent to your email. </p>
                                    <h3 className='text-sm font-bold text-[#111827]'>chiomachukwu@gmail.com</h3>
                                </div>
                            </div>
                            <OtpInputFormModule />
                        </div>
                    </aside>
                </div>
            </section>
        </AuthLayout>
    );
}

export default OtpPage;
