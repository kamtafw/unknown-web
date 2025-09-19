"use client";

import { X } from "lucide-react";

interface GoogleAuthSuccessPopupProps {
  onClose: () => void;
  onSave: () => void;
}

export default function GoogleAuthSuccessPopup({ onClose, onSave }: GoogleAuthSuccessPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[350px] shadow-lg  md:h-[172px]">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 justify-end"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-10 text-sm text-gray-500">
          You have successfully created a google authenticator security.
        </p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={onSave}
            className="py-2 px-4 w-full bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}