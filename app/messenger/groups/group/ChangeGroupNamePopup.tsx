"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChangeGroupNamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
}

export function ChangeGroupNamePopup({ isOpen, onClose, currentName }: ChangeGroupNamePopupProps) {
  const [newName, setNewName] = useState(currentName);

  const handleSave = () => {
    console.log("Changing group name to:", newName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-96 h-150">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Change group name</h2>
            <Button
              variant="ghost"
              
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-[60px] w-[60px] text-black" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm  text-black font-semibold mb-2">
                Default name
              </label>
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                {currentName}
              </div>
            </div>

            <div>
              <label className="block text-sm text-black font-semibold  mb-2">
                New name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new group name"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 mt-75 rounded-full"
              disabled={!newName.trim() || newName === currentName}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}