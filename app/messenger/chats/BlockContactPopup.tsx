"use client";

import { useState } from "react";
import { X, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import Image from "next/image";

interface BlockContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (reason: string, feedback: string) => void;
  chatName: string;
}

export function BlockContactPopup({
  isOpen,
  onClose,
  onBlock,
  chatName,
}: BlockContactPopupProps) {
  const [selectedReason, setSelectedReason] = useState("Unwanted calls");
  const [feedback, setFeedback] = useState("");
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const reasons = [
    "Unwanted calls",
    "Spam messages",
    "Harassment",
    "Inappropriate content",
    "Other",
  ];

  const handleBlock = () => {
    onBlock(selectedReason, feedback);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-[90%] max-w-[320px] sm:max-w-[384px] lg:w-96 h-auto max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg lg:text-lg font-semibold">
            Block {chatName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Block Image */}
        <div className="flex justify-center mb-6">
          <Image
            src="/BlockChat.png"
            alt="Block Chat"
            width={70}
            height={70}
            className="object-contain"
          />
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 sm:mb-6 text-left text-sm sm:text-base lg:text-base">
          {chatName} wont be able to message or call you anymore.
        </p>

        {/* Reason for Blocking */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-sm text-black mb-2 font-semibold">
            Reason for blocking:
          </label>
          <div className="relative">
            <div
              className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between"
              onClick={() => setShowReasonDropdown(!showReasonDropdown)}
            >
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{selectedReason}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>

            {showReasonDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                {reasons.map((reason) => (
                  <div
                    key={reason}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setSelectedReason(reason);
                      setShowReasonDropdown(false);
                    }}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-black mb-2 font-semibold">
            Your feedback is very much appreciated
          </p>
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write something"
              className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              maxLength={100}
            />
            <div className="absolute bottom-2 right-2">
              <span className="text-xs text-gray-400">
                {feedback.length}/200
              </span>
            </div>
          </div>
        </div>

        {/* Block Button */}
        <div className="mt-6 sm:mt-8 lg:mt-40 w-full flex justify-center bg-blue-500 hover:bg-blue-600 rounded-full">
          <Button
            variant="ghost"
            onClick={handleBlock}
            className="bg-transparent hover:bg-transparent text-white px-6"
          >
            Block
          </Button>
        </div>
      </div>
    </>
  );
}
