"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface Viewer {
  id: string;
  name: string;
  avatar: string;
  viewTime: string;
}

const viewersData: Viewer[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    viewTime: "11:02",
  },
  {
    id: "2",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    viewTime: "11:05",
  },
  {
    id: "3",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    viewTime: "11:01",
  },
];

interface ViewersPopupProps {
  viewers: number;
  onClose: () => void;
}

export function ViewersPopup({ viewers, onClose }: ViewersPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={popupRef}
      className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-50"
    >
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800">Views</h3>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {viewersData.slice(0, Math.min(viewersData.length, viewers)).map((viewer) => (
          <div key={viewer.id} className="flex items-center gap-3">
            <Image
              src={viewer.avatar}
              alt={viewer.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{viewer.name}</p>
              <p className="text-xs text-gray-500">{viewer.viewTime}</p>
            </div>
          </div>
        ))}
        
        {viewers > viewersData.length && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">
              +{viewers - viewersData.length} more viewers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}