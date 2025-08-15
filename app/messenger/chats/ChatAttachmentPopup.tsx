"use client";

import { useEffect, useRef } from "react";
import { GrGallery } from "react-icons/gr";
import { IoMdCamera, IoMdMusicalNotes } from "react-icons/io";
import { MdContactPhone } from "react-icons/md";
import { IoDocumentTextSharp, IoLocation } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";

interface ChatAttachmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

export function ChatAttachmentPopup({
  isOpen,
  onClose,
  onSelect,
}: ChatAttachmentPopupProps) {
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

  const attachmentOptions = [
    { id: "gallery", label: "Gallery", icon: GrGallery, color: "text-red-500" },
    { id: "camera", label: "Camera", icon: IoMdCamera, color: "text-blue-500" },
    { id: "contact", label: "Contact", icon: MdContactPhone, color: "text-green-500" },
    { id: "location", label: "Location", icon: IoLocation, color: "text-orange-500" },
    {
      id: "document",
      label: "Document",
      icon: IoDocumentTextSharp,
      color: "text-purple-500",
    },
    { id: "music", label: "Music", icon: IoMdMusicalNotes, color: "text-indigo-500" },
    { id: "schedule", label: "Schedule", icon: FaCalendarAlt, color: "text-teal-500" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={popupRef}
        className="absolute z-50 bg-white rounded-t-lg shadow-lg border bottom-full mb-5.5 left-0"
        style={{ width: "780px", marginLeft: "-53px" }}
      >
        <div className="flex flex-cols-1 gap-18 p-3">
          {attachmentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div
                className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center`}
              >
                <option.icon className="h-8 w-8" />
              </div>
              <span className="text-xs text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}