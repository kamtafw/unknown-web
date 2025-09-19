import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface ReportCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (reason: string, feedback: string) => void;
}

export function ReportCommunityModal({
  isOpen,
  onClose,
  onSubmit,
}: ReportCommunityModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const reportReasons = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
    "Other"
  ];

  const handleSubmit = () => {
    if (selectedReason || feedback.trim()) {
      if (onSubmit) {
        onSubmit(selectedReason, feedback);
      }
      setSelectedReason("");
      setFeedback("");
      onClose();
    }
  };

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-full max-h-[68vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Report community</h2>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-medium mb-4">Please select a problem</h3>
            <div className="space-y-3">
              {reportReasons.map((reason, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => handleReasonSelect(reason)}
                    className="mt-1 w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Your feedback is very much appreciated
            </p>
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Placeholder"
                maxLength={200}
                rows={1}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {feedback.length}/200
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-auto">
            <button
              onClick={handleSubmit}
              disabled={!selectedReason && !feedback.trim()}
              className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}