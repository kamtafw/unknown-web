import React, { useState } from "react";
import { ArrowLeft, Camera, Users } from "lucide-react";
import { MdGroups2 } from "react-icons/md";
import Image from "next/image";

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    description: string;
    avatar?: string;
  };
  onSave: (updatedCommunity: {
    name: string;
    description: string;
    avatar?: string;
  }) => void;
}

export default function EditCommunityModal({
  isOpen,
  onClose,
  community,
  onSave,
}: EditCommunityModalProps) {
  const [communityName, setCommunityName] = useState(community.name || "");
  const [description, setDescription] = useState(community.description || "");
  const [avatar] = useState(community.avatar || "");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      name: communityName,
      description: description,
      avatar: avatar,
    });
  };

  const maxDescriptionLength = 100;
  const remainingChars = maxDescriptionLength - description.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-full max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Edit Community</h2>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-20 w-20 bg-gray-300 rounded-xl flex items-center justify-center mb-2">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Community"
                      className="w-full h-full object-cover rounded-xl"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <MdGroups2 className="h-12 w-12 text-white" />
                  )}
                </div>
                <button
                  className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-50"
                  aria-label="Change avatar"
                >
                  <Camera className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter community name"
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 rounded p-1"
                  aria-label="Add members"
                >
                  <Users className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= maxDescriptionLength) {
                      setDescription(e.target.value);
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="placeholder"
                />
                <button
                  className="absolute bottom-3 right-3 hover:bg-gray-100 rounded p-1"
                  aria-label="Add members"
                >
                  <Users className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <span
                  className={`text-sm ${
                    remainingChars < 0 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {remainingChars}/1000
                </span>
              </div>
            </div>
          </div>

          {/* Create Community Button */}
          <div className="flex-shrink-0 pt-6">
            <button
              onClick={handleSave}
              disabled={!communityName.trim() || remainingChars < 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-4 rounded-full transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
