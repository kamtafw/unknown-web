import React, { useState } from "react";
import {  ArrowLeft } from "lucide-react";
import { MediaTab } from "./MediaTab";
import { DocsTab } from "./DocsTab";
import { LinksTab } from "./LinksTab";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaModal({ isOpen, onClose }: MediaModalProps) {
  const [activeTab, setActiveTab] = useState<"media" | "docs" | "link">("media");

  if (!isOpen) return null;

  const getTabTitle = () => {
    switch (activeTab) {
      case "media":
        return "DTH";
      case "docs":
        return "DTH";
      case "link":
        return "DTH";
      default:
        return "DTH";
    }
  };

  const getStorageSize = () => {
    return "2.3 GB";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close modal"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-white text-xs font-medium">DT</span>
              </div>
              <div>
                <h2 className="font-medium text-sm">{getTabTitle()}</h2>
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
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "link"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Link
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "media" && <MediaTab />}
          {activeTab === "docs" && <DocsTab />}
          {activeTab === "link" && <LinksTab />}
        </div>
      </div>
    </div>
  );
}