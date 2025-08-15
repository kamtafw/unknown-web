"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface TagPopupProps {
  onClose: () => void;
  onTagSelect: (tag: string) => void;
}

export default function TagPopup({ onClose, onTagSelect }: TagPopupProps) {
  const [inputValue, setInputValue] = useState("");

  const predefinedTags = [
    { tag: "#Motivation", count: "2,349,090" },
    { tag: "#Inspiration", count: "2,349,090" },
    { tag: "#Productivity", count: "2,349,090" },
    { tag: "#Success", count: "2,349,090" },
  ];

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
    onTagSelect(cleanTag);
    onClose();
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const cleanTag = inputValue.trim().startsWith('#') 
        ? inputValue.trim().slice(1) 
        : inputValue.trim();
      onTagSelect(cleanTag);
      onClose();
    }
  };

  const handleAddCustomTag = () => {
    if (inputValue.trim()) {
      const cleanTag = inputValue.trim().startsWith('#') 
        ? inputValue.trim().slice(1) 
        : inputValue.trim();
      onTagSelect(cleanTag);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Tags</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close tag popup"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter custom tag"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputSubmit}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCustomTag}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        
        <hr className="border-gray-200 mb-4" />
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">Popular tags:</p>
          {predefinedTags.map((item, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition-colors"
              onClick={() => handleTagClick(item.tag)}
            >
              <span className="text-gray-800">{item.tag}</span>
              <span className="text-gray-500 text-sm">{item.count} posts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}