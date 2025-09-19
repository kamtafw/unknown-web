"use client";

import { useState } from "react";

interface MediaUploadQualityPopupProps {
  onClose: () => void;
  onSave: (quality: string) => void;
}

export default function MediaUploadQualityPopup({ onClose, onSave }: MediaUploadQualityPopupProps) {
  const [quality, setQuality] = useState("Standard Quality");

  return (
    <div className="bg-white p-6 rounded-lg w-full max-w-[400px]">
      <h2 className="text-lg font-semibold mb-4">Media upload quality</h2>
      <p className="text-sm text-gray-600 mb-4">Select the quality for photos and videos to be sent in chats</p>
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="quality"
            value="Standard"
            checked={quality === "Standard"}
            onChange={(e) => setQuality(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <span className="text-base">Standard quality</span>
            <p className="text-sm text-gray-500">Faster to send, smaller file size</p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="quality"
            value="HD"
            checked={quality === "HD"}
            onChange={(e) => setQuality(e.target.value)}
            className="w-4 h-4 text-blue-600"
          />
          <div>
            <span className="text-base">HD quality</span>
            <p className="text-sm text-gray-500">Slower to send, can be 6 times larger</p>
          </div>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2  hover:bg-gray-300  text-red-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(quality)}
          className="px-4 py-2  text-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}