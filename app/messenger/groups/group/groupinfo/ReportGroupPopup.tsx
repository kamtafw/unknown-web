"use client";

import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";

interface ReportGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupAvatar?: string;
  hasGroupIcon?: boolean;
  onSubmitReport?: (reason: string, details?: string) => void;
}

export function ReportGroupPopup({
  isOpen,
  onClose,
  onSubmitReport,
}: ReportGroupPopupProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");

  const reportReasons = [
    {
      id: "reason1",
      label:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    },
    {
      id: "reason2",
      label:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    },
    {
      id: "reason3",
      label:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    },
    {
      id: "reason4",
      label:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    },
    { id: "other", label: "Other" },
  ];

  const handleSubmitReport = () => {
    if (selectedReason && onSubmitReport) {
      onSubmitReport(selectedReason, additionalDetails);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[380px] mx-4 max-h-[75vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center p-4 ">
          <button
            onClick={onClose}
            title="Go back"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoMdArrowBack className="h-6 w-6 text-black" />
          </button>
          <h2 className="text-lg font-semibold text-black ml-3">
            Report group
          </h2>
        </div>

        <div className="p-4">
          {/* Report Reasons */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-black mb-4">
              Please select a problem
            </p>
            <div className="space-y-3">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      selectedReason === reason.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedReason === reason.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-3">
              Your feedback is very much appreciated
            </label>
            <div className="relative">
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Placeholder"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={1}
                maxLength={200}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {additionalDetails.length}/200
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSubmitReport}
              disabled={!selectedReason}
              className={`w-full py-3 font-medium rounded-full transition-colors ${
                selectedReason
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
