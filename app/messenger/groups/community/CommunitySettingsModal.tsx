import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";


interface CommunitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    whoCanAddMembers: "Everyone" | "Only Admins";
    whoCanAddGroups: "Everyone" | "Only Admins";
  };
  onSettingsChange: (settings: { whoCanAddMembers: "Everyone" | "Only Admins"; whoCanAddGroups: "Everyone" | "Only Admins" }) => void;
}


export function CommunitySettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: CommunitySettingsModalProps) {
  const [showMembersPermission, setShowMembersPermission] = useState(false);
  const [showGroupsPermission, setShowGroupsPermission] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(settings);

  if (!isOpen) return null;

  const handleMembersPermissionChange = (permission: "Everyone" | "Only Admins") => {
    const newSettings = { ...currentSettings, whoCanAddMembers: permission };
    setCurrentSettings(newSettings);
    onSettingsChange(newSettings);
    setShowMembersPermission(false);
  };

  const handleGroupsPermissionChange = (permission: "Everyone" | "Only Admins") => {
    const newSettings = { ...currentSettings, whoCanAddGroups: permission };
    setCurrentSettings(newSettings);
    onSettingsChange(newSettings);
    setShowGroupsPermission(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg w-full max-w-md h-full max-h-[50vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Community settings</h2>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-6">
            {/* Who can add new members */}
            <div>
              <button
                onClick={() => setShowMembersPermission(true)}
                className="w-full text-left"
              >
                <h3 className="font-medium text-base mb-1">Who can add new members</h3>
                <p className="text-sm text-gray-500">{currentSettings.whoCanAddMembers}</p>
              </button>
            </div>

            {/* Who can add new groups */}
            <div>
              <button
                onClick={() => setShowGroupsPermission(true)}
                className="w-full text-left"
              >
                <h3 className="font-medium text-base mb-1">Who can add new groups</h3>
                <p className="text-sm text-gray-500">{currentSettings.whoCanAddGroups}</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Permission Modal */}
      {showMembersPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-4">
            <h3 className="font-medium text-base mb-4">Who can add new members</h3>
            <p className="text-sm text-gray-600 mb-4">Programmers Circuit</p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleMembersPermissionChange("Everyone")}
                className={`w-full text-right py-2 px-3 rounded ${
                  currentSettings.whoCanAddMembers === "Everyone"
                    ? "text-blue-500 font-medium"
                    : "text-blue-700 hover:bg-gray-50"
                }`}
              >
                Everyone
              </button>
              <button
                onClick={() => handleMembersPermissionChange("Only Admins")}
                className={`w-full text-right py-2 px-3 rounded ${
                  currentSettings.whoCanAddMembers === "Only Admins"
                    ? "text-blue-500 font-medium"
                    : "text-blue-700 hover:bg-gray-50"
                }`}
              >
                Only Admins
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMembersPermission(false)}
                className="text-red-500 font-medium py-2 px-4 hover:bg-red-50 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Permission Modal */}
      {showGroupsPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-4">
            <h3 className="font-medium text-base mb-6">Who can add new groups</h3>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleGroupsPermissionChange("Everyone")}
                className={`w-full text-right py-2 px-3 rounded ${
                  currentSettings.whoCanAddGroups === "Everyone"
                    ? "text-blue-500 font-medium"
                    : "text-blue-700 hover:bg-gray-50"
                }`}
              >
                Everyone
              </button>
              <button
                onClick={() => handleGroupsPermissionChange("Only Admins")}
                className={`w-full text-right py-2 px-3 rounded ${
                  currentSettings.whoCanAddGroups === "Only Admins"
                    ? "text-blue-500 font-medium"
                    : "text-blue-700 hover:bg-gray-50"
                }`}
              >
                Only Admins
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowGroupsPermission(false)}
                className="text-red-500 font-medium py-2 px-4 hover:bg-red-50 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}