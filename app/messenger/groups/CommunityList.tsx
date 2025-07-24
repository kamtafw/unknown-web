"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Camera, Search, Users } from "lucide-react";
import { TbCopyPlusFilled } from "react-icons/tb";
import { IoVolumeMuteOutline } from "react-icons/io5";
import { BsPinAngleFill } from "react-icons/bs";
import { HiUserGroup } from "react-icons/hi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CopyPopup } from "@/app/messenger/CopyPopup";

interface Group {
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
  hasGroupIcon?: boolean;
  isMuted?: boolean;
  hasHashIcon?: boolean;
}

interface Community {
  id: string;
  name: string;
  groupCount: number;
  announcement: {
    title: string;
    message: string;
    time: string;
  };
  generalGroup: {
    message: string;
    time: string;
  };
  groups: Group[];
  hasCopyIcon?: boolean;
}

const communities: Community[] = [
  {
    id: "1",
    name: "DTH",
    groupCount: 2,
    announcement: {
      title: "Announcement",
      message: "Welcome to you community",
      time: "31/01/2024",
    },
    generalGroup: {
      message: "Welcome to you community",
      time: "31/01/2024",
    },
    groups: [
      {
        id: "1",
        name: "Dec Party",
        avatar: "/Rectangle 3.png",
        message: "Lorem ipsum dolor sit amet, con...",
        time: "00:57",
        badge: 4,
        isMuted: true,
      },
    ],
  },
  {
    id: "2",
    name: "Tech Community",
    groupCount: 3,
    hasCopyIcon: true,
    announcement: {
      title: "Announcement",
      message: "Welcome to you community",
      time: "15/02/2024",
    },
    generalGroup: {
      message: "Welcome to you community",
      time: "15/02/2024",
    },
    groups: [
      {
        id: "1",
        name: "Dec Party",
        avatar: "/Rectangle 3.png",
        message: "Lorem ipsum dolor sit amet, con...",
        time: "00:57",
        badge: 4,
        isMuted: true,
      },
    ],
  },
];

interface CommunityProps {
  onTabChange: (tab: string) => void;
}

export function Community({ onTabChange }: CommunityProps) {
  const [activeTab, setActiveTab] = useState("communities");
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
    { id: "groups", label: "Groups" },
    { id: "communities", label: "Communities" },
  ];

  return (
    <div
      className="p-1 h-full flex flex-col ml-3 mr-2 mb-4"
      onClick={() => setShowCopyPopup(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-3 ">
        <h2 className="text-xl font-bold">Group</h2>
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
      <div className="relative mb-4 mt-2">
        <Input
          placeholder="What are you looking for"
          className="pr-10 rounded-full"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
      </div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-2 mt-2 border rounded-full bg-gray-100 justify-between">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              "rounded-full text-sm py-1 px-25 hover:bg-gray-200 transition-colors",
              activeTab === tab.id
                ? "bg-white text-blue-500 shadow"
                : "bg-gray-100"
            )}
            onClick={() => {
              setActiveTab(tab.id);
              onTabChange(tab.id);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {/* Community List */}
      <div className="flex-1 mt-3">
        {communities.map((community) => (
          <div
            key={community.id}
            className={`${
              community.id !== "1" ? "pt-8 border-t-8 border-gray-100" : ""
            } mb-5 w-full`}
          >
            {/* Community Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="h-15 w-15 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                <HiUserGroup className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between w-full">
                  <p className="font-medium">{community.name}</p>
                  {community.hasCopyIcon && (
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
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Community: {community.groupCount} groups
                </p>
              </div>
            </div>
            {/* Announcement */}
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/Annoucement.png"
                alt="Announcement"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />

              <div className="flex-1">
                <p className="font-medium">{community.announcement.title}</p>
                <p className="text-sm text-gray-500">
                  {community.announcement.message}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {community.announcement.time}
              </p>
            </div>
            {/* General Group */}
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/Group-Com.png"
                alt="General Group"
                width={48}
                height={48}
                className="h-12 w-12 object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">General group</p>
                <p className="text-sm text-gray-500">
                  {community.generalGroup.message}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {community.generalGroup.time}
              </p>
            </div>
            <hr className="border-gray-200 mb-4" />
            {/* Community Groups */}
            {community.groups.map((group) => (
              <div key={group.id} className="flex items-center gap-3 py-3">
                <div className="relative">
                  {group.hasGroupIcon ? (
                    <div className="h-15 w-15 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                      <Users className="h-8 w-8 text-gray-600" />
                      {group.online && (
                        <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                  ) : (
                    <Image
                      src={group.avatar || "/default-avatar.jpg"}
                      alt={group.name}
                      width={60}
                      height={60}
                      className="h-15 w-15 rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{group.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <p className="text-sm text-gray-500">{group.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {group.statusIcon === "copyPlus" ? (
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <TbCopyPlusFilled className="h-8 w-8 text-white" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{group.time}</p>
                  )}
                  {(group.badge || group.pinned || group.isMuted) && (
                    <div className="flex items-center gap-1">
                      {group.pinned && (
                        <BsPinAngleFill className="h-4 w-4 text-red-600" />
                      )}
                      {group.isMuted && (
                        <IoVolumeMuteOutline className="h-4 w-4 text-gray-500" />
                      )}
                      {group.badge && (
                        <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {group.badge}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
