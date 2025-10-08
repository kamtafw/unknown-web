/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
// import Link from "next/link"
import { useVerifyOtp } from "@/services/queryHooks/useUserAuthService";
import CustomLoader from "@/components/shared/Loader/CustomLoader";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";
import { useResendOtp } from "@/services/queryHooks/useUserAuthService";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Wrong code, please try again",
  }),
});

interface CompProps {
  user: any;
}

function OtpInputFormModule({ user }: CompProps) {
  const {
    mutate,
    isPending,
    error,
  }: { mutate: any; isPending: boolean; error: any } = useVerifyOtp();
  const {
    mutate: resendMutate,
    isPending: isResending,
    error: resendError,
  } = useResendOtp();
  // error, isSuccess

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const watchedPin = form.watch("pin");

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      email: user?.email,
      otp: data?.pin,
      need_tokens: true,
      need_otp_token: true,
    };
    mutate(payload);
  }

  const handleResendOtp = () => {
    resendMutate(user?.email);
  };

  useEffect(() => {
    if (error) {
      const axiosError = error as any;

      if (
        axiosError?.errors?.email ||
        axiosError?.response?.data?.errors?.email
      ) {
        toast.error("Email is missing", {
          style: { background: "red", color: "white" },
        });
      } else if (
        axiosError?.errors?.otp ||
        axiosError?.response?.data?.errors?.otp
      ) {
        const otpError =
          axiosError?.errors?.otp?.message ||
          axiosError?.response?.data?.errors?.otp?.message ||
          "Invalid OTP code";
        toast.error(otpError, {
          style: { background: "red", color: "white" },
        });
      } else if (axiosError?.response?.data?.message) {
        toast.error(axiosError.response.data.message, {
          style: { background: "red", color: "white" },
        });
      } else if (axiosError?.message) {
        toast.error(axiosError.message, {
          style: { background: "red", color: "white" },
        });
      }
    }
  }, [error]);

  useEffect(() => {
    if (resendError) {
      const axiosError = resendError as any;
      const errorMessage =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Failed to resend OTP";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    }
  }, [resendError]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-[28px]"
        >
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col items-start justify-between ">
                <FormControl className="w-full">
                  <InputOTP maxLength={6} {...field} className="w-full">
                    <InputOTPGroup className="flex items-center justify-between w-full lg:w-[455px]">
                      <InputOTPSlot
                        index={0}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                      <InputOTPSlot
                        index={1}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                      <InputOTPSlot
                        index={2}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                      <InputOTPSlot
                        index={3}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                      <InputOTPSlot
                        index={4}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                      <InputOTPSlot
                        index={5}
                        className="bg-[#F5F8FA] lg:w-[60px] lg:h-[60px] rounded-[14.12px] border-0"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-[28px]">
            {watchedPin.length < 6 && (
              <Button
                type="button"
                disabled
                className="w-full py-[14px] h-[52px] flex items-center justify-center  text-[#FFFFFF] text-base font-semibold rounded-[12px] cursor-not-allowed bg-[rgba(106,136,209,0.5)] "
              >
                Verify Code
              </Button>
            )}
            {watchedPin.length === 6 && (
              <Button
                type="submit"
                className="w-full py-[14px] h-[52px] flex items-center justify-center cursor-pointer bg-[#6A88D1] text-[#FFFFFF] text-base font-semibold rounded-[12px]"
              >
                {isPending ? <CustomLoader /> : "Verify Code"}
              </Button>
            )}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-base text-center text-[#1F2937] font-bold cursor-pointer bg-transparent border-0"
            >
              I didn&#39;t receive any code{" "}
              <span className="text-[#6A88D1]">
                {isResending ? "Sending..." : "Resend"}
              </span>
            </button>
          </div>
        </form>
      </Form>
      <Toaster position="top-right" />
    </>
  );
}

export default OtpInputFormModule;
