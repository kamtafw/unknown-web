"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";

interface ProfilePopupProps {
  name: string;
  username: string;
  profilePic: string;
  location: string;
  onClose: () => void;
}

export default function ProfilePopup({ name, username, profilePic, location,}: ProfilePopupProps) {
  return (
    <div className="absolute top-14 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
          <Image
            src={profilePic}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-4 py-1 rounded-full text-sm font-bold">
          Follow
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{name}</span>
          <BadgeCheck className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-sm text-gray-500">{username}</span>
        <div className="text-xs text-gray-400 mt-1">{location}</div>
        <div className="mt-2">
          <span className="font-semibold">1,717</span> <span className="text-sm">Connections</span>
          <span className="ml-2 font-semibold">93</span> <span className="text-sm">Following</span>
          <span className="ml-2 font-semibold">29</span> <span className="text-sm">Followers</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex -space-x-2">
            <Image src="/profilepic.jpg" alt="Friend" width={24} height={24} className="rounded-full" />
            <Image src="/profilepic.jpg" alt="Friend" width={24} height={24} className="rounded-full" />
            <Image src="/profilepic.jpg" alt="Friend" width={24} height={24} className="rounded-full" />
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              +40
            </div>
          </div>
          <span className="text-sm">Followed by John Adolph, chinedu and 2 others you follow</span>
        </div>
      </div>
    </div>
  );
}
