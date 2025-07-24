"use client";

import { X } from "lucide-react";

interface TagPopupProps {
  onClose: () => void;
}

export default function TagPopup({ onClose }: TagPopupProps) {
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold"></h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close tag popup"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter tags"
          className="w-full p-2  rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <hr className="border-gray-200 mb-4" />
        <div className="space-y-2">
          {[
            { tag: "#Motivation", count: "2,349,090" },
            { tag: "#Inspiration", count: "2,349,090" },
            { tag: "#Productivity", count: "2,349,090" },
            { tag: "#Success", count: "2,349,090" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-800">{item.tag}</span>
              <span className="text-gray-500 text-sm">{item.count} posts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}