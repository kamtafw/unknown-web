"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ArchiveContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  itemId: string;
  itemName: string;
  onClearMessages: (itemName: string) => void;
}

export function ArchiveContextMenu({
  isOpen,
  position,
  onClose,
  itemId,
  itemName,
  onClearMessages,
}: ArchiveContextMenuProps) {
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

  const handleUnarchive = () => {
    console.log(`Unarchiving ${itemName} (ID: ${itemId})`);
    onClose();
  };

  const handleClearMessages = () => {
    onClose();
    onClearMessages(itemName);
  };

  const handleMarkAsRead = () => {
    console.log(`Marking ${itemName} as read (ID: ${itemId})`);
    onClose();
  };

  if (!isOpen) return null;

  const menuWidth = 160;
  const menuHeight = 132;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let adjustedX = position.x;
  let adjustedY = position.y;

  if (position.x + menuWidth > viewportWidth) {
    adjustedX = position.x - menuWidth;
  }

  if (position.y + menuHeight > viewportHeight) {
    adjustedY = position.y - menuHeight;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px]"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
    >
      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm hover:bg-gray-100 rounded-none"
        onClick={handleUnarchive}
      >
        Unarchive
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm hover:bg-gray-100 rounded-none"
        onClick={handleClearMessages}
      >
        Clear Messages
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm hover:bg-gray-100 rounded-none"
        onClick={handleMarkAsRead}
      >
        Mark as read
      </Button>
    </div>
  );
}
