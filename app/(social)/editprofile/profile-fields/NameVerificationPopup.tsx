"use client";

import { X, Check } from "lucide-react";
import { useState } from "react";

interface NameVerificationPopupProps {
  onClose: () => void;
}

export default function NameVerificationPopup({ onClose }: NameVerificationPopupProps) {
  const [socialMediaLink, setSocialMediaLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Name verification</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Link to your verified social media
          </label>
          <div className="relative">
            <input
              type="text"
              value={socialMediaLink}
              onChange={(e) => setSocialMediaLink(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-10"
              placeholder="https://"
            />
            {socialMediaLink && (
              <Check
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              />
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Link to official website
          </label>
          <div className="relative">
            <input
              type="text"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-10"
              placeholder="https://"
            />
            {websiteLink && (
              <Check
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              />
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}