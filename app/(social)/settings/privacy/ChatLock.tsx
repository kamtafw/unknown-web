"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface ChatLockPageProps {
  onBack: () => void;
}

export default function ChatLockPage({ onBack }: ChatLockPageProps) {
  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Privacy"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Chat Lock</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start px-4 py-6 space-y-6">
          {/* Image centered */}
          <div className="w-40 h-32 overflow-hidden mx-auto">
            <Image
              src="/Group.png"
              alt="Chat Lock"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <p className="text-[16px] text-black font-bold">
            Chat Lock keeps your chat locked and hidden
          </p>
          <p className="text-[14px] text-gray-500">
            If you have locked chats, pull down on your chats list or type your
            secret code in the search bar to find them
          </p>
          <p className="text-[16px] text-black font-bold">
            Unlock and clear locked chats
          </p>
          <p className="text-[14px] text-gray-500 text-left">
            If you forgot your secret code, you can clear it, this will also
            unlock and clear message, photos and videos in locked chats
          </p>

          <button
            onClick={onBack}
            className="w-full mt-60 bg-blue-500 text-white py-2 rounded-full"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

