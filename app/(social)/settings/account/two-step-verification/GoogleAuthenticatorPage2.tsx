"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import AuthImage from "@/public/Auth.png"; 
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleAuthenticatorPage2Props {
  onBack: () => void;
  onNext: () => void;
}

export default function GoogleAuthenticatorPage2({ onBack, onNext }: GoogleAuthenticatorPage2Props) {
  const [key] = useState("ABCD-1234-EFGH-5678")
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

 return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg border border-gray-200">
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
        <div className="px-2 sm:px-4 py-2 flex flex-col items-center">
          <Image
            src={AuthImage}
            alt="Security Illustration"
            width={100}
            height={100}
            className="mt-4"
          />
          <h2 className="mt-4 text-lg font-semibold text-[16px] text-center">Copy key and add to Google Authenticator</h2>
          <p className="mt-2 text-sm text-gray-500 text-center text-[12px]">(Google Authenticator)</p>
          <div className="mt-10 flex items-center w-full border border-gray-300 rounded-md">
            <input
              type="text"
              value={key}
              readOnly
              className="flex-1 p-2 text-sm bg-gray-50"
              placeholder="Authentication key"
              title="Google Authenticator key"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-4 text-blue-500 text-sm hover:bg-gray-100"
            >
              {copied ? "Copied!" : "Copy key"}
            </button>
          </div>
          <Button
            onClick={onNext}
            className="mt-98 sm:mt-88 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}