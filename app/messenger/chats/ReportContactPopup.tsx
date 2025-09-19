"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReportReasonPopup } from "./ReportReasonPopup";

interface ReportContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
}

export function ReportContactPopup({
  isOpen,
  onClose,
  contactName,
}: ReportContactPopupProps) {
  const [blockAndDelete, setBlockAndDelete] = useState(true);
  const [showReportReasonPopup, setShowReportReasonPopup] = useState(false);

  if (!isOpen) return null;

  if (showReportReasonPopup) {
    return (
      <ReportReasonPopup
        isOpen={true}
        onClose={onClose}
        contactName={contactName}
      />
    );
  }

  const handleCancel = () => {
    onClose();
  };

  const handleReport = () => {
    setShowReportReasonPopup(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-xl">
          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">
              Report {contactName}?
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              The last 5 messages from this business will be forwarded to
              AppsCombo. If you block this business and delete the chat,
              messages will only be removed from this device and your device on
              the newer version of AppsCombo
            </p>

            {/* Additional info */}
            <p className="text-gray-600 text-sm mb-6">
              This business will not be notified
            </p>

            {/* Checkbox */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  blockAndDelete
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setBlockAndDelete(!blockAndDelete)}
              >
                {blockAndDelete && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <label
                className="text-gray-800 text-sm font-medium cursor-pointer flex-1"
                onClick={() => setBlockAndDelete(!blockAndDelete)}
              >
                Block business and delete chat
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium px-6"
              >
                Cancel
              </Button>

              <Button
                variant="ghost"
                onClick={handleReport}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-medium px-6"
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
