"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";

interface ManageSubscriptionPopupProps {
  onClose: () => void;
  onContinue: () => void;
}

export default function ManageSubscriptionPopup({
  onClose,
  onContinue,
}: ManageSubscriptionPopupProps) {
  const [selectedReason, setSelectedReason] = useState("");

  const reasons = [
    "Update payment method",
    "Update billing information",
    "Cancel subscription",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold">Manage your subscription</h3>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-[16px]">
            Please select a reason
          </p>
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="mt-2 space-y-2"
          >
            {reasons.map((reason, index) => (
              <div
                key={reason}
                className="flex items-center justify-between gap-2"
              >
                <Label htmlFor={`reason-${index}`} className="text-sm">
                  {reason}
                </Label>
                <RadioGroupItem
                  value={reason}
                  id={`reason-${index}`}
                  className="w-6 h-6 border-2 border-gray-300 rounded-full data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:relative data-[state=checked]:after:content-[''] data-[state=checked]:after:absolute data-[state=checked]:after:w-2 data-[state=checked]:after:h-2 data-[state=checked]:after:bg-white data-[state=checked]:after:rounded-full data-[state=checked]:after:top-1/2 data-[state=checked]:after:left-1/2 data-[state=checked]:after:-translate-x-1/2 data-[state=checked]:after:-translate-y-1/2"
                />
              </div>
            ))}
          </RadioGroup>
        </div>
        <button
          onClick={onContinue}
          disabled={!selectedReason}
          className="mt-50 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
