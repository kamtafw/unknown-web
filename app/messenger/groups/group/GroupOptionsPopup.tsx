"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface GroupOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
  onNavigateToGroupList?: () => void;
  groupName?: string;
  groupAvatar?: string;
  hasGroupIcon?: boolean;
  onStartVideoCall?: () => void;
  onStartAudioCall?: () => void;
  onReadPostOutLoud?: () => void;
}

export function GroupOptionsPopup({
  onOptionSelect,
  onClose,
  onNavigateToGroupList,
  onReadPostOutLoud,
}: GroupOptionsPopupProps) {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const options = [
    { id: "readPostOutLoud", label: "Read post out loud" },
    { id: "groupInfo", label: "Group Info" },
    { id: "changeGroupName", label: "Change group name" },
    { id: "mediaLinks", label: "Media, Links & Docs" },
    { id: "addToList", label: "Add to list" },
    { id: "muteNotification", label: "Mute notification" },
    { id: "archiveChat", label: "Archive chat" },
    { id: "exitGroup", label: "Exit group", className: "text-red-500" },
  ];

  const handleArchiveSuccess = () => {
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      onClose();
      if (onNavigateToGroupList) {
        onNavigateToGroupList();
      }
    }, 2000);
  };

  if (showSuccessPopup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-xl">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Archive Successful!
          </h3>
          <p className="text-gray-600">
            The chat has been archived successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-2 w-80">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="ghost"
          onClick={() => {
            if (option.id === "readPostOutLoud") {
              onReadPostOutLoud?.();
              onClose();
            } else if (option.id === "groupInfo") {
              onOptionSelect(option.id);
            } else if (option.id === "archiveChat") {
              onOptionSelect(option.id);
              handleArchiveSuccess();
            } else {
              onOptionSelect(option.id);
            }
          }}
          className={`justify-start h-8 px-3 ${option.className || ""}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
