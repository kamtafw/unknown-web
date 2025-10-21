"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSetPin } from "../../../../../services/queryHooks/useUserAuthService";
// import { useAuthStore } from "@/store/userStore";

interface CreatePinPageProps {
  onBack: () => void;
  onNext: (pin: string) => void;
}

export default function CreatePinPage({ onBack, onNext }: CreatePinPageProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setPinMutation = useSetPin();

  const handleChange = (index: number, value: string) => {
    if (/^\d$/.test(value) || value === "") {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (value && index < 5) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = pin.every((digit) => digit !== "");

  const handleNext = () => {
    const pinString = pin.join("");
    // console.log("Setting PIN:", pinString);
    // const { accessToken } = useAuthStore.getState();
    // console.log("Access Token:", accessToken);
    // console.log("Full User:", useAuthStore.getState().user);

    setPinMutation.mutate(
      { pin: pinString },
      {
        onSuccess: () => {
          onNext(pinString);
        },
      }
    );
  };

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Two-Step Verification"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Two-Step Verification</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col items-center">
          <h2 className="mt-4 text-lg font-semibold text-[16px]">
            Create a 6-digit PIN that you can remember
          </h2>
          <div className="mt-6 flex gap-2">
            {pin.map((digit, index) => (
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
                title={`PIN digit ${index + 1}`}
                aria-label={`PIN digit ${index + 1}`}
                className={`w-[40px] h-[40px] text-center text-lg border-2 rounded-md ${
                  index === activeIndex ? "border-blue-500" : "border-gray-300"
                } focus:outline-none`}
                disabled={setPinMutation.isPending}
              />
            ))}
          </div>
          <div className="mt-7 flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
          </div>
          <Button
            onClick={handleNext}
            disabled={!isComplete || setPinMutation.isPending}
            className="mt-125 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            {setPinMutation.isPending ? "Setting..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
