"use client";

import { X } from "lucide-react";

interface CancelSubscriptionPopupProps {
  onClose: () => void;
}

export default function CancelSubscriptionPopup({ onClose }: CancelSubscriptionPopupProps) {
  const consequences = [
    "The account will be deleted from AppsCombo.",
    "Your message history will be erased.",
    "You will be removed from all your Appscombo groups.",
    "Your google storage backup will be deleted.",
    "Any channels you created will be deleted.",
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
           <h3 className="text-lg font-semibold">Manage subscription</h3>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-red-600">Warning</p>
          <p className="text-sm text-gray-500 mt-1">
            Before you go, please review the benefits of premium account
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500">
            {consequences.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-30 w-full py-2 text-red-500 border border-red-500 rounded-full hover:bg-red-300 text-sm"
        >
          Cancel subscription
        </button>
      </div>
    </div>
  );
}