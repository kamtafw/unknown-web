"use client";

// import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

export default function FollowingPage() {
  const following = [
    {
      id: 1,
      name: "Cameron_Williamson",
      username: "@_reddy_sohan",
      isFollowing: false, // This one will show "Follow" button
    },
    {
      id: 2,
      name: "Devon Lane",
      username: "@_jatin_garewal",
      isFollowing: true,
    },
    {
      id: 3,
      name: "Eleanor Pena",
      username: "@_dave",
      isFollowing: true,
    },
    {
      id: 4,
      name: "Ralph Edwards",
      username: "@_angle_talu",
      isFollowing: true,
    },
    {
      id: 5,
      name: "Kathryn Murphy",
      username: "@_dr_nick",
      isFollowing: true,
    },
    {
      id: 6,
      name: "Kristin Watson",
      username: "@_roy_akansha",
      isFollowing: true,
    },
    {
      id: 7,
      name: "Roland Richards",
      username: "@riley_cuso",
      isFollowing: true,
    },
    {
      id: 8,
      name: "Jenny Wilson",
      username: "@_arya_deewana",
      isFollowing: true,
    },
    {
      id: 9,
      name: "Wade Warren",
      username: "@_agel_jolie",
      isFollowing: true,
    },
    {
      id: 10,
      name: "Robert Fox",
      username: "@_deepak_404_found",
      isFollowing: true,
    },
  ];

  return (
    <div className="flex justify-start ml-5 mb-14">
      <div className="w-[546px] h-[796px] bg-white text-black overflow-auto shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">Following</h1>
          </div>
        </div>

        {/* Following list */}
        <div className="">
          {following.map((person) => (
            <div
              key={person.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex">
                {/* Profile picture */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                  {/* <Image
                    src={}
                    alt={person.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  /> */}
                </div>

                <div className="flex flex-col justify-center cursor-pointer">
                  <span className="font-bold">{person.name}</span>
                  <span className="text-gray-500 text-sm">
                    {person.username}
                  </span>
                </div>
              </div>

              {/* Follow/Unfollow button and more options */}
              <div className="flex items-center gap-2">
                {!person.isFollowing ? (
                  <button className="bg-[#6A88D1] hover:bg-[#425483] text-white px-7 py-1.5 rounded-full text-sm font-bold">
                    Follow
                  </button>
                ) : (
                  <button className=" text-[#6A88D1]  hover:bg-[#425483] px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500">
                    Unfollow
                  </button>
                )}
                <button
                  className="p-1 rounded-full hover:bg-gray-100"
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
