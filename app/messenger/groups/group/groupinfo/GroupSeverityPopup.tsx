"use client";

import React from "react";

interface GroupSeverityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeverity: string;
  onSelect: (severity: string) => void;
}

export function GroupSeverityPopup({
  isOpen,
  onClose,
  selectedSeverity,
  onSelect,
}: GroupSeverityPopupProps) {
  if (!isOpen) return null;

  const severityOptions = [
    {
      value: "Strict",
      label: "Strict",
      description: "",
    },
    {
      value: "Moderate",
      label: "Moderate",
      description: "",
    },
    {
      value: "Relaxed",
      label: "Relaxed",
      description: "",
    },
  ];

  const handleSelect = (severity: string) => {
    onSelect(severity);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[280px] mx-4">
        {/* Header */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">Group severity</h3>
          <p className="text-sm text-gray-500 mt-1">
            Some description about the group severity
          </p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          {severityOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="severity"
                value={option.value}
                checked={selectedSeverity === option.value}
                onChange={() => handleSelect(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-xs text-gray-500">{option.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedSeverity)}
            className="px-4 py-2 text-sm  text-blue-500 rounded hover:text-blue-600 transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}