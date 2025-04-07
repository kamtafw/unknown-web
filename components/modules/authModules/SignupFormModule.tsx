"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    // FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import {
    Eye,
    EyeOff,
} from "lucide-react";
import Link from "next/link"
import { EmailIcon, PadlockIcon, PhoneIcon } from "@/components/shared/Icons"



const FormSchema = z.object({
    emailaddress: z.string().email("Invalid email"),
    phonenumber: z.string().min(10, "Phone number is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(12, "Password must be no more than 12 characters")
        .regex(/[A-Z]/, "Must include at least one uppercase letter")
        .regex(/[0-9]/, "Must include at least one number")
        .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
});


function SignupFormModule() {
    const [showPassword, setShowPassword] = useState(false);


    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            emailaddress: "",
            phonenumber: "",
            password: ""
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
    }

    const watchedPassword = useWatch({
        control: form.control,
        name: "password",
    });

    const passwordChecks = {
        length: (value: string) => value.length >= 8 && value.length <= 12,
        hasNumber: (value: string) => /\d/.test(value),
        hasUppercase: (value: string) => /[A-Z]/.test(value),
        hasSpecialChar: (value: string) => /[^A-Za-z0-9]/.test(value),
    };



    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-[32px]">
                <div className="flex flex-col items-center md:items-start gap-[24px] w-full md:w-[384px] max-w-[384px]">
                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="emailaddress"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <Label className="text-base text-[#191919] font-medium">Email Address</Label>
                                <FormControl>
                                    <div className="relative w-full">
                                        {/* <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-[black] text-white rounded-full" size={18} /> */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ">
                                            <EmailIcon />
                                        </div>
                                        <Input
                                            {...field}
                                            placeholder="Enter your email"
                                            className="placeholder:text-[#6B7280] placeholder:text-base pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px]"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Phone Number Field */}
                    <FormField
                        control={form.control}
                        name="phonenumber"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <Label className="text-base text-[#191919] font-medium">Phone Number</Label>
                                <FormControl>
                                    <div className="relative">
                                        {/* <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /
                                        > */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <PhoneIcon />
                                        </div>
                                        <Input
                                            {...field}
                                            placeholder="Enter your phone number"
                                            className="pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px] placeholder:text-[#6B7280] placeholder:text-base "
                                            type="tel"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <Label className="text-base text-[#191919] font-medium">Password</Label>
                                <FormControl>
                                    <div className="relative">
                                        {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /> */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <PadlockIcon />
                                        </div>
                                        <Input
                                            {...field}
                                            placeholder="Enter your password"
                                            className="pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px] placeholder:text-[#6B7280] placeholder:text-base"
                                            type={showPassword ? "text" : "password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </FormControl>

                                <div className="mt-2 space-y-1 text-sm">
                                    {[
                                        {
                                            label: "At least 8 to 12 characters",
                                            isValid: passwordChecks.length(watchedPassword ?? ""),
                                        },
                                        {
                                            label: "Special character",
                                            isValid: passwordChecks.hasSpecialChar(watchedPassword ?? ""),
                                        },
                                        {
                                            label: "One uppercase",
                                            isValid: passwordChecks.hasUppercase(watchedPassword ?? ""),
                                        },
                                        {
                                            label: "One number",
                                            isValid: passwordChecks.hasNumber(watchedPassword ?? ""),
                                        },
                                    ].map(({ label, isValid }, i) => (
                                        <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                            {isValid ? (
                                                <div className="min-w-[12px] min-h-[12px] rounded-full border border-[#6A88D1] flex items-center justify-center">
                                                    <svg width="6" height="5" viewBox="0 0 6 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0.900391 2.79922L2.30039 4.19922L5.10039 1.19922" stroke="#6A88D1" strokeWidth="0.6" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>

                                                </div>
                                            ) : (
                                                <div className="w-[12px] h-[12px] bg-[#E5E7EB] rounded-full"></div>
                                            )}
                                            <span className={isValid ? "text-[#111827] text-xs" : "text-muted-foreground text-xs"}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
                <div className="flex flex-col items-center gap-[24px]">
                    <Button type="submit" className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]">Sign Up</Button>
                    <Link href="#" className="text-base text-center text-[#1F2937] font-bold cursor-pointer">Already a user? <span className="text-[#6A88D1]">Sign in</span></Link>
                </div>
            </form>
        </Form>
    )
}

export default SignupFormModule;

