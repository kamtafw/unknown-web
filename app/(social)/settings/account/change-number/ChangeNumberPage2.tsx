"use client";

import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChangeNumberPage2Props {
  onBack: () => void;
  onNext: () => void;
}

export default function ChangeNumberPage2({ onBack, onNext }: ChangeNumberPage2Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <h2 className="mt-4 text-lg font-semibold text-[16px]">Enter password to continue</h2>
          <p className="mt-5 text-lg font-semibold text-[14px]">Password</p>
          <div className="mt-2 relative">
            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 py-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              type="button"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} className="text-gray-800" /> : <Eye size={20} className="text-gray-500" />}
            </button>
          </div>
          <Button
            onClick={onNext}
            disabled={!password}
            className="mt-125 sm:mt-125 mb-4 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}