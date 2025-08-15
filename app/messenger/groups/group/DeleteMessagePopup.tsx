"use client";

import { Button } from "@/components/ui/button";

interface DeleteMessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteMessagePopup({ isOpen, onClose }: DeleteMessagePopupProps) {
  const handleDeleteForEveryone = () => {
    console.log("Delete for everyone");
    onClose();
  };

  const handleDeleteForMe = () => {
    console.log("Delete for me");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg sm:max-w-sm w-full mx-4 p-6 items-center justify-center">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Delete message?</h2>
        </div>
        
        <div className="flex flex-col gap-3 mt-4 items-end justify-end">
          <Button
            variant="ghost"
            onClick={handleDeleteForEveryone}
            className="text-blue-600  hover:bg-blue-50"
          >
            Delete for everyone
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeleteForMe}
            className="text-blue-600  hover:bg-blue-50"
          >
            Delete for me
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-red-500 hover:bg-red-50"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}