// "use client"
import RootLayout from '@/app/layout';
import AuthLayout from '@/components/layout/authLayout';
import LoginFormModule from '@/components/modules/authModules/LoginFormModule';
import { AppleIcon, PlayStoreIcon } from '@/components/shared/Icons';
import { Button } from '@/components/ui/button';
// import Image from 'next/image';
import React from 'react';

const LoginPage = () => {

    return (
        <RootLayout>
            <AuthLayout>
                <section className='mx-auto py-6 md:py-0 flex flex-col-reverse md:flex-row items-center md:items-start justify-center w-full gap-[32px] md:gap-[116px] px-6'>
                    <div className='w-full md:w-[437px] flex flex-col h-auto gap-[42px]'>
                        <div className='hidden md:block w-full md:w-[410px] max-w-[410px] h-auto md:h-[514px] bg-[#E5E7EB] mx-auto'>
                            {/* <Image /> */}
                        </div>
                        <div className='w-full gap-2 md:gap-0 flex flex-col md:flex-row items-center justify-between'>
                            <Button variant="default" className='rounded-full w-full md:w-[209px] text-[#FFFFFF] font-medium text-[17px] py-[10px] flex items-center justify-center gap-[10px]'>
                                <PlayStoreIcon />
                                Get on Playstore
                            </Button>
                            <Button variant="default" className='rounded-full w-full md:w-[209px] text-[#FFFFFF] font-medium text-[17px] py-[10px] flex items-center justify-center gap-[10px]'>
                                <AppleIcon />
                                Get on Appstore
                            </Button>
                        </div>
                    </div>
                    <div className='w-full md:w-[384px] flex flex-col gap-[32px]'>
                        <h2 className='text-[28px] font-bold text-[#111827]'>Sign in to AppsCombo</h2>
                        <LoginFormModule />
                    </div>

                </section>
            </AuthLayout>
        </RootLayout>
    );
}
export default LoginPage;

