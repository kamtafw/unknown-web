"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface ForwardManyTimesProps {
  onBack: () => void;
}

export default function ForwardManyTimesPage({
  onBack,
}: ForwardManyTimesProps) {
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
            <h1 className="text-xl font-bold">Forward many times</h1>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="relative w-[79px] h-[80px] lg:w-[112px] lg:h-[112px]"
              >
                <Image
                  src="/media.jpg"
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ))}
            I
          </div>
        </div>
      </div>
    </div>
  );
}
