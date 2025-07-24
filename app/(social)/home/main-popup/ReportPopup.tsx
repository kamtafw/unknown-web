"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportPopup({
  onClose,
  username,
}: {
  onClose: () => void;
  username: string;
}) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const reasons = ["Spam", "Inappropriate content", "Harassment", "Other"];

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Report {username}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-black text-left font-semibold">
          Please select a problem
        </p>
        <div className="space-y-4 mt-3">
          {reasons.map((reason) => (
            <div key={reason} className="flex items-center gap-2">
              <input
                type="radio"
                id={`reason-${reason}`}
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="h-4 w-4"
                title={`Select reason: ${reason}`}
              />
              <label htmlFor={`reason-${reason}`} className="cursor-pointer">
                {reason}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <p className="text-sm text-black font-semibold text-left">
            Your feedback is very much appreciated
          </p>
          <div className="flex items-center mt-2">
            <span className="absolute bottom-2 right-3 text-xs text-gray-400">
              {otherReason.length}/200
            </span>
            <textarea
              placeholder="Reason to block"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value.slice(0, 200))}
              className="w-full p-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
        <button
          className="mt-7 px-4 py-2 w-full bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={() => {
            router.push("/home");
            onClose();
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}


