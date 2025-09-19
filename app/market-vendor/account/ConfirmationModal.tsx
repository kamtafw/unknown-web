"use client";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: "red" | "blue" | "green";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "blue",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getConfirmButtonStyles = () => {
    switch (confirmButtonColor) {
      case "red":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "green":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "blue":
      default:
        return "text-blue-500 hover:bg-blue-200 ";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
            {title}
          </h3>          
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-red-500 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 font-medium transition-colors rounded-lg ${getConfirmButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}