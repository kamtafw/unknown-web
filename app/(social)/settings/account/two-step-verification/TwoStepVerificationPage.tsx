"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import SecurityImage from "@/public/TwoStep.png";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TwoStepVerificationPageProps {
  onBack: () => void;
  onCreatePinClick: () => void;
  onGoogleAuthenticatorClick: () => void;
}

export default function TwoStepVerificationPage({
  onBack,
  onCreatePinClick,
  onGoogleAuthenticatorClick,
}: TwoStepVerificationPageProps) {
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    { value: "otp", label: "Use OTP Verification", description: "You will receive OTP every time you try to login." },
    { value: "pin", label: "Create 6-digit PIN", description: "You will create a 6 digit pin and use it when you try to login." },
    {
      value: "google",
      label: "Google Authenticator",
      description: "Make sure you have a google authentication installed.",
    },
  ];

  const handleNext = () => {
    if (selectedOption === "pin") {
      onCreatePinClick();
    } else if (selectedOption === "google") {
      onGoogleAuthenticatorClick();
    }
  };

 return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Account"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Two-Step Verification</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-1 flex flex-col items-center">
          <Image
            src={SecurityImage}
            alt="Security Illustration"
            width={100}
            height={100}
            className="mt-4"
          />
          <p className="mt-4 text-sm text-gray-500 text-left self-start text-[14px]">
            For extra security turn on two-step verification, which will require a PIN when
            registering your phone number with Appscombo again.
          </p>
          <a href="#" className="mt-4 text-blue-500 text-sm hover:underline self-start text-[14px]">
            Learn more
          </a>
          <hr className="my-6 w-full border-gray-200" />
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="space-y-4 w-full"
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
                />
                <Label htmlFor={option.value} className="flex flex-col">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-sm text-gray-500">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="mt-50 w-full h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483] max-w-[518px]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
    );
  }