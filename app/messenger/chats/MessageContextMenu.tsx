"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Reply, Forward, Copy, Languages, Volume2 } from "lucide-react";

interface MessageContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  messageText: string;
  onReply: (messageText: string) => void;
  onForward: (messageText: string) => void;
  onReadAloud: (messageText: string) => void;
}

export function MessageContextMenu({
  isOpen,
  position,
  onClose,
  messageText,
  onReply,
  onForward,
  onReadAloud,
}: MessageContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const emojis = ["😊", "😂", "😍", "😎", "🥰", "😡", "❤️", "😋", "😐", "😛"];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);

      const menuWidth = Math.min(200, window.innerWidth - 20); // Account for mobile margins
      const menuHeight = 320;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Ensure menu stays within viewport with 10px margin
      if (position.x + menuWidth > viewportWidth - 10) {
        adjustedX = Math.max(10, viewportWidth - menuWidth - 10);
      }

      if (position.y + menuHeight > viewportHeight - 10) {
        adjustedY = Math.max(10, viewportHeight - menuHeight - 10);
      }

      // Ensure minimum margins on mobile
      adjustedX = Math.max(
        10,
        Math.min(adjustedX, viewportWidth - menuWidth - 10)
      );
      adjustedY = Math.max(
        10,
        Math.min(adjustedY, viewportHeight - menuHeight - 10)
      );

      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    } else {
      setIsVisible(false);
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (target.closest("[data-message-context-menu]")) {
        return;
      }

      if (isOpen) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside, true);
        document.addEventListener("keydown", handleEscape);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleReadAloud = () => {
    onReadAloud(messageText);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    console.log("Message copied:", messageText);
    onClose();
  };

  const handleTranslate = () => {
    console.log("Translate message:", messageText);
    onClose();
  };

  const handleEmojiClick = (emoji: string) => {
    console.log("React with emoji:", emoji);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu */}
      <div
        data-message-context-menu
       className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-3 w-[calc(100vw-40px)] max-w-[200px]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Items */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
            onClick={handleReadAloud}
          >
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm text-black font-semibold">
                Read out loud
              </span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
            onClick={() => {
              onReply(messageText);
              onClose();
            }}
          >
            <div className="flex items-center gap-3">
              <Reply className="h-4 w-4 " />
              <span className="text-sm text-black font-semibold">Reply</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
            onClick={() => {
              onForward(messageText);
              onClose();
            }}
          >
            <div className="flex items-center gap-3">
              <Forward className="h-4 w-4" />
              <span className="text-sm text-black font-semibold">Forward</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
            onClick={handleCopy}
          >
            <div className="flex items-center gap-3">
              <Copy className="h-4 w-4" />
              <span className="text-sm text-black font-semibold">Copy</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal hover:bg-gray-100 rounded-none text-gray-700"
            onClick={handleTranslate}
          >
            <div className="flex items-center gap-3">
              <Languages className="h-4 w-4" />
              <span className="text-sm text-black font-semibold">
                Translate
              </span>
            </div>
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Emoji Reactions */}
        <div className="px-4">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
