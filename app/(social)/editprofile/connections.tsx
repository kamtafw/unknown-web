"use client";

import Image from "next/image";
import { MoreHorizontal, Send } from "lucide-react";

export default function ConnectionsPage() {
  const connections = [
    {
      id: 1,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 2,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 3,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 4,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 5,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 6,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 7,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
    {
      id: 8,
      name: "Kathryn Murphy",
      bio: "A Product Designer who likes exploring many aspect of creativity",
    },
  ];

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Connections</h1>
          </div>
        </div>
        <div className="">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 sm:px-4 sm:py-3"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-2 sm:w-12 sm:h-12 sm:mr-3">
                  <Image
                    src="/Rectangle 1.png"
                    alt={connection.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center max-w-[70%] cursor-pointer sm:max-w-xs">
                  <span className="font-bold text-sm sm:text-base">{connection.name}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {connection.bio}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  className="p-1 rounded-full hover:bg-gray-100 sm:p-2"
                  aria-label="More options"
                  title="More options"
                >
                  <MoreHorizontal size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  className="p-1 rounded-full hover:bg-gray-100 sm:p-2"
                  aria-label="Connect"
                  title="Connect"
                >
                  <Send size={16} className="text-blue-500 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}