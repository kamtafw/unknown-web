"use client";

// import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

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
    <div className="flex justify-start ml-5 mb-14">
      <div className="w-[546px] h-[796px] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 ">
          <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">Followers</h1>
          </div>
        </div>
        <div className="">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                  {/* <Image
                    src={}
                    alt={follower.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  /> */}
                </div>
                <div className="flex flex-col justify-center cursor-pointer">
                  <span className="font-bold">{follower.name}</span>
                  <span className="text-gray-500 text-sm">
                    {follower.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {follower.followBack ? (
                  <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    Follow back
                  </button>
                ) : (
                  <button className="bg-transparent text-[#6A88D1]  hover:bg-[#425483] px-8 py-1.5 rounded-full text-sm font-bold border border-blue-500">
                    Friends
                  </button>
                )}
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="More options"
                  title="More options"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
