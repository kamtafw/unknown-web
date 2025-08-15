"use client";

import { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { MdGroups } from "react-icons/md";
import Image from "next/image";

interface Community {
  id: string;
  name: string;
  groupCount: number;
  avatar?: string;
}

interface AddToCommunityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (selectedCommunity: string | null) => void;
}

export function AddToCommunityPopup({
  isOpen,
  onClose,
  onSubmit,
}: AddToCommunityPopupProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );

  const communities: Community[] = [
    {
      id: "dth",
      name: "DTH",
      groupCount: 2,
    },
    {
      id: "ymgh",
      name: "YMGH",
      groupCount: 2,
    },
  ];

  const handleSubmit = () => {
    onSubmit?.(selectedCommunity);
    onClose();
  };

  const handleCreateNew = () => {
    setSelectedCommunity("create-new");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[320px] h-[75vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 ">
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Add group to community"
            title="Add group to community"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            Add to community
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Create new community option */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg  cursor-pointer transition-colors ${
              selectedCommunity === "create-new"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={handleCreateNew}
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <MdGroups className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-700">
                Create new community
              </div>
            </div>
          </div>

          {/* Existing communities */}
          <div className="mt-4 space-y-2">
            {communities.map((community) => (
              <div
                key={community.id}
                className={`flex items-center gap-3 p-3 rounded-lg  cursor-pointer transition-colors ${
                  selectedCommunity === community.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCommunity(community.id)}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  {community.avatar ? (
                    <Image
                      src={community.avatar}
                      alt={community.name}
                      width={48}
                      height={48}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {community.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Community • {community.groupCount} groups
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  {selectedCommunity === community.id && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!selectedCommunity}
            className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${
              selectedCommunity
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
