"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface LargerThan5MBProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  selectedIndex?: number | null;
}

export default function LargerThan5MBPage({
  onBack,
  onNavigate,
  selectedIndex = null,
}: LargerThan5MBProps) {
  const handleImageClick = (index: number) => {
    onNavigate?.(`larger-than-5mb-image-${index}`);
  };

  return (
    <div className="flex justify-start ml-5 md:ml-5">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Manage Storage"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Larger than 5 MB</h1>
          </div>
        </div>
        <div className="px-4 lg:px-10 py-3 flex flex-col space-y-3">
          {selectedIndex !== null && (
            <button className="w-full bg-blue-500 text-white py-2 rounded-md">
              View Selected Image {selectedIndex + 1}
            </button>
          )}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 15 }, (_, i) => {
              const imageNumber = (i % 4) + 1;
              const isSelected = selectedIndex === i;

              return (
                <div
                  key={i}
                  className={`relative w-[79px] h-[79px] lg:w-[112px] lg:h-[112px] ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <Image
                    src={`/Rectangle ${imageNumber}.png`}
                    alt={`Image ${imageNumber}`}
                    fill
                    className="object-cover rounded-md cursor-pointer"
                    onClick={() => handleImageClick(i)}
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