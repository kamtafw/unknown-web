"use client";
import { CalenderIcon, DatePickerCheckMarkIcon, ProfileIcon } from '@/components/shared/Icons';
import CustomLoader from '@/components/shared/Loader/CustomLoader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubmitProfile } from '@/services/queryHooks/useUserAuthService';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileSchema = z.object({
    first_name: z.string().min(2, { message: 'First name is required' }),
    last_name: z.string().min(2, { message: 'Last name is required' }),
    dob: z.string().min(1, { message: 'Date of birth is required' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompleteProfileFormModule = () => {
    // const router = useRouter();
    const { mutate, isPending, error, isSuccess } = useSubmitProfile()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            dob: '',
        },
    });

    const onSubmit = (values: ProfileFormValues) => {
        console.log(values)
        mutate(values)
        // router.push('/auth/interest')
    };
    console.log('profile error', error);
    console.log('profile success', isSuccess);





    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className='flex flex-col items-start justify-between gap-3'>

                    <Label className="text-base text-[#191919] font-medium w-full">Full Name</Label>
                    <div className='flex flex-col md:flex-row items-center justify-between w-full gap-[24px]'>
                        {/* First Name */}
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='w-full relative items-center'>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ">
                                                <ProfileIcon />
                                            </div>
                                            <Input placeholder="First name" {...field} className="placeholder:text-[#6B7280] placeholder:text-base pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px]" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Last Name */}
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='w-full relative'>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ">
                                                <ProfileIcon />
                                            </div>
                                            <Input placeholder="last name" {...field} className="placeholder:text-[#6B7280] placeholder:text-base pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px]" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base text-[#191919] font-medium">Date of Birth</FormLabel>
                            <FormControl>
                                <div className='w-full relative'>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ">
                                        <CalenderIcon />
                                    </div>
                                    <Input type="date" {...field}
                                        placeholder='DD/MM/YY'
                                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden placeholder:text-[#6B7280] placeholder:text-base pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px]" />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <DatePickerCheckMarkIcon />
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[438px]">
                    {
                        isPending ? <CustomLoader /> : 'Continue'
                    }

                </Button>
            </form>
        </Form>
    );
}

export default CompleteProfileFormModule;
