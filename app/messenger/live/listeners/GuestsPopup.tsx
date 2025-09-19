"use client";

import { useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { BiMicrophoneOff } from "react-icons/bi";
import Image from "next/image";
import { BsSoundwave } from "react-icons/bs";

interface GuestsPopupProps {
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

export function GuestsPopup({ onClose }: GuestsPopupProps) {
  const [activeTab, setActiveTab] = useState<
    "co-hosts" | "speakers" | "listening"
  >("co-hosts");
  const [searchQuery, setSearchQuery] = useState("");

  const hostUser: User = {
    id: "1",
    name: "John Doe",
    username: "@johndoe",
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
    {
      id: "6",
      name: "Lisa Davis",
      username: "@lisad",
      profileImage: "/Rectangle 1.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "7",
      name: "Tom Wilson",
      username: "@tomw",
      profileImage: "/Rectangle 3.png",
      isActive: false,
      isMuted: true,
    },
  ];

  const listeners: User[] = [
    hostUser,
    coHostUser,
    {
      id: "8",
      name: "Alice Cooper",
      username: "@alicec",
      profileImage: "/Rectangle 2.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "9",
      name: "Bob Anderson",
      username: "@boba",
      profileImage: "/Rectangle 4.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "10",
      name: "Carol White",
      username: "@carolw",
      profileImage: "/Rectangle5.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "11",
      name: "Dan Miller",
      username: "@danm",
      profileImage: "/Rectangle 1.png",
      isActive: false,
      isMuted: true,
    },
    {
      id: "12",
      name: "Eva Green",
      username: "@evag",
      profileImage: "/Rectangle 4.png",
      isActive: false,
      isMuted: true,
    },
  ];

  const coHosts: User[] = [hostUser, coHostUser];

  const getCurrentUsers = () => {
    switch (activeTab) {
      case "co-hosts":
        return coHosts;
      case "speakers":
        return speakers;
      case "listening":
        return listeners;
      default:
        return [];
    }
  };

  const UserItem = ({ user }: { user: User }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
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
                  : "bg-[#34A853] text-White "
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

  return (
    <div className="bg-white rounded-lg shadow-lg w-96 max-h-[600px] flex flex-col">
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
          {["co-hosts", "speakers", "listening"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
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
        <div className="space-y-1">
          {getCurrentUsers()
            .filter(
              (user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
        </div>
      </div>
    </div>
  );
}
