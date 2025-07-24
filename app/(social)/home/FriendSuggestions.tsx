"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

export default function FriendSuggestionsPage() {
  const suggestions = [
    {
      id: 1,
      name: "Cameron Williamson",
      username: "@_reddy_sohan",
      isFollowing: false,
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@_jatin_garewal",
      isFollowing: true,
    },
    { id: 3, name: "Eleanor Pena", username: "@_dave", isFollowing: false },
    {
      id: 4,
      name: "Ralph Edwards",
      username: "@_angle_talu",
      isFollowing: false,
    },
    {
      id: 5,
      name: "Kathryn Murphy",
      username: "@_dr_nick",
      isFollowing: false,
    },
    {
      id: 6,
      name: "Kristin Watson",
      username: "@_roy_akansha",
      isFollowing: false,
    },
    {
      id: 7,
      name: "Roland Richards",
      username: "@riley_cuso",
      isFollowing: false,
    },
    {
      id: 8,
      name: "Jenny Wilson",
      username: "@_arya_deewana",
      isFollowing: false,
    },
    {
      id: 9,
      name: "Wade Warren",
      username: "@_agel_jolie",
      isFollowing: false,
    },
    {
      id: 10,
      name: "Robert Fox",
      username: "@_deepak_404_found",
      isFollowing: false,
    },
    {
      id: 11,
      name: "Ariene McCoy",
      username: "@Ariene_McCoy",
      isFollowing: false,
    },
    {
      id: 12,
      name: "Lucas Brown",
      username: "@lucas_brown",
      isFollowing: false,
    },
  ];

  return (
    <div className="flex justify-center ml-1 mb-6 px-2 sm:px-4 lg:ml-5 lg:mb-0 ">
      <div className="w-full max-w-[530px] bg-white text-black shadow-md lg:w-[546px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Friend Suggestions</h1>
          </div>
        </div>
        <div className="pb-6">
          {suggestions.map((person) => (
            <div
              key={person.id}
              className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 sm:px-4 sm:py-3"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-2 sm:w-12 sm:h-12 sm:mr-3">
                  <Image
                    src="/profilepic.jpg"
                    alt={person.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center cursor-pointer">
                  <span className="font-bold text-sm sm:text-base">
                    {person.name}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {person.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {!person.isFollowing ? (
                  <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-4 py-1 rounded-full text-xs font-bold sm:px-7 sm:py-1.5 sm:text-sm">
                    Follow
                  </button>
                ) : (
                  <button className="text-[#6A88D1] hover:bg-[#425483] px-3 py-1 rounded-full text-xs font-bold border border-blue-500 sm:px-4 sm:py-1.5 sm:text-sm">
                    Unfollow
                  </button>
                )}
                <button
                  className="p-1 rounded-full hover:bg-gray-100 sm:p-2"
                  aria-label="More options"
                  title="More options"
                >
                  <MoreHorizontal size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
