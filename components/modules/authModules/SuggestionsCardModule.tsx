/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomLoader from '@/components/shared/Loader/CustomLoader';
import { Button } from '@/components/ui/button';
import { useFollowAUserAction } from '@/services/queryHooks/useUserAuthService';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface CompProps {
    userData: any;
}

const SuggestionsCardModule = ({ userData }: CompProps) => {
    const { mutate, isPending, isSuccess, error }: { mutate: any; isPending: boolean; error: any; isSuccess: boolean } = useFollowAUserAction()

    const handleFollowAction = (id: string) => {
        const payload = {
            followed_user: id
        }
        mutate(payload)
    }

    console.log('isSuccess', isSuccess);
    console.log('error', error);

    useEffect(() => {
        if (!error?.success) {
            toast.error("You are already following this user.", {
                style: { "background": "red", "color": "white" }
            })
        }
    }, [error])


    return (
        <>
            <div className='w-full flex items-start justify-between gap-3'>
                <div className='w-[40px] h-[40px] rounded-full'>
                    <Image src={userData?.profile_photo} alt='friend' className='w-auto h-auto object-contain' width={100} height={100} />
                </div>
                <div className='w-full flex flex-col gap-1 items-start'>
                    <div className='w-full flex items-start justify-between'>
                        <div className='flex flex-col items-start justify-start gap-1'>
                            <h3 className='text-base font-semibold text-[#313131]'>{userData?.first_name}</h3>
                            <h4 className='text-sm text-[#4B5463] font-normal'>@_{userData?.username}</h4>
                        </div>
                        {
                            !isPending && !isSuccess ? <Button type='button'
                                onClick={() => handleFollowAction(userData?.pkid)}
                                className='bg-[#6A88D1] py-1.5 px-3 rounded-3xl w-[89px] cursor-pointer hover:bg-[#425483]'>
                                {isPending ? <CustomLoader /> : 'Follow'}
                            </Button>
                                :
                                <Button type='button'
                                    onClick={() => handleFollowAction(userData?.pkid)}
                                    className='bg-[#FFFFFF] py-1.5 px-3 rounded-3xl w-[89px] cursor-pointer hover:bg-[#425483] text-[#6A88D1] border border-[#6A88D1]'>
                                    Unfollow
                                </Button>
                        }

                    </div>
                    <p className='sm:max-w-[426px] text-sm text-[#374151] font-normal'>{
                        userData?.profile?.about_me
                    }</p>
                </div>
            </div>
            <Toaster position="top-right" />
        </>
    );
}

export default SuggestionsCardModule;
