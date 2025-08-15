"use client";

import { useState } from "react";

interface VibratePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (vibrateSetting: string) => void;
  defaultValue?: string;
}

export function VibratePopup({
  isOpen,
  onClose,
  onSave,
  defaultValue = "off",
}: VibratePopupProps) {
  const [selectedVibrate, setSelectedVibrate] = useState(defaultValue);

  const handleSave = () => {
    if (onSave) {
      onSave(selectedVibrate);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[300px] mx-4">
        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-black">Vibrate</h3>
        </div>

        {/* Options */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {/* Off Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="vibrateSetting"
                  value="off"
                  checked={selectedVibrate === "off"}
                  onChange={(e) => setSelectedVibrate(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVibrate === "off"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVibrate === "off" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Off</span>
            </label>

            {/* Default Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="vibrateSetting"
                  value="default"
                  checked={selectedVibrate === "default"}
                  onChange={(e) => setSelectedVibrate(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVibrate === "default"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVibrate === "default" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Default</span>
            </label>

            {/* Short Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="vibrateSetting"
                  value="short"
                  checked={selectedVibrate === "short"}
                  onChange={(e) => setSelectedVibrate(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVibrate === "short"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVibrate === "short" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Short</span>
            </label>

            {/* Long Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  name="vibrateSetting"
                  value="long"
                  checked={selectedVibrate === "long"}
                  onChange={(e) => setSelectedVibrate(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedVibrate === "long"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVibrate === "long" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-800 font-medium">Long</span>
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
