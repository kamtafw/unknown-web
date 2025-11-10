"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import GoogleAuthSuccessPopup from "./GoogleAuthSuccessPopup";
import { useVerifyTotpSetup, useSwitchOtpDefault } from "@/services/auth/useUserAuthService";
import { useAuthStore } from "@/store/userStore";

interface GoogleAuthenticatorPage3Props {
  onBack: () => void;
  onNext: () => void;
}

export default function GoogleAuthenticatorPage3({ onBack, onNext }: GoogleAuthenticatorPage3Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const verifyTotpMutation = useVerifyTotpSetup();
  const switchOtpMutation = useSwitchOtpDefault();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const userEmail = user?.user?.email || user?.email;

  const handleChange = (index: number, value: string) => {
    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((digit) => digit !== "");

  const handleContinue = () => {
    if (!isComplete || !userEmail) return;

    const otpCode = code.join("");

  
    verifyTotpMutation.mutate(
      {
        email: userEmail,
        otp: otpCode,
      },
      {
        onSuccess: () => {
          switchOtpMutation.mutate(
            {
              identifier: userEmail,
              otp_default: "2fa",
            },
            {
              onSuccess: () => {
                const currentUser = useAuthStore.getState().user;
                setUser({
                  ...currentUser,
                  otp_default: "2fa",
                  user: {
                    ...currentUser?.user,
                    otp_default: "2fa",
                  },
                });
                
                setShowSuccessPopup(true);
              },
            }
          );
        },
      }
    );
  };

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Google Authenticator"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Google Authenticator</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col items-center">
          <div className="mt-6 flex gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                placeholder=""
                title={`Enter digit ${index + 1} of your 6-digit code`}
                aria-label={`Digit ${index + 1}`}
                className={`w-[40px] h-[40px] text-center text-lg border-2 rounded-md ${
                  index === activeIndex ? "border-blue-500" : "border-gray-300"
                } focus:outline-none`}
                disabled={verifyTotpMutation.isPending || switchOtpMutation.isPending}
              />
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 text-center text-[14px]">
            Enter code generated in your google authenticator app.
          </p>
          <Button
            onClick={handleContinue}
            disabled={!isComplete || verifyTotpMutation.isPending || switchOtpMutation.isPending}
            className="mt-12 mb-4 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            {(verifyTotpMutation.isPending || switchOtpMutation.isPending) ? "Verifying..." : "Continue"}
          </Button>
        </div>
        {showSuccessPopup && (
          <GoogleAuthSuccessPopup
            onClose={() => setShowSuccessPopup(false)}
            onSave={onNext}
          />
        )}
      </div>
    </div>
  );
}