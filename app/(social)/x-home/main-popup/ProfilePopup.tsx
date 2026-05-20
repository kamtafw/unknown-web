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

export default function ProfilePopup({
  name,
  username,
  profilePic,
  location,
}: ProfilePopupProps) {
  return (
    <div className="absolute top-14 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-100">
      <div className="flex items-start justify-between">
        <div className="w-15 h-15 rounded-full overflow-hidden bg-gray-300">
          <Image
            src={profilePic}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-8 py-2 rounded-full text-sm font-bold">
          Follow
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{name}</span>
          <BadgeCheck className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-sm text-gray-500">{username}</span>
        <div className="text-xs text-gray-400 mt-1 mb-3">{location}</div>
        <div className="mt-2 flex gap-18">
          <div className="text-center">
            <div className="font-semibold">1,717</div>
            <div className="text-sm text-gray-600">Connections</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">93</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">29</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 mr-3">
          <div className="flex -space-x-3">
            <Image
              src="/profilepic.jpg"
              alt="Friend"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
            <Image
              src="/profilepic.jpg"
              alt="Friend"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
            <Image
              src="/profilepic.jpg"
              alt="Friend"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs border-2 border-white">
              +40
            </div>
          </div>
          <span className="text-sm ml-4">
            Followed by John Adolph, chinedu and 2 others you follow
          </span>
        </div>
      </div>
    </div>
  );
}
