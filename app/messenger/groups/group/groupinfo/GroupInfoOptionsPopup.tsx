import React from "react";
import { X, UserPlus, Edit, Shield } from "lucide-react";

interface GroupInfoOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeGroupName: () => void;
  isAdmin?: boolean;
  onAddMembers?: () => void;
  onGroupPermission?: () => void;
}

export function GroupInfoOptionsPopup({
  isOpen,
  onClose,
  onChangeGroupName,
  isAdmin = false,
  onAddMembers,
  onGroupPermission,
}: GroupInfoOptionsPopupProps) {
  if (!isOpen) return null;

  const handleChangeGroupName = () => {
    onChangeGroupName();
    onClose();
  };

  const handleAddMembers = () => {
    if (onAddMembers) {
      onAddMembers();
    }
    onClose();
  };

  const handleGroupPermission = () => {
    if (onGroupPermission) {
      onGroupPermission();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[280px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="p-2 space-y-1">
          {/* Add Members - Admin Only */}
          {isAdmin && (
            <button
              onClick={handleAddMembers}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="h-5 w-5 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add members</span>
            </button>
          )}

          {/* Change Group Name */}
          <button
            onClick={handleChangeGroupName}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
          >
            <div className="h-5 w-5 flex items-center justify-center">
              <Edit className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Change group name</span>
          </button>

          {/* Group Permission - Admin Only */}
          {isAdmin && (
            <button
              onClick={handleGroupPermission}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="h-5 w-5 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Group permission</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}