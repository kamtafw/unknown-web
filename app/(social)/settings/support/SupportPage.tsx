"use client";

import { MessageCircle, File, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function SupportPage({ onBack, onNavigate }: SupportPageProps) {
  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Settings"
            >
            </button>
            <h1 className="text-xl font-bold">Support</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col space-y-4">
          <Button
            onClick={() => onNavigate("support-ask-question")}
            className="w-full mt-3 flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
          >
            <MessageCircle size={20} className="text-[#6A88D1]" />
            <span className="text-sm font-semibold">Ask a question</span>
          </Button>
          <Button
            onClick={() => onNavigate("support-faq")}
            className="w-full mt-3 flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
          >
            <File size={20} className="text-[#6A88D1]" />
            <span className="text-sm font-semibold">FAQ</span>
          </Button>
          <Button
            onClick={() => onNavigate("support-privacy-policy")}
            className="w-full mt-3 flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
          >
            <Shield size={20} className="text-[#6A88D1]" />
            <span className="text-sm font-semibold">Privacy Policy</span>
          </Button>
        </div>
      </div>
    </div>
  );
}