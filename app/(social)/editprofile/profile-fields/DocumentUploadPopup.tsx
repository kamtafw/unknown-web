"use client";

import { X } from "lucide-react";
import { IoDocumentText } from "react-icons/io5";
import { GoUpload } from "react-icons/go";
import { useState, useRef } from "react";

interface DocumentUploadPopupProps {
  onClose: () => void;
}

export default function DocumentUploadPopup({
  onClose,
}: DocumentUploadPopupProps) {
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);

  const govIdInputRef = useRef<HTMLInputElement>(null);
  const businessRegInputRef = useRef<HTMLInputElement>(null);

  const handleGovIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGovIdFile(file);
    }
  };

  const handleBusinessRegUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessRegFile(file);
    }
  };

  const handleGovIdBoxClick = () => {
    govIdInputRef.current?.click();
  };

  const handleBusinessRegBoxClick = () => {
    businessRegInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Name validation</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Government ID Upload Section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <label className="text-sm font-semibold text-gray-900">
              Gov&#39;t issued ID Card
            </label>
          </div>
          <div
            onClick={handleGovIdBoxClick}
            className=" border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoDocumentText size={20} className="mr-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {govIdFile ? govIdFile.name : "Tap to upload document"}
                </span>
              </div>
              <GoUpload size={16} className="text-gray-400" />
            </div>
          </div>
          <input
            ref={govIdInputRef}
            type="file"
            onChange={handleGovIdUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            title="Upload government issued ID card"
            placeholder="Upload government issued ID card"
          />
        </div>

        {/* Business Registration Certificate Upload Section */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <label className="text-sm font-semibold text-gray-900">
              Business registration certificate
            </label>
          </div>
          <div
            onClick={handleBusinessRegBoxClick}
            className=" border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IoDocumentText size={20} className="mr-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {businessRegFile
                    ? businessRegFile.name
                    : "Tap to upload document"}
                </span>
              </div>
              <GoUpload size={16} className="text-gray-400" />
            </div>
          </div>
          <input
            ref={businessRegInputRef}
            type="file"
            onChange={handleBusinessRegUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            title="Upload business registration certificate"
            placeholder="Upload business registration certificate"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}
