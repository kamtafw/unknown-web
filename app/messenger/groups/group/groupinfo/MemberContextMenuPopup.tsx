"use client";

import { useEffect, useRef } from "react";

interface MemberContextMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  position: { x: number; y: number };
  isAdmin?: boolean;
  isCurrentUserAdmin?: boolean;
  memberStatus?: string;
  onMessageMember?: () => void;
  onViewMember?: () => void;
  onRemoveMember?: () => void;
  onMakeAdmin?: () => void;
  onRestrictMember?: () => void;
  onSuspendMember?: () => void;
}

export function MemberContextMenuPopup({
  isOpen,
  onClose,
  // memberName,
  position,
  // isAdmin = false,
  isCurrentUserAdmin = false,
  memberStatus,
  onMessageMember,
  onViewMember,
  onRemoveMember,
  onMakeAdmin,
  onRestrictMember,
  onSuspendMember,
}: MemberContextMenuPopupProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleMessageClick = () => {
    if (onMessageMember) {
      onMessageMember();
    }
    onClose();
  };

  const handleViewClick = () => {
    if (onViewMember) {
      onViewMember();
    }
    onClose();
  };

  const handleRemoveClick = () => {
    if (onRemoveMember) {
      onRemoveMember();
    }
    onClose();
  };

  const handleMakeAdminClick = () => {
    if (onMakeAdmin) {
      onMakeAdmin();
    }
    onClose();
  };

  const handleRestrictClick = () => {
    if (onRestrictMember) {
      onRestrictMember();
    }
    onClose();
  };

  const handleSuspendClick = () => {
    if (onSuspendMember) {
      onSuspendMember();
    }
    onClose();
  };

  if (!isOpen) return null;

  // Check if the member is already an admin
  const isMemberAdmin = memberStatus === "Group admin";

  return (
    <div className="fixed inset-0 z-[10001]">
      <div
        ref={menuRef}
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Basic actions available to all users */}
        <button
          onClick={handleMessageClick}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-800 font-medium">Message</span>
        </button>
        
        <button
          onClick={handleViewClick}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-800 font-medium">View</span>
        </button>

        {/* Admin-only actions */}
        {isCurrentUserAdmin && !isMemberAdmin && (
          <>
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleRemoveClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-800 font-medium">Remove</span>
            </button>

            <button
              onClick={handleMakeAdminClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-800 font-medium">Make group admin</span>
            </button>

            <button
              onClick={handleRestrictClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-800 font-medium">Restrict</span>
            </button>

            <button
              onClick={handleSuspendClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-800 font-medium">Suspend</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}