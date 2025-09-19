"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DeleteMessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
}

export function DeleteMessagePopup({
  isOpen,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
}: DeleteMessagePopupProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Delete Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-[90vw] max-w-[400px]">
        {/* Header */}
        <div className="p-4 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete message?
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-blue-600 hover:bg-blue-50 p-3 h-auto"
            onClick={() => {
              onDeleteForEveryone();
              onClose();
            }}
          >
            <span className="text-sm font-medium">Delete for everyone</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-blue-600 hover:bg-blue-50 p-3 h-auto"
            onClick={() => {
              onDeleteForMe();
              onClose();
            }}
          >
            <span className="text-sm font-medium">Delete for me</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 p-3 h-auto"
            onClick={onClose}
          >
            <span className="text-sm font-medium">Close</span>
          </Button>
        </div>
      </div>
    </>
  );
}
