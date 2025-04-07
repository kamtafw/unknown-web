"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import Link from "next/link"

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Wrong code, please try again",
    }),
})

function OtpInputFormModule() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    const watchedPin = form.watch('pin');


    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-[28px]">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem className="w-full flex flex-col items-start justify-between ">
                            <FormControl>
                                <InputOTP maxLength={6} {...field}>
                                    <InputOTPGroup className="flex items-center justify-between w-full lg:w-[455px]">
                                        <InputOTPSlot index={0} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                        <InputOTPSlot index={1} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                        <InputOTPSlot index={2} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                        <InputOTPSlot index={3} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                        <InputOTPSlot index={4} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                        <InputOTPSlot index={5} className="bg-[#F5F8FA] w-[60px] h-[60px] rounded-[14.12px] border-0" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col gap-[28px]">

                    {
                        watchedPin.length < 6 && (
                            <Button type="button" disabled className="w-full py-[14px] h-[52px] flex items-center justify-center  text-[#FFFFFF] text-base font-semibold rounded-[12px] cursor-not-allowed bg-[rgba(106,136,209,0.5)] "

                            >Verify Code</Button>
                        )
                    }
                    {
                        watchedPin.length === 6 && (
                            <Button type="submit" className="w-full py-[14px] h-[52px] flex items-center justify-center cursor-pointer bg-[#6A88D1] text-[#FFFFFF] text-base font-semibold rounded-[12px]">Verify Code</Button>
                        )
                    }
                     <Link href="#" className="text-base text-center text-[#1F2937] font-bold cursor-pointer">I didn’t receive any code <span className="text-[#6A88D1]">Resend</span></Link>
                </div>



            </form>
        </Form>
    )
}

export default OtpInputFormModule;
