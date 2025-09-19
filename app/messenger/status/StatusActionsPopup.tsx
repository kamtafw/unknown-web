"use client";

import { useEffect, useRef } from "react";
import { Forward, Edit3, Share, Trash2 } from "lucide-react";

interface StatusActionsPopupProps {
  onClose: () => void;
  onForward: () => void;
  onEditStory: () => void;
}

export function StatusActionsPopup({ onClose, onForward, onEditStory }: StatusActionsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAction = (action: string) => {
    if (action === "Forward") {
      onForward();
      onClose(); 
    } else if (action === "Edit story") { 
      onEditStory();
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div 
      ref={popupRef}
      className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50"
    >
      <button
        onClick={() => handleAction("Forward")}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
      >
        <Forward className="h-4 w-4 text-gray-600" />
        <span>Forward</span>
      </button>
      
      <button
        onClick={() => handleAction("Edit story")}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
      >
        <Edit3 className="h-4 w-4 text-gray-600" />
        <span>Edit story</span>
      </button>
      
      <button
        onClick={() => handleAction("Share")}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
      >
        <Share className="h-4 w-4 text-gray-600" />
        <span>Share</span>
      </button>
      
      <div className="border-t border-gray-100 my-1" />
      
      <button
        onClick={() => handleAction("Delete")}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left text-red-600"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}