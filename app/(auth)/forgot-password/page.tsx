"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useForgotPassword } from "@/services/auth/useUserAuthService";
import { useAuthStore } from "@/store/userStore";
import { Toaster } from "@/components/ui/sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const { mutate, isPending } = useForgotPassword();
  const setUser = useAuthStore((state) => state.setUser);

  const handleContinue = () => {
    if (!emailOrPhone.trim()) return;

    setUser({ email: emailOrPhone });
    mutate(emailOrPhone);
  };
  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600">
            Kindly provide the email address or phone number registered to your
            account
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="emailOrPhone"
              className="text-sm font-medium text-gray-700"
            >
              Email or phone number
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Enter your email"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-400 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!emailOrPhone.trim() || isPending}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Sending..." : "Continue"}
          </Button>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
