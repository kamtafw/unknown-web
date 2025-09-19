"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ChangeNumberPage4Props {
  onBack: () => void;
  onNext: () => void;
}

export default function ChangeNumberPage4({ onBack, onNext }: ChangeNumberPage4Props) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 3) {
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

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Change Number"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Change Phone Number</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col items-center">
          <h2 className="mt-4 text-lg font-semibold text-[16px]">Enter code</h2>
          <p className="mt-4 text-sm text-gray-500 text-center text-[14px]">
            Enter the 4-digit code sent to your new phone number.
          </p>
          <div className="mt-6 flex gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => { inputRefs.current[index] = el; }}
                placeholder={``}
                title={`Digit ${index + 1}`}
                className={`w-[40px] h-[40px] text-center text-lg border-2 rounded-md ${
                  index === activeIndex ? "border-blue-500" : "border-gray-300"
                } focus:outline-none`}
              />
            ))}
          </div>
          <Button
            onClick={onNext}
            disabled={!isComplete}
            className="mt-120 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}