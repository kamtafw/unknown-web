"use client";

import { FaShareAlt, FaForward, FaCopy } from "react-icons/fa";

interface SharePopupProps {
  onForward: () => void;
}

export function SharePopup({ onForward }: SharePopupProps) {
  const handleShareVia = () => {
    
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleShareVia}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <FaShareAlt className="text-gray-500" />
        Share via
      </button>
      
      <button
        onClick={onForward}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <FaForward className="text-gray-500" />
        Forward
      </button>
      
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <FaCopy className="text-gray-500" />
        Copy link
      </button>
    </div>
  );
}