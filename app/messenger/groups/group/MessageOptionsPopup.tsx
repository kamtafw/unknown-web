"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MessageOptionsPopupProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onPin: () => void;
  onDelete: () => void;
  onViewAnalytics: () => void;
}

export function MessageOptionsPopup({
  isOpen,
  position,
  onClose,
  onReply,
  onForward,
  onPin,
  onDelete,
  onViewAnalytics,
}: MessageOptionsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const options = [
    { label: "Reply", action: onReply },
    { label: "Copy", action: () => {} },
    { label: "Forward", action: onForward },
    { label: "Pin", action: onPin },
    { label: "Delete", action: onDelete },
    {
      label: "View message analytics",
      action: () => {
        onViewAnalytics();
      },
    },
  ];

  const shouldShowBelow = position.y < 250;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={popupRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border p-2 min-w-48"
        style={{
          left: position.x,
          top: shouldShowBelow ? position.y + 10 : position.y,
          transform: shouldShowBelow
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
        }}
      >
        <div className="flex flex-col gap-1">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={option.action}
              className="justify-start text-sm py-2 px-3 h-auto"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Emoji reactions */}
        <div className="flex items-center gap-2 mt-3 pt-3 ">
          {["😊", "😍", "😂", "😮", "😢", "😡", "👍", "👎", "❤️"].map(
            (emoji) => (
              <button
                key={emoji}
                className="text-lg hover:scale-125 transition-transform"
                onClick={onClose}
              >
                {emoji}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}
