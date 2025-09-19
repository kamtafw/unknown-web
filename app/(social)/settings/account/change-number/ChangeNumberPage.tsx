"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import SimImage from "@/public/Sim.png"; 
import { Button } from "@/components/ui/button";

interface ChangeNumberPageProps {
  onBack: () => void;
  onNext: () => void;
}

export default function ChangeNumberPage({ onBack, onNext }: ChangeNumberPageProps) {
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
            <h1 className="text-xl font-bold">Change Phone Number</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col items-center">
          <Image
            src={SimImage}
            alt="Security Illustration"
            width={220}
            height={80}
            className="mt-4"
          />
          <p className="mt-8 font-semibold text-black text-left self-start text-[16px]">
            Changing your phone number will update your account&#39;s contact information.
          </p>
          <p className="mt-3 text-sm text-gray-500 text-left self-start text-[14px]">
            Before proceeding, please confirm that you are able to receive SMS or calls at your new number.
          </p>
          <p className="mt-3 text-sm text-gray-500 text-left self-start text-[14px]">
            If you have both a new phone and a new number, first change your new number on your old phone.
          </p>
          <Button
            onClick={onNext}
            className="mt-95 sm:mt-79 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full mb-4 bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}