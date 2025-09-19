import React, { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { MediaGalleryTab } from "./MediaGalleryTab";
import { DocsGalleryTab } from "./DocsGalleryTab";
import { LinksGalleryTab } from "./LinksGalleryTab";

interface MediaGalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
}

export default function MediaGalleryPopup({ 
  isOpen, 
  onClose, 
  contactName,
  contactAvatar 
}: MediaGalleryPopupProps) {
  const [activeTab, setActiveTab] = useState<"media" | "docs" | "links">("media");

  if (!isOpen) return null;

  const getStorageSize = () => {
    return "2.3 GB";
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Image
                  src={contactAvatar}
                  alt={contactName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <div>
                  <h2 className="font-medium text-sm">{contactName}</h2>
                  <p className="text-xs text-gray-500">{getStorageSize()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "media"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "docs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Docs
            </button>
            <button
              onClick={() => setActiveTab("links")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "links"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Links
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "media" && <MediaGalleryTab />}
            {activeTab === "docs" && <DocsGalleryTab />}
            {activeTab === "links" && <LinksGalleryTab />}
          </div>
        </div>
      </div>
    </>
  );
}