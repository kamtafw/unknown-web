"use client";

import React, { useState } from "react";
import { IoDocument } from "react-icons/io5";
import { IoChevronForwardOutline } from "react-icons/io5";

export default function DocumentUploadForm({
  onNext,
  onPrev,
}: {
  onNext?: (data: {
    document1: File | null;
    document2: File | null;
    document3: File | null;
  }) => void;
  onPrev?: () => void;
}) {
  const [document1, setDocument1] = useState<File | null>(null);
  const [document2, setDocument2] = useState<File | null>(null);
  const [document3, setDocument3] = useState<File | null>(null);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const formData = {
      document1,
      document2,
      document3,
    };
    console.log("Document Data:", formData);

    if (onNext) {
      onNext(formData);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrev) {
      onPrev();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const DocumentField = ({
    label,
    file,
    onChange,
  }: {
    label: string;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">{label}</label>
      <div className="relative">
        <input
          id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
          aria-label={`Upload ${label}`}
          type="file"
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <div className="flex items-center justify-between w-full pl-12 pr-12 py-4 text-base border-2 border-blue-200 rounded-xl focus-within:border-blue-400 transition-colors bg-white cursor-pointer">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <IoDocument className="w-5 h-5 text-black" />
          </div>
          <span className={file ? "text-gray-900" : "text-gray-400"}>
            {file ? file.name : "Placeholder"}
          </span>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <IoChevronForwardOutline className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-4 flex justify-center">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Account Set up
            </h1>
          </div>

          {/* Document Fields */}
          <DocumentField
            label="Document"
            file={document1}
            onChange={(e) => handleFileChange(e, setDocument1)}
          />

          <DocumentField
            label="Document"
            file={document2}
            onChange={(e) => handleFileChange(e, setDocument2)}
          />

          <DocumentField
            label="Document"
            file={document3}
            onChange={(e) => handleFileChange(e, setDocument3)}
          />

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 bg-white text-blue-400 border-2 border-blue-400 py-3 px-4 rounded-full font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-400 text-white py-3 px-4 rounded-full font-medium hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
