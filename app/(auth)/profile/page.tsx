"use client"
import AuthLayout from '@/components/layout/authLayout';
import CompleteProfileFormModule from '@/components/modules/authModules/CompleteProfileFormModule';
import React from 'react';

const CompleteProfile = () => {
    return (
        <AuthLayout>
            <section className='flex items-center justify-center mx-auto mt-[60px] px-5 lg:px-0'>
                <section className='flex flex-col w-full md:w-[438px] max-w-[438px] gap-[32px]'>
                    <h2 className='text-3xl font-bold text-[#111827]'>Complete you profile</h2>
                    <CompleteProfileFormModule />
                </section>
            </section>
        </AuthLayout>
    );
}

export default CompleteProfile;
