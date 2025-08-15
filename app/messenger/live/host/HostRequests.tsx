"use client";

import { useState } from "react";
import Image from "next/image";
import { BiMicrophoneOff } from "react-icons/bi";

interface RequestUser {
  id: string;
  name: string;
  username: string;
  image: string;
}

export function HostRequests() {
  const [selectedUser, setSelectedUser] = useState<RequestUser | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const requests: RequestUser[] = [
    {
      id: "1",
      name: "Michael Johnson",
      username: "@mikej",
      image: "/Rectangle 3.png",
    },
    {
      id: "2",
      name: "Sarah Wilson",
      username: "@sarahw",
      image: "/Rectangle 2.png",
    },
    {
      id: "3",
      name: "David Brown",
      username: "@davidb",
      image: "/Rectangle5.png",
    },
    {
      id: "4",
      name: "Lisa Davis",
      username: "@lisad",
      image: "/Rectangle 1.png",
    },
    {
      id: "5",
      name: "Tom Wilson",
      username: "@tomw",
      image: "/Rectangle 4.png",
    },
  ];

  const handleUserClick = (user: RequestUser) => {
    setSelectedUser(user);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedUser(null);
  };

  const handleAction = (action: string) => {
    if (selectedUser) {
      console.log(`${action} ${selectedUser.name}`);
      handleClosePopup();
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {requests.map((user) => (
          <div
            key={user.id}
            onContextMenu={(e) => {
              e.preventDefault();
              handleUserClick(user);
            }}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border">
                <BiMicrophoneOff className="text-red-500 text-xs" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.username}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Popup */}
      {showPopup && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-100">
            <div className="space-y-3">
              <button
                onClick={() => handleAction("Allow to speak")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                Allow {selectedUser.name} to speak
              </button>
              <button
                onClick={() => handleAction("Kick out")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                Kick {selectedUser.name} out
              </button>
              <button
                onClick={() => handleAction("Mute")}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                Mute {selectedUser.name}
              </button>
              <button
                onClick={() => handleAction("Block and kick out")}
                className="w-full text-left text-red-500 px-3 py-2 hover:bg-gray-100 rounded"
              >
                Block and Kick {selectedUser.name} out
              </button>
            </div>
            <button
              onClick={handleClosePopup}
              className="mt-4 w-full bg-blue-400 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
