"use client";

// import Image from "next/image";
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
    <div className="flex justify-start ml-5 mb-14">
      <div className="w-[546px] h-[796px] bg-white text-black overflow-auto shadow-md">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 ">
          <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">Connections</h1>
          </div>
        </div>

        {/* Connections list */}
        <div className="">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex">
                {/* Profile picture */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                  {/* <Image
                    src={}
                    alt={connection.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  /> */}
                </div>

                {/* Name and bio */}
                <div className="flex flex-col justify-center max-w-xs cursor-pointer">
                  <span className="font-bold">{connection.name}</span>
                  <span className="text-gray-500 text-sm">
                    {connection.bio}
                  </span>
                </div>
              </div>

              {/* More options and connect button */}
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="More options"
                  title="More options"
                >
                  <MoreHorizontal size={18} />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Connect"
                  title="Connect"
                >
                  <Send size={18} className="text-blue-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
