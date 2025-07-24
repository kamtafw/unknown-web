"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FollowersPopupProps {
  onClose: () => void;
}

export default function FollowersPopup({ onClose }: FollowersPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  const followers = Array(20).fill({
    name: "Cameron Williamson",
    username: "@_recky_scham",
    profilePic: "/profilepic.jpg",
    isFollowing: Math.random() > 0.5,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center overflow-y-auto">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md my-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Followers</h3>
          <button
            onClick={onClose}
            aria-label="Close popup"
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {followers.map((follower, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={follower.profilePic}
                    alt={follower.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{follower.name}</p>
                  <p className="text-xs text-gray-500">{follower.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "text-xs sm:text-sm font-semibold rounded-full px-3 py-1",
                    follower.isFollowing
                      ? "bg-gray-200 text-gray-700"
                      : "bg-blue-500 text-white"
                  )}
                  onClick={() =>
                    console.log(`Toggle follow for ${follower.username}`)
                  }
                >
                  {follower.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
