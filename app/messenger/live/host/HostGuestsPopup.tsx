"use client";

import { useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { BiMicrophoneOff } from "react-icons/bi";
import { X } from "lucide-react";
import Image from "next/image";
import { BsSoundwave } from "react-icons/bs";

interface HostGuestsPopupProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  role?: "Host" | "Co-Host";
  isActive: boolean;
  isMuted?: boolean;
}

export function HostGuestsPopup({ onClose }: HostGuestsPopupProps) {
  const [activeTab, setActiveTab] = useState<
    "co-hosts" | "speakers" | "requests" | "listening"
  >("co-hosts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionPopup, setShowActionPopup] = useState(false);

  const hostUser: User = {
    id: "1",
    name: "Devon Lane",
    username: "@devonlane",
    profileImage: "/Rectangle 4.png",
    role: "Host",
    isActive: true,
  };

  const coHostUser: User = {
    id: "2",
    name: "Jane Smith",
    username: "@janesmith",
    profileImage: "/Rectangle 1.png",
    role: "Co-Host",
    isActive: true,
  };

  const thirdCoHost: User = {
    id: "3",
    name: "Mike Johnson",
    username: "@mikej",
    profileImage: "/Rectangle 3.png",
    isActive: false,
    isMuted: true,
  };

  const speakers: User[] = [
    hostUser,
    coHostUser,
    {
      id: "3",
      name: "Mike Johnson",
      username: "@mikej",
      profileImage: "/Rectangle 3.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "4",
      name: "Sarah Wilson",
      username: "@sarahw",
      profileImage: "/Rectangle 2.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "5",
      name: "David Brown",
      username: "@davidb",
      profileImage: "/Rectangle5.png",
      isActive: false,
      isMuted: true,
    },
  ];

  const requests: User[] = [
    {
      id: "6",
      name: "Tom Wilson",
      username: "@tomw",
      profileImage: "/Rectangle 3.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "7",
      name: "Lisa Davis",
      username: "@lisad",
      profileImage: "/Rectangle 1.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "8",
      name: "Mark Johnson",
      username: "@markj",
      profileImage: "/Rectangle 4.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "9",
      name: "Emma White",
      username: "@emmaw",
      profileImage: "/Rectangle 2.png",
      isActive: false,
      isMuted: true,
    },
  ];

  const listeners: User[] = [
    hostUser,
    coHostUser,
    {
      id: "10",
      name: "Alice Cooper",
      username: "@alicec",
      profileImage: "/Rectangle 2.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "11",
      name: "Bob Anderson",
      username: "@boba",
      profileImage: "/Rectangle 4.png",
      isActive: false,
      isMuted: true,
    },
  ];

  const coHosts: User[] = [hostUser, coHostUser, thirdCoHost];

  const getCurrentUsers = () => {
    switch (activeTab) {
      case "co-hosts":
        return coHosts;
      case "speakers":
        return speakers;
      case "requests":
        return requests;
      case "listening":
        return listeners;
      default:
        return [];
    }
  };

  const handleUserClick = (user: User) => {
    if (user.role === "Host" || user.role === "Co-Host") return;
    setSelectedUser(user);
    setShowActionPopup(true);
  };

  const handleAction = (action: string) => {
    if (selectedUser) {
      console.log(`${action} ${selectedUser.name}`);
      setShowActionPopup(false);
      setSelectedUser(null);
    }
  };

  const UserItem = ({ user }: { user: User }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        user.role === "Host" || user.role === "Co-Host"
          ? ""
          : "hover:bg-gray-50 cursor-pointer"
      }`}
      onContextMenu={(e) => {
        if (user.role === "Host" || user.role === "Co-Host") return;
        e.preventDefault();
        handleUserClick(user);
      }}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          <Image
            src={user.profileImage}
            alt={user.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.style.backgroundColor = "#3B82F6";
            }}
          />
        </div>

        {user.isActive ? (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <BsSoundwave className="text-green-500 text-xs" />
          </div>
        ) : user.isMuted ? (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <BiMicrophoneOff className="text-red-500 text-xs" />
          </div>
        ) : null}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{user.name}</span>
          {user.role && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${
                user.role === "Host"
                  ? "bg-[#C60BF5] text-white"
                  : "bg-[#34A853] text-white"
              }`}
            >
              {user.role}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs">{user.username}</p>
      </div>
    </div>
  );

  const CoHostSection = () => (
    <div className="space-y-1">
      {/* Existing Co-Hosts */}
      {coHosts.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
      {/* Add Co Host Section */}
      <div className="p-3">
        <p className="font-medium text-sm mb-5">Add Co Host</p>
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="w-15 h-15 bg-gray-300 rounded-full overflow-hidden">
              <Image
                src="/Rectangle 1.png"
                alt="Co-host"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              aria-label="Remove co-host"
            >
              <X className="text-white" size={12} />
            </button>
          </div>
          <button
            className="w-15 h-15 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl"
            aria-label="Add co-host"
          >
            +
          </button>
        </div>
      </div>

      <hr className="border-gray-200 my-4" />
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg w-99 max-h-[650px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <IoClose className="text-gray-600 text-3xl" />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pb-2">
        <h2 className="text-lg font-semibold">Guests</h2>
      </div>

      {/* Search Box */}
      <div className="px-4 pb-4">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg" />
          <input
            type="text"
            placeholder="Search guest"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {["co-hosts", "speakers", "requests", "listening"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-2 py-1 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab === "co-hosts"
                ? "Co-Hosts"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === "co-hosts" ? (
          <CoHostSection />
        ) : (
          <div className="space-y-1">
            {getCurrentUsers()
              .filter(
                (user) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.username
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <UserItem key={user.id} user={user} />
              ))}
          </div>
        )}
      </div>

      {/* Action Popup */}
      {showActionPopup && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80">
            <div className="space-y-3">
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
              onClick={() => setShowActionPopup(false)}
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
