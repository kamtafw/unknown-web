"use client";

import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface FollowersPageProps {
  onClose?: () => void;
}

export default function FollowersPage({}: FollowersPageProps) {
  const followers = [
    {
      id: 1,
      name: "Cameron_Willia...",
      username: "@_reddy_sohan",
      followBack: true,
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@_jatin_garewal",
      followBack: false,
    },
    { id: 3, name: "Eleanor Pena", username: "@_dave", followBack: false },
    {
      id: 4,
      name: "Ralph Edwards",
      username: "@_angle_talu",
      followBack: true,
    },
    { id: 5, name: "Kathryn Murphy", username: "@_dr_nick", followBack: true },
    {
      id: 6,
      name: "Kristin Watson",
      username: "@_roy_akansha",
      followBack: true,
    },
    {
      id: 7,
      name: "Roland Richards",
      username: "@riley_cuso",
      followBack: false,
    },
    {
      id: 8,
      name: "Jenny Wilson",
      username: "@_arya_deewana",
      followBack: false,
    },
    { id: 9, name: "Wade Warren", username: "@_agel_jolie", followBack: false },
    {
      id: 10,
      name: "Robert Fox",
      username: "@_deepak_404_found",
      followBack: false,
    },
  ];

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Followers</h1>
          </div>
        </div>
        <div className="">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 sm:px-4 sm:py-3"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-2 sm:w-12 sm:h-12 sm:mr-3">
                  <Image
                    src="/friend.png"
                    alt={follower.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center cursor-pointer">
                  <span className="font-bold text-sm sm:text-base">{follower.name}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {follower.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {follower.followBack ? (
                  <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-3 py-1 rounded-full text-xs font-bold sm:px-4 sm:py-1.5 sm:text-sm">
                    Follow back
                  </button>
                ) : (
                  <button className="bg-transparent text-[#6A88D1] hover:bg-[#425483] px-4 py-1 rounded-full text-xs font-bold border border-blue-500 sm:px-8 sm:py-1.5 sm:text-sm">
                    Friends
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
