"use client";

import Image from "next/image";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import "@/app/global.css";

export default function FriendSuggestionsPage() {
  const [followingStatus, setFollowingStatus] = useState<{[key: number]: boolean}>({
    2: true, 5: true, 8: true,
  });

  const suggestions = [
    {
      id: 1,
      name: "Cameron Williamson",
      username: "@_reddy_sohan",
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@_jatin_garewal",
    },
    { 
      id: 3, 
      name: "Eleanor Pena", 
      username: "@_dave",
    },
    {
      id: 4,
      name: "Ralph Edwards",
      username: "@_angle_talu",
    },
    {
      id: 5,
      name: "Kathryn Murphy",
      username: "@_dr_nick",
    },
    {
      id: 6,
      name: "Kristin Watson",
      username: "@_roy_akansha",
    },
    {
      id: 7,
      name: "Roland Richards",
      username: "@riley_cuso",
    },
    {
      id: 8,
      name: "Jenny Wilson",
      username: "@_arya_deewana",
    },
    {
      id: 9,
      name: "Wade Warren",
      username: "@_agel_jolie",
    },
    {
      id: 10,
      name: "Robert Fox",
      username: "@_deepak_404_found",
    },
    {
      id: 11,
      name: "Ariene McCoy",
      username: "@Ariene_McCoy",
    },
    {
      id: 12,
      name: "Lucas Brown",
      username: "@lucas_brown",
    },
  ];

  const toggleFollow = (personId: number) => {
    setFollowingStatus(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-5">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Friend Suggestions</h1>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
        {suggestions.map((person) => (
          <div
            key={person.id}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                <Image
                  src="/profilepic.jpg"
                  alt={person.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1 cursor-pointer">
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {person.name}
                </span>
                <span className="text-gray-500 text-xs truncate">
                  {person.username}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => toggleFollow(person.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  followingStatus[person.id]
                    ? "bg-white text-[#6A88D1] border border-[#6A88D1] hover:bg-blue-50"
                    : "bg-[#6A88D1] text-white hover:bg-[#425483]"
                }`}
              >
                {followingStatus[person.id] ? "Following" : "Follow"}
              </button>
              <button
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200"
                aria-label="More options"
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
