"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import "./storage-bar.css";

interface ManageStorageProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function ManageStorage({ onBack, onNavigate }: ManageStorageProps) {
  console.log("onNavigate available:", !!onNavigate);

  const handleForwardManyTimes = () => {
    console.log("Navigating to forward-many-times");
    if (onNavigate) onNavigate("forward-many-times");
  };

  const handleLargerThan5MB = () => {
    console.log("Navigating to larger-than-5mb");
    if (onNavigate) onNavigate("larger-than-5mb");
  };

  const handleChatUser = (username: string) => {
    const viewMap: { [key: string]: string } = {
      "@Cameron_Williamson": "chat-cameron",
      "@Lucas_Jigsu": "chat-lucas",
    };
    const view = viewMap[username] || `chat-${username.toLowerCase().replace("@", "").replace("_", "")}`;
    console.log(`Clicked ${username}, Navigating to ${view}`);
    if (onNavigate) onNavigate(view);
  };

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
            <h1 className="text-xl font-bold">Manage Storage</h1>
          </div>
        </div>

        <div className="px-4 py-3 flex flex-col space-y-3">
          <div className="flex justify-between items-center gap-x-2">
            <div className="text-sm font-semibold text-gray-800">2.3 GB</div>
            <div className="text-sm text-gray-500">41 GB</div>
          </div>
          <div className="flex justify-between items-center gap-x-2">
            <div className="text-sm text-gray-500">Used</div>
            <div className="text-sm text-gray-500">Free</div>
          </div>

          <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500 bar-green"></div>
            <div className="h-full bg-blue-500 bar-blue"></div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">AppsCombo (2.3)</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
            <span className="text-sm">Other apps (70GB)</span>
          </div>
          <div className="mt-8 h-px w-full bg-gray-300" />
          <div className="text-sm text-gray-500">Review and delete items</div>
          <button
            onClick={handleForwardManyTimes}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <span className="text-sm font-semibold">Forward many times</span>
            <div className="ml-auto text-sm text-gray-500">1.9 MB </div>
          </button>
          <div className="flex gap-2 lg:gap-8">
            <Image src="/media.jpg" alt="Image 1" width={79} height={80} />
            <Image src="/media.jpg" alt="Image 2" width={79} height={80} />
            <Image src="/media.jpg" alt="Image 3" width={79} height={80} />
            <Image src="/media.jpg" alt="Image 4" width={79} height={80} />
            <Image src="/media.jpg" alt="Image 5" width={79} height={80} />
          </div>
          <button
            onClick={handleLargerThan5MB}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <span className="text-sm font-semibold">Larger than 5 MB</span>
            <div className="ml-auto text-sm text-gray-500">200 MB </div>
          </button>
          <div className="flex gap-2">
            <Image src="/Frame.jpg" alt="Image 6" width={79} height={79} />
            <Image src="/Frame1.jpg" alt="Image 7" width={79} height={79} />
            <Image src="/Frame1.jpg" alt="Image 8" width={79} height={79} />
            <Image src="/Frame1.jpg" alt="Image 9" width={79} height={79} />
            <Image src="/Frame1.jpg" alt="Image 10" width={79} height={79} />
            <Image src="/Frame1.jpg" alt="Image 11" width={79} height={79} />
          </div>
          <div className="mt-8 lg:mt-5 h-px w-full bg-gray-300" />
          <div className="text-sm font-semibold">Chats</div>
          <button
            onClick={() => handleChatUser("@Cameron_Williamson")}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Image
              src="/profilepic.jpg"
              alt="Cameron"
              width={30}
              height={30}
              className="rounded-full"
            />
            <div>
              <span className="text-sm font-semibold">@Cameron_Williamson</span>
              <div className="text-sm text-gray-500">+234 8124356789</div>
            </div>
            <div className="ml-auto text-sm text-gray-500">73 MB</div>
          </button>
          <button
            onClick={() => handleChatUser("@Lucas_Jigsu")}
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
          >
            <Image
              src="/profilepic.jpg"
              alt="Lucas"
              width={30}
              height={30}
              className="rounded-full"
            />
            <div>
              <span className="text-sm font-semibold">@Lucas_Jigsu</span>
              <div className="text-sm text-gray-500">+234 8181956789</div>
            </div>
            <div className="ml-auto text-sm text-gray-500">73 MB</div>
          </button>
        </div>
      </div>
    </div>
  );
}
