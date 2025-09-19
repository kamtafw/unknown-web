"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportReasonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
}

interface ReportOption {
  id: string;
  text: string;
}

const reportOptions: ReportOption[] = [
  {
    id: "option1",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
  },
  {
    id: "option2", 
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
  },
  {
    id: "option3",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
  },
  {
    id: "option4",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
  },
  {
    id: "other",
    text: "Other"
  }
];

export function ReportReasonPopup({
  isOpen,
  onClose,
  contactName,
}: ReportReasonPopupProps) {
  const [selectedOption, setSelectedOption] = useState<string>("other");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const maxChars = 200;

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Submitting report for:", contactName);
    console.log("Selected reason:", selectedOption);
    console.log("Feedback:", feedbackText);
    onClose();
  };

  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-medium">Report {contactName}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Problem Selection */}
            <div className="mb-6">
              <h3 className="text-base font-medium mb-4">Please select a problem</h3>
              
              <div className="space-y-3">
                {reportOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => handleOptionChange(option.id)}
                  >
                    <div className="relative flex items-center justify-center mt-1">
                      <input
                        type="radio"
                        name="reportReason"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => handleOptionChange(option.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === option.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {selectedOption === option.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3">
                Your feedback is very much appreciated
              </h3>
              
              <div className="relative">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, maxChars))}
                  placeholder="Placeholder"
                  className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={maxChars}
                />
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {feedbackText.length}/{maxChars}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}