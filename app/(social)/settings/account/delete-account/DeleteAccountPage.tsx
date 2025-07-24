"use client";

import { ArrowLeft, Phone, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import DeleteImage from "@/public/Delete.png";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FeedbackPopup from "./FeedbackPopup";

interface DeleteAccountPageProps {
  onBack: () => void;
  onNext: () => void;
}

export default function DeleteAccountPage({ onBack, onNext }: DeleteAccountPageProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const consequences = [
    "The account will be deleted from AppsCombo.",
    "Your message history will be erased.",
    "You will be removed from all your AppsCombo groups.",
    "Your google storage backup will be deleted.",
    "Any channels you created will be deleted.",
  ];

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Account"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Delete Account</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-1 flex flex-col items-center">
          <Image
            src={DeleteImage}
            alt="Security Illustration"
            width={100}
            height={100}
            className="mt-4"
          />
          <h2 className="mt-4 text-lg font-semibold self-start text-[16px]">
            If you delete this account
          </h2>
          <ul className="mt-4 list-disc pl-5 text-base self-start space-y-2">
            {consequences.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold self-start text-[16px]">
            Phone number
          </h3>
          <div className="mt-2 relative w-full">
            <Phone
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full pl-12 py-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <h3 className="mt-4 text-sm font-semibold self-start text-[16px]">
            Password
          </h3>
          <div className="mt-2 relative w-full">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full pl-12 pr-10 py-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              type="button"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </button>
          </div>
          <Button
            onClick={() => setShowFeedbackPopup(true)}
            disabled={!phone || !password}
            className="mt-8 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
        {showFeedbackPopup && (
          <FeedbackPopup
            onBack={() => setShowFeedbackPopup(false)}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
}