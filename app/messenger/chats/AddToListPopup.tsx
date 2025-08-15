"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaHeart } from "react-icons/fa6";

interface AddToListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewList: () => void;
  onAddToFavorites: () => void;
}

export function AddToListPopup({
  isOpen,
  onClose,
  onCreateNewList,
}: 
AddToListPopupProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-90 h-150 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Add to list</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Create New List Option */}
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer mb-4">
          <div className="w-12 h-12 border-2 border-blue-500 rounded-full flex items-center justify-center">
            <Plus className="h-7 w-7 text-blue-500" />
          </div>
          <span className="text-blue-700">Create new list</span>
        </div>

        {/* Favorites Option */}
        <div
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer mb-6"
          onClick={() => toggleOption("favorites")}
        >
          <div className="flex items-center gap-3">
            <FaHeart className="h-6 w-6 text-red-500" />
            <span className="text-gray-700">Favorites</span>
          </div>
          <div
            className={`w-5 h-5 border-2 rounded ${
              selectedOptions.includes("favorites")
                ? "bg-blue-500 border-blue-500"
                : "border-gray-300"
            } flex items-center justify-center`}
          >
            {selectedOptions.includes("favorites") && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-80 w-full border bg-blue-500 hover:bg-blue-600 rounded-full flex justify-center">
          <Button
            variant="ghost"
            onClick={onCreateNewList}
            className=" text-white px-6 bg-transparent hover:bg-transparent"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
