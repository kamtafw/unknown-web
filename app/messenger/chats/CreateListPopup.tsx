"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FiSmile } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface CreateListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

export function CreateListPopup({
  isOpen,
  onClose,
  onDone,
}: CreateListPopupProps) {
  const [listName, setListName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleDone = () => {
    onDone();
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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-[90vw] max-w-md h-150 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create a custom list</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            List of name
          </label>
          <div className="relative">
            <textarea
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
              className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              maxLength={8}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2 mb-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="smile"
              >
                <FiSmile className="h-4 w-4 text-black" />
              </button>
              <span className="text-xs text-gray-400">
                {listName.length}/30
              </span>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-sm text-black mb-6">
          Any list you create becomes a filter at the top of your chat tab
        </p>

        {/* Done Button */}
        <div className="mt-67 sm:mt-100 w-full flex justify-center bg-blue-500 hover:bg-blue-600 rounded-full">
          <Button
            variant="ghost"
            onClick={handleDone}
            className="bg-transparent hover:bg-transparent text-white px-6"
          >
            Done
          </Button>
        </div>

        {/* Simple Emoji Picker (you can replace with a proper emoji picker library) */}
        {showEmojiPicker && (
          <div className="absolute top-32 right-6 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1">
            {["😊", "❤️", "👍", "🎉", "🔥", "⭐", "💯", "👏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setListName((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-1 hover:bg-gray-100 rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
