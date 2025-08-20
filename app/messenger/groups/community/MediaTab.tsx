import React from "react";
import Image from "next/image";
import { Mic } from "lucide-react";

interface MediaItem {
  id: string;
  type: "image" | "video" | "audio";
  src: string;
  size: string;
  duration?: string;
}

const mediaItems: MediaItem[] = [
  {
    id: "1",
    type: "audio",
    src: "/media.jpg",
    size: "1.9 MB",
  },
  {
    id: "2",
    type: "image",
    src: "/image.png",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "3",
    type: "image",
    src: "/image.png",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "4",
    type: "image",
    src: "/media.jpg",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "5",
    type: "image",
    src: "/image.png",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "6",
    type: "audio",
    src: "/media.jpg",
    size: "1.9 MB",
  },
  {
    id: "7",
    type: "image",
    src: "/media.jpg",
    size: "1.0 MB",
    duration: "0:12",
  },
  {
    id: "8",
    type: "image",
    src: "/image.png",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "9",
    type: "image",
    src: "/media.jpg",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "10",
    type: "image",
    src: "/media.jpg",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "11",
    type: "image",
    src: "/image.png",
    size: "1.9 MB",
    duration: "0:12",
  },
  {
    id: "12",
    type: "image",
    src: "/media.jpg",
    size: "1.9 MB",
    duration: "0:12",
  },
];

export function MediaTab() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image
              src={item.src}
              alt={`Media ${item.id}`}
              fill
              className="object-cover"
            />
            
            {/* Overlay for audio items */}
            {item.type === "audio" && (
              <div className="absolute inset-0 bg-green-500 flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Duration overlay for videos/images with duration */}
            {item.duration && item.type !== "audio" && (
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                {item.duration}
              </div>
            )}

            {/* Size label for audio */}
            {item.type === "audio" && (
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                {item.size}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}