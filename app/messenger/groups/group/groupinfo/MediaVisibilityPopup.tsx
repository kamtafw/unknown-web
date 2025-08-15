"use client";

import { useState } from "react";

interface MediaVisibilityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (visibility: string) => void;
  defaultValue?: string;
}

export function MediaVisibilityPopup({
  isOpen,
  onClose,
  onSave,
  defaultValue = "default",
}: MediaVisibilityPopupProps) {
  const [selectedVisibility, setSelectedVisibility] = useState(defaultValue);

  const handleSave = () => {
    if (onSave) {
      onSave(selectedVisibility);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[270px] mx-4">
        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-black mb-2">
            Media visibility
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Show newly downloaded media from this chat in your device&#39;s gallery
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="mediaVisibility"
                  value="default"
                  checked={selectedVisibility === "default"}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVisibility === "default"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVisibility === "default" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Default (Yes)</span>
            </label>

            {/* Yes Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="mediaVisibility"
                  value="yes"
                  checked={selectedVisibility === "yes"}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVisibility === "yes"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVisibility === "yes" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Yes</span>
            </label>

            {/* No Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="mediaVisibility"
                  value="no"
                  checked={selectedVisibility === "no"}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVisibility === "no"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVisibility === "no" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">No</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-blue-500 font-medium hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}