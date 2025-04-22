/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { Dispatch, SetStateAction } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
// import Friend from '@/assets/friend.png';
import SuggestionsCardModule from './SuggestionsCardModule';
import { useGetListOfUsersToFollow } from '@/services/queryHooks/useUserAuthService';
import Link from 'next/link';

interface CompProps {
    displaySuggestions: boolean;
    setDisplaySuggestions: Dispatch<SetStateAction<boolean>>;
}

const FriendsSuggestionModal = ({ setDisplaySuggestions, displaySuggestions }: CompProps) => {

    const { data: suggestion } = useGetListOfUsersToFollow()

    console.log('suggestion}', suggestion);


    return (
        <>
            <Dialog open={displaySuggestions} onOpenChange={setDisplaySuggestions} >
                <DialogContent className="sm:max-w-[640px] sm:w-[640px] h-auto sm:max-h-[636px]">
                    <DialogHeader>
                        <DialogTitle className='flex items-start justify-start gap-0'>
                            <h2 className='text-base text-[#111827] font-bold'>Friends suggestion</h2>
                        </DialogTitle>
                    </DialogHeader>

                    {/* <div className='w-full flex items-start justify-between gap-3'>
                            <div className='w-[40px] h-[40px] rounded-full'>
                                <Image src={Friend} alt='friend' className='w-auto h-auto object-contain' />
                            </div>
                            <div className='w-full flex flex-col gap-1 items-start'>
                                <div className='w-full flex items-start justify-between'>
                                    <div className='flex flex-col items-start justify-start gap-1'>
                                        <h3 className='text-base font-semibold text-[#313131]'>Ralph Edwards</h3>
                                        <h4 className='text-sm text-[#4B5463] font-normal'>@_reddy_soham</h4>
                                    </div>
                                    <Button type='button' className='bg-[#6A88D1] py-1.5 px-3 rounded-3xl w-[89px] cursor-pointer hover:bg-[#425483]'>Follow</Button>
                                </div>
                                <p className='sm:max-w-[426px] text-sm text-[#374151] font-normal'>A Product Designer who likes exploring many aspect of creativity</p>
                            </div>
                        </div> */}
                    <ScrollArea className=" h-[436px]">
                        <div className='flex flex-col gap-6 items-center'>
                            {
                                suggestion?.data?.count > 0 && (
                                    suggestion?.data?.results?.map((result: any) => (
                                        <SuggestionsCardModule userData={result} key={result?.id} />
                                    ))

                                )
                            }

                        </div>

                    </ScrollArea>
                    <DialogFooter className="sm:flex sm:justify-center sm:items-center h-[96px] w-full">
                        <Link href='/account' type="button" className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]">Continue</Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FriendsSuggestionModal;

