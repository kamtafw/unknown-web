"use client";

import { X } from "lucide-react";
import { useState } from "react";
import NameVerificationPopup from "./NameVerificationPopup";

interface ReservedUsernamePopupProps {
  onClose: () => void;
}

export default function ReservedUsernamePopup({ onClose }: ReservedUsernamePopupProps) {
  const [showNameVerificationPopup, setShowNameVerificationPopup] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Reserved Username</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          This username is reserved. Would you like to request verification?
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowNameVerificationPopup(true)}
            className="py-2 px-4 bg-[#6A88D1] text-white rounded-md hover:bg-[#425483] text-sm"
          >
            Save
          </button>
        </div>
        {showNameVerificationPopup && (
          <NameVerificationPopup
            onClose={() => {
              setShowNameVerificationPopup(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}