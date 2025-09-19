"use client";

import { useEffect, useRef } from "react";
import { Share, Repeat, Forward } from "lucide-react";

interface ContactStatusActionsPopupProps {
  onClose: () => void;
  onForward: () => void; 
}

export function ContactStatusActionsPopup({ onClose, onForward }: ContactStatusActionsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleShare = () => {
    console.log("Share clicked");
    onClose();
  };

  const handleRepost = () => {
    console.log("Repost clicked");
    onClose();
  };

  const handleForward = () => {
    console.log("Forward clicked - triggering onForward");
    onForward();
    onClose(); 
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-40 min-w-[140px]"
    >
      <button
        onClick={handleShare}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <Share className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">Share</span>
      </button>

      <button
        onClick={handleRepost}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <Repeat className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">Re post</span>
      </button>

      <button
        onClick={handleForward}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <Forward className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">Forward</span>
      </button>
    </div>
  );
}