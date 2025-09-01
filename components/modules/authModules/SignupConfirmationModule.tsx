/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import React, { Dispatch, SetStateAction } from 'react';

import AppComboLogo from '@/assets/appcombohallogo.svg'
import Link from 'next/link';
import CustomLoader from '@/components/shared/Loader/CustomLoader';
import { payload } from './SignupFormModule';
import { UseMutateFunction } from '@tanstack/react-query';
import { SignupPayload } from '@/types/signup/user';

interface CompProps {
    displayConfirmation: boolean;
    setDisplayConfirmation: Dispatch<SetStateAction<boolean>>;
    isPending: boolean;
    formData: payload
    mutate: UseMutateFunction<any, any, SignupPayload, unknown>
}

// const SignupConfirmationModule = ({ displayConfirmation, setDisplayConfirmation, isPending, formData, mutate }: CompProps) => {
const SignupConfirmationModule = ({ displayConfirmation, setDisplayConfirmation, isPending }: CompProps) => {
    // const handleSignup = () => {
    //     mutate(formData)
    // }
     const router = useRouter();  
    
    // const handleSignup = () => {
    //     mutate(formData, {  
    //         onSuccess: () => {
    //             // Navigate to OTP page after successful signup
    //             router.push('/otp');
    //         },
    //         onError: (error) => {
    //             // Handle error if needed
    //             console.error('Signup failed:', error);
    //             // Optionally show error toast
    //         }
    //     });
    // }

    const handleSignup = () => {
    // Temporary - skip API call for testing
    router.push('/otp');
    setDisplayConfirmation(false);
}
    return (
        <>
            <Dialog open={displayConfirmation} onOpenChange={setDisplayConfirmation} >
                <DialogContent className="sm:max-w-md sm:w-[640px]">
                    <DialogHeader >
                        <DialogTitle className='flex items-center justify-center gap-0'>

                            <Image
                                src={AppComboLogo}
                                alt='App Combo'
                                width={50}
                                height={100}
                                className=' h-[34px]'
                            />
                            <span className='text-[#111827] text-2xl font-medium'><span className='font-bold text-[#6A88D1]'>Apps</span>combo</span>

                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center ">
                        <span className='text-base font-medium text-[#111827] text-center'>By signing up with Appscombo, you have agreed to our <Link href="#" className='font-semibold text-[#6A88D1]'>terms and agreement</Link>, with  <Link href="#" className='font-semibold text-[#6A88D1]'>Privacy Policy</Link>.</span>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleSignup} className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]">{isPending ? <CustomLoader /> : 'Continue to sign up'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SignupConfirmationModule;
