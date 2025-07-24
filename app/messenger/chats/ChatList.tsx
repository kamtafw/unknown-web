"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Camera, Search, Archive, Check } from "lucide-react";
import { IoCheckmarkDone } from "react-icons/io5";
import { MdPhoneCallback } from "react-icons/md";
import { FaSignalMessenger } from "react-icons/fa6";
import { TbCopyPlusFilled } from "react-icons/tb";
import { FaMicrophone } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { MdImage } from "react-icons/md";
import { BsPinAngleFill } from "react-icons/bs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/StatusIndicator";
import { UnreadList } from "./UnreadList";
import { FavoritesList } from "./FavoriteList";
import { CopyPopup } from "@/app/messenger/CopyPopup";

interface Chat {
  id: string;
  name: string;
  status?: string;
  icon?: React.ReactNode;
  time: string;
  message: string;
  badge?: number;
  online?: boolean;
  pinned?: boolean;
  statusIcon?: string;
  avatar?: string;
  hasStatusIndicator?: boolean;
  statusIndicatorType?: "active" | "viewed";
}

const chats: Chat[] = [
  {
    id: "1",
    name: "Louigi Dash",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-red-500" />,
    message: "Missed voice call",
    time: "00:57",
    badge: 4,
    pinned: true,
  },
  {
    id: "2",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    icon: <FaSignalMessenger className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    badge: 4,
    online: true,
  },
  {
    id: "3",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    icon: <IoCheckmarkDone className="h-4 w-4 text-blue-500" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    hasStatusIndicator: true,
    statusIndicatorType: "active",
  },
  {
    id: "4",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    icon: <Check className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    statusIcon: "copyPlus",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "5",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    icon: <FaMicrophone className="h-4 w-4 text-blue-500" />,
    message: "0:25",
    time: "00:57",
  },
  {
    id: "6",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    message: "Typing a message",
    time: "05:57",
  },
  {
    id: "7",
    name: "Arlene McCoy",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-red-500" />,
    message: "Missed voice call",
    time: "06:57",
    badge: 4,
  },
  {
    id: "8",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-gray-600" />,
    message: "Voice call",
    time: "07:52",
    badge: 4,
  },
  {
    id: "9",
    name: "Robert Kim",
    avatar: "/Rectangle 3.png",
    icon: <IoCheckmarkDone className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "07:58",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "10",
    name: "Arlene Cane",
    avatar: "/Rectangle 3.png",
    icon: <FaVideo className="h-4 w-4 text-blue-500" />,
    message: "Video",
    time: "08:51",
    badge: 4,
  },
  {
    id: "11",
    name: "Wade Warren",
    avatar: "/Rectangle 3.png",
    icon: <MdImage className="h-4 w-4 text-gray-600" />,
    message: "Image",
    time: "08:55",
  },
  {
    id: "12",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    message: "Recording a voice message",
    time: "09:00",
  },
];

export function ChatList() {
  const [activeTab, setActiveTab] = useState("all");
  const [showCopyPopup, setShowCopyPopup] = useState(false);

  const router = useRouter();

  const handleSchedule = () => {
    router.push("/schedule");
  };

  const handleCreateCommunity = () => {
    router.push("/create-community");
  };

  const handleCreateGroup = () => {
    router.push("/create-group");
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "favorites", label: "Favorites" },
    { id: "groups", label: "Groups" },
  ];

  const handleGroupsClick = () => {
    window.location.href = "/messenger/groups";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "unread":
        return <UnreadList />;
      case "favorites":
        return <FavoritesList />;
      case "groups":
        handleGroupsClick();
        return null;
      default:
        return (
          <div onClick={() => setShowCopyPopup(false)}>
            {/* Archive Section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="border rounded-full h-15 w-15 flex items-center justify-center">
                  <Archive className="h-9 w-9" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Archive</span>
                  <span className="text-sm text-gray-500">
                    Wade Warners, Darlena Robertson...
                  </span>
                </div>
              </div>
              <div className="bg-gray-300 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                4
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1">
              {chats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 py-2">
                  <div className="relative">
                    {chat.hasStatusIndicator ? (
                      <StatusIndicator variant={chat.statusIndicatorType}>
                        <Image
                          src={chat.avatar || "/default-avatar.jpg"}
                          alt={chat.name}
                          width={60}
                          height={60}
                          className="h-15 w-15 rounded-full object-cover"
                        />
                      </StatusIndicator>
                    ) : (
                      <>
                        <Image
                          src={chat.avatar || "/default-avatar.jpg"}
                          alt={chat.name}
                          width={60}
                          height={60}
                          className="h-15 w-15 rounded-full object-cover"
                        />
                        {chat.online && (
                          <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                        {chat.statusIcon === "story" && (
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-dashed" />
                        )}
                        {chat.statusIcon === "border" && (
                          <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{chat.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {chat.icon}
                      <p
                        className={cn(
                          "text-sm text-gray-500",
                          (chat.message.includes("Recording") ||
                            chat.message.includes("Typing")) &&
                            "text-blue-500"
                        )}
                      >
                        {chat.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {chat.statusIcon === "copyPlus" ? (
                      <button
                        title="Copy Plus"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCopyPopup(true);
                        }}
                        className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <TbCopyPlusFilled className="h-8 w-8 text-white" />
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">{chat.time}</p>
                    )}

                    {/* Always check for badge/pinned, regardless of statusIcon */}
                    {(chat.badge || chat.pinned) && (
                      <div className="flex items-center gap-1">
                        {chat.pinned && (
                          <BsPinAngleFill className="h-4 w-4 text-red-600" />
                        )}
                        {chat.badge && (
                          <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {chat.badge}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <CopyPopup
              isOpen={showCopyPopup}
              onClose={() => setShowCopyPopup(false)}
              onSchedule={handleSchedule}
              onCreateCommunity={handleCreateCommunity}
              onCreateGroup={handleCreateGroup}
            />
          </div>
        );
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {activeTab === "unread"
            ? "Unread"
            : activeTab === "favorites"
            ? "Favorites"
            : "Chat"}
        </h2>
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col gap-2">
                <Button variant="ghost">New Group</Button>
                <Button variant="ghost">New Community</Button>
                <Button variant="ghost">Schedule Message</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          placeholder="What are you looking for"
          className="pr-10 rounded-full"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="outline"
            className={cn(
              "rounded-full text-sm py-1 px-5 bg-gray-100 hover:bg-gray-200",
              activeTab === tab.id && "text-blue-500 border-blue-500"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
        <Button
          variant="outline"
          className="rounded-full text-sm py-1 px-5 bg-gray-100 hover:bg-gray-200"
        >
          <span className="text-blue-500 text-lg font-bold">+</span> Create
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
