"use client";

import { ArrowLeft, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChangeNumberPage3Props {
  onBack: () => void;
  onNext: () => void;
}

export default function ChangeNumberPage3({ onBack, onNext }: ChangeNumberPage3Props) {
  const [oldNumber, setOldNumber] = useState("");
  const [newNumber, setNewNumber] = useState("");

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
          <h2 className="mt-4 text-lg font-semibold text-[16px]">Old number</h2>
          <div className="mt-1 relative">
            <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              value={oldNumber}
              onChange={(e) => setOldNumber(e.target.value)}
              placeholder="Enter old phone number"
              className="w-full pl-10 py-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-[16px]">New number</h2>
          <div className="mt-1 relative">
            <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Enter new phone number"
              className="w-full pl-10 py-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={onNext}
            disabled={!oldNumber || !newNumber}
            className="mt-115 sm:mt-110 w-full max-w-[518px] h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}