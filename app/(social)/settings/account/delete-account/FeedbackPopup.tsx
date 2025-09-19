"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";

interface FeedbackPopupProps {
  onBack: () => void;
  onNext: () => void;
}

export default function FeedbackPopup({ onBack, onNext }: FeedbackPopupProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [feedback, setFeedback] = useState("");

  const reasons = [
    "I no longer use the app",
    "Privacy concerns",
    "Switching to another service",
    "Too many notifications",
    "Other",
  ];

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setFeedback(text);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg h-[450px]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Back to Delete Account"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">Feedback</h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-[16px]">
          Please select a reason
        </p>
        <RadioGroup
          value={selectedReason}
          onValueChange={setSelectedReason}
          className="mt-2 space-y-2"
        >
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-center gap-3">
              <RadioGroupItem
                value={reason}
                id={`reason-${index}`}
                className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-white data-[state=checked]:border-gray-200 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-blue-500 data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
              />
              <Label htmlFor={`reason-${index}`} className="text-sm">
                {reason}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="mt-4 text-sm font-semibold text-[14px] text-gray-900">
          Your feedback is very much appreciated
        </p>
        <div className="mt-2 relative">
          <textarea
            placeholder="Tell us more about your reason..."
            value={feedback}
            onChange={handleFeedbackChange}
            className="w-full resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute bottom-2 right-2 text-sm text-gray-500">
            {feedback.length}/200
          </span>
        </div>
        <Button
          onClick={onNext}
          disabled={!selectedReason}
          className="mt-6 w-full h-[40px] rounded-md rounded-l-full rounded-r-full bg-[#6A88D1] hover:bg-[#425483]"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}