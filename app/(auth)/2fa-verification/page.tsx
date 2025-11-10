"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/store/userStore";
import {
  useVerifyLoginOtp,
  useResendLoginOtp,
} from "@/services/auth/useUserAuthService";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type TwoFAMethod = "email" | "pin" | "2fa";

export default function TwoFactorVerificationPage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const tempCredentials = useAuthStore((state) => state.tempCredentials);

  const otpDefault = (user?.user?.otp_default || user?.otp_default) as
    | TwoFAMethod
    | undefined;
  const [activeMethod, setActiveMethod] = useState<TwoFAMethod>(
    otpDefault || "email"
  );

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyLoginOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendLoginOtp();

  const userEmail = user?.user?.email || tempCredentials?.email || "";

  useEffect(() => {
    if (!userEmail) {
      router.push("/");
    }
  }, [userEmail, router]);

  useEffect(() => {
    if (!otpDefault) {
      router.push("/home");
    }
  }, [otpDefault, router]);

  const handleBack = () => {
    router.push("/");
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) return;

    verifyOtp({
      email: userEmail,
      otp: code,
    });
  };

  const handleResendCode = () => {
    if (activeMethod !== "email") {
      toast.info("Resend only works for email OTP", {
        style: { background: "#2196F3", color: "white" },
      });
      return;
    }
    resendOtp(userEmail);
  };

  const handleSwitchMethod = (method: TwoFAMethod) => {
    setActiveMethod(method);
    setCode("");
  };

  const getTitle = () => {
    switch (activeMethod) {
      case "email":
        return "Enter the 6 digit code we sent to your email";
      case "pin":
        return "Enter your 6 digit PIN";
      case "2fa":
        return "Enter the 6 digit code from your Google Authenticator app";
      default:
        return "Security Verification";
    }
  };

  const getAlternativeMethods = () => {
    const methods: { label: string; value: TwoFAMethod }[] = [];

    if (activeMethod !== "email") {
      methods.push({ label: "Use Email OTP Instead", value: "email" });
    }
    if (activeMethod !== "pin") {
      methods.push({ label: "Use PIN Instead", value: "pin" });
    }
    if (activeMethod !== "2fa") {
      methods.push({ label: "Use Google Authenticator Instead", value: "2fa" });
    }

    return methods;
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Security Verification
            </h1>
            <div className="space-y-1">
              <p className="text-gray-600">{getTitle()}</p>
              {activeMethod === "email" && (
                <p className="font-medium text-gray-900">{userEmail}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP value={code} onChange={setCode} maxLength={6}>
                <InputOTPGroup className="gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-12 text-lg font-medium border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:ring-0 bg-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={code.length !== 6 || isVerifying}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center">
              {activeMethod === "email" && (
                <p className="text-gray-600">
                  I didn&apos;t receive any code{" "}
                  <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {isResending ? "Resending..." : "Resend"}
                  </button>
                </p>
              )}

              {activeMethod === "pin" && (
                <p className="text-gray-600 mb-4">
                  If PIN fails, use code instead
                </p>
              )}

              {activeMethod === "2fa" && (
                <p className="text-gray-600 mb-4">
                  Check your Google Authenticator app for the current code
                </p>
              )}

              <div className="mt-6 space-y-3">
                {getAlternativeMethods().map((method) => (
                  <button
                    key={method.value}
                    onClick={() => handleSwitchMethod(method.value)}
                    className="w-full h-12 flex items-center justify-between px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <span className="text-gray-700 font-medium">
                      {method.label}
                    </span>
                    <FaArrowRight className="text-gray-700" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}
