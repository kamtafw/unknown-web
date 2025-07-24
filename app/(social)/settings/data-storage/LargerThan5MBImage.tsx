"use client";

import { useState } from "react";
import { ArrowLeft, Pin, Trash2, ChevronRight } from "lucide-react";
import Image from "next/image";

interface LargerThan5MBImageProps {
  onNavigate?: (view: string) => void;
}

export default function LargerThan5MBImagePage({
  onNavigate,
}: LargerThan5MBImageProps) {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());

  const handleImageClick = (index: number) => {
    setSelectedImages((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  const handleBack = () => {
    if (selectedImages.size > 0 && onNavigate) {
      onNavigate(`larger-than-5mb?selected=${[...selectedImages].join(",")}`);
    } else if (onNavigate) {
      onNavigate("larger-than-5mb");
    }
  };

  return (
    <div className="flex justify-start ml-5 md:ml-5">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to Larger than 5 MB"
              >
                <ArrowLeft size={20} />
              </button>
              {selectedImages.size > 0 && (
                <span className="text-sm font-bold text-gray-700 text-[20px]">
                  {selectedImages.size}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-5">
              <Pin size={20} className="cursor-pointer text-red-600" />
              <Trash2 size={20} className="cursor-pointer" />
              <ChevronRight size={20} className="cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-10 py-3 flex flex-col space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 15 }, (_, i) => {
              const imageNumber = (i % 4) + 1;
              const isSelected = selectedImages.has(i);

              return (
                <div
                  key={i}
                  onClick={() => handleImageClick(i)}
                  className={`relative w-[79px] h-[79px] lg:w-[112px] lg:h-[112px] rounded-md cursor-pointer ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <Image
                    src={`/Rectangle ${imageNumber}.png`}
                    alt={`Image ${imageNumber}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

