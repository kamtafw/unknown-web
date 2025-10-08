// import RootLayout from '@/app/layout';
import AuthLayout from '@/components/layout/authLayout';
import ChooseInterestComponent from '@/components/modules/authModules/ChooseInterestComponent';
import React from 'react';



const ChoseInterest = () => {
    return (
        // <RootLayout>
            <AuthLayout>
                <section className='w-full flex items-center justify-center mx-auto py-3'>
                    <div className='flex items-center justify-center gap-[66px] w-full lg:w-[598px] max-w-[598px] mx-auto'>
                        <div className='flex flex-col gap-[20px]'>
                            <div className='w-full flex flex-col gap-[28px]'>
                                <div className='flex flex-col gap-1'>
                                    <h2 className='text-3xl text-[#111827] font-semibold'>Choose your interest</h2>
                                    <p>Your feed will be personalized based on what you like.</p>

                                </div>
                                <ChooseInterestComponent />
                            </div>
                        </div>
                    </div>
                </section>
            </AuthLayout>
        // </RootLayout>
    );
}

export default ChoseInterest;
