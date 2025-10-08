"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { EmailIcon, PadlockIcon } from "@/components/shared/Icons";
import { Toaster } from "@/components/ui/sonner";
import { useLogin } from "@/services/queryHooks/useUserAuthService";


const FormSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

function LoginFormModule() {
  const { mutate, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate(data);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-[32px]"
        >
          <div className="flex flex-col items-center md:items-start gap-[24px] w-full md:w-[384px] max-w-[384px]">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Label className="text-base text-[#191919] font-medium">
                    Email or Phone
                  </Label>
                  <FormControl>
                    <div className="relative w-full">
                      {/* <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-[black] text-white rounded-full" size={18} /> */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ">
                        <EmailIcon />
                      </div>
                      <Input
                        {...field}
                        placeholder="Enter your email or phone number"
                        className="placeholder:text-[#6B7280] placeholder:text-base pl-10 py-[14px] pr-[12px] border border-[#E5E7EB] rounded-[12px] w-full h-[52px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-col items-end  gap-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Label className="text-base text-[#191919] font-medium">
                      Password
                    </Label>
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
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Link
                href="forgot-password"
                className="text-base text-center text-[#6A88D1] font-bold cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-[24px]">
            <Button
              type="submit"
              disabled={isPending}
              className="py-[14px] flex items-center justify-center bg-[#6A88D1] rounded-[12px] text-[#FFFFFF] text-base font-semibold h-[52px] hover:bg-[#425483] w-full max-w-[384px]"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
            <Link
              href="/signup"
              className="text-base text-center text-[#1F2937] font-bold cursor-pointer"
            >
              Already a user? <span className="text-[#6A88D1]">Sign Up</span>
            </Link>
          </div>
        </form>
      </Form>
      <Toaster position="top-right" />
    </>
  );
}

export default LoginFormModule;
