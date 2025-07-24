"use client";

import { useState } from "react";

interface WiFiPopupProps {
  onClose: () => void;
  onSave: (selections: { photos: boolean; videos: boolean; audio: boolean; documents: boolean }) => void;
}

export default function WiFiPopup({ onClose, onSave }: WiFiPopupProps) {
  const [autoDownload, setAutoDownload] = useState({
    photos: true,
    videos: false,
    audio: true,
    documents: false,
  });

  return (
    <div className="bg-white p-6 rounded-lg w-full max-w-[400px]">
      <h2 className="text-lg font-semibold mb-4">When connected to Wi-Fi</h2>
      <p className="text-sm text-gray-600 mb-4">Select the quality for photos and videos to be sent in chats</p>
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoDownload.photos}
            onChange={(e) => setAutoDownload({ ...autoDownload, photos: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-base">Photos</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoDownload.videos}
            onChange={(e) => setAutoDownload({ ...autoDownload, videos: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-base">Videos</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoDownload.audio}
            onChange={(e) => setAutoDownload({ ...autoDownload, audio: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-base">Audio</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoDownload.documents}
            onChange={(e) => setAutoDownload({ ...autoDownload, documents: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-base">Documents</span>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2  text-red-600"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(autoDownload)}
          className="px-4 py-2  text-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}