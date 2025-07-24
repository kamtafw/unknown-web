"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface ChatUserProps {
  onBack: () => void;
}

export default function ChatUserPage({ onBack }: ChatUserProps) {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "@Cameron_Williamson";
  const storage = "2.5 GB";

  return (
    <div className="flex justify-start ml-5 md:ml-5">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Data and Storage"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Image
                src="/profilepic.jpg"
                alt={username}
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">{username}</h1>
                <p className="text-sm font-semibold text-gray-800">
                  {storage}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-col space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 15 }, (_, i) => {
              const imageIndex = (i % 4) + 1;

              return (
                <div
                  key={i}
                  className="relative w-[79px] h-[80px] lg:w-[112px] lg:h-[112px] rounded-md overflow-hidden"
                >
                  <Image
                    src={`/Rectangle ${imageIndex}.png`}
                    alt={`Image ${imageIndex}`}
                    fill
                    className="object-cover"
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
