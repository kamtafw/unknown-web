"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: (deleteMedia: boolean) => void;
}

export function ClearChatPopup({
  isOpen,
  onClose,
  onClearChat,
}: ClearChatPopupProps) {
  const [deleteMedia, setDeleteMedia] = useState(false);

  const handleClearChat = () => {
    onClearChat(deleteMedia);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-[90%] max-w-[300px] sm:max-w-[400px] lg:w-150 p-4 sm:p-6">
        {/* Header */}
        <h3 className="text-base sm:text-lg lg:text-lg font-semibold mb-4 sm:mb-6">
          Clear this chat
        </h3>

        {/* Delete Media Option */}
        <div
          className="flex items-center gap-3 mb-4 sm:mb-6 cursor-pointer"
          onClick={() => setDeleteMedia(!deleteMedia)}
        >
          <div
            className={`w-5 h-5 border-2 rounded ${
              deleteMedia ? "bg-blue-500 border-blue-500" : "border-gray-300"
            } flex items-center justify-center`}
          >
            {deleteMedia && <Check className="h-3 w-3 text-white" />}
          </div>
         <span className="text-gray-700 text-xs sm:text-sm lg:text-sm">
            Also delete media received in this chat from the device gallery
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 sm:gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
           className="text-red-500 hover:text-red-600 text-xs sm:text-sm lg:text-sm px-3 sm:px-4"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearChat}
            className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm lg:text-sm px-3 sm:px-4"
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </>
  );
}
