"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MuteNotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (duration: string) => void;
}

export function MuteNotificationPopup({
  isOpen,
  onClose,
  onSave
}: MuteNotificationPopupProps) {
  const [selectedDuration, setSelectedDuration] = useState("8hours");

  const durations = [
    { id: "8hours", label: "8 hours" },
    { id: "1week", label: "1 week" },
    { id: "always", label: "Always" }
  ];

  const handleSave = () => {
    onSave(selectedDuration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-150 p-6">
        {/* Header */}
        <h3 className="text-lg font-semibold mb-4">Mute notification</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          Other members will not see that you muted this chat, you will be notified if you are mentioned.
        </p>

        {/* Duration Options */}
        <div className="space-y-3 mb-6">
          {durations.map((duration) => (
            <div
              key={duration.id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDuration(duration.id);
              }}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedDuration === duration.id
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              } flex items-center justify-center`}>
                {selectedDuration === duration.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-gray-700">{duration.label}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-red-500 hover:text-red-600"
          >
            Cancel
          </Button>
          <Button
          variant="ghost"
            onClick={handleSave}
            className="text-blue-500 hover:text-blue-600"
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
}