"use client";

import { useState } from "react";
import { ArrowLeft, MoreVertical, Plus } from "lucide-react";
import { IoVolumeMuteOutline } from "react-icons/io5";
import { HiUserGroup, HiHashtag } from "react-icons/hi";
import { Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AddMembersModal } from "./AddMembersModal";
import { AccessDeniedModal } from "./AccessDeniedModal";

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

interface CommunityDetailProps {
  community: Community;
  onBack: () => void;
  onGroupSelect?: (group: Group) => void;
}

const groupListData: Group[] = [
  {
    id: "1",
    name: "Dec Party",
    avatar: "/Rectangle 3.png",
    message: "Lorem ipsum dolor sit amet, con...",
    time: "00:57",
    badge: 4,
    isMuted: true,
  },
  {
    id: "2",
    name: "CSC101 Tutorials",
    hasGroupIcon: true,
    online: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum dolor sit, con...",
    time: "00:57",
    isMuted: true,
  },
  {
    id: "3",
    name: "Programmer's Circuit",
    hasGroupIcon: true,
    message: "Lorem ipsum dolor sit amet, con...",
    time: "1:59",
    badge: 4,
    isMuted: true,
  },
  {
    id: "4",
    name: "Good",
    hasGroupIcon: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum sit, con...",
    time: "00:59",
  },
];

export function CommunityDetail({
  community,
  onBack,
  onGroupSelect,
}: CommunityDetailProps) {
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);

  const getGroupsForCommunity = (communityId: string) => {
    if (communityId === "1") {
      return groupListData.slice(0, 2);
    } else if (communityId === "2") {
      return groupListData.slice(0, 1);
    }
    return [];
  };

  const getAvailableGroups = (communityId: string) => {
    if (communityId === "1") {
      return groupListData.slice(2);
    } else if (communityId === "2") {
      return groupListData.slice(1);
    }
    return [];
  };

  const userGroups = getGroupsForCommunity(community.id);
  const availableGroups = getAvailableGroups(community.id);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 h-full flex flex-col ml-3 mr-2 mb-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1"
              aria-label="Back to community list"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                <HiUserGroup className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{community.name}</h2>
                <p className="text-sm text-gray-500">
                  Community · {community.groupCount} groups
                </p>
              </div>
            </div>
          </div>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button type="button" aria-label="More options" className="p-1">
                <MoreVertical className="h-5 w-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-2">
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Community info
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  onClick={() => {
                    setIsAddMembersModalOpen(true);
                    setIsPopoverOpen(false);
                  }}
                >
                  Invite members
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Groups you are in section */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 font-medium mb-3">
              Groups you are in
            </h3>

            {/* Announcement */}
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Image
                src="/Annoucement.png"
                alt="Announcement"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Announcement</p>
                <p className="text-xs text-gray-500">
                  Welcome to you community
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {community.announcement.time}
              </p>
            </div>

            {/* General group */}
            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Image
                src="/Group-Com.png"
                alt="General Group"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">General group</p>
                <p className="text-xs text-gray-500">
                  Welcome to you community
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {community.generalGroup.time}
              </p>
            </div>

            {/* User's groups */}
            {userGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" // Add cursor-pointer
                onClick={() => onGroupSelect?.(group)}
              >
                <div className="relative">
                  {group.hasGroupIcon ? (
                    <div className="h-10 w-10 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                      <Users className="h-5 w-5 text-gray-600" />
                      {group.online && (
                        <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border border-white" />
                      )}
                    </div>
                  ) : (
                    <Image
                      src={group.avatar || "/default-avatar.jpg"}
                      alt={group.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <p className="font-medium text-sm">{group.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{group.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">{group.time}</p>
                  <div className="flex items-center gap-1">
                    {group.isMuted && (
                      <IoVolumeMuteOutline className="h-3 w-3 text-gray-500" />
                    )}
                    {group.badge && (
                      <div className="bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                        {group.badge}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Groups you can join section */}
          {availableGroups.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-500 font-medium mb-3">
                Groups you can join
              </h3>

              {availableGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setIsAccessDeniedModalOpen(true)}
                >
                  <div className="relative">
                    {group.hasGroupIcon ? (
                      <div className="h-10 w-10 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                        <Users className="h-5 w-5 text-gray-600" />
                        {group.online && (
                          <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border border-white" />
                        )}
                      </div>
                    ) : (
                      <Image
                        src={group.avatar || "/default-avatar.jpg"}
                        alt={group.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {group.icon}
                      <p className="font-medium text-sm">{group.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">{group.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{group.time}</p>
                    <div className="flex items-center gap-1">
                      {group.isMuted && (
                        <IoVolumeMuteOutline className="h-3 w-3 text-gray-500" />
                      )}
                      {group.badge && (
                        <div className="bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                          {group.badge}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add group button */}
        <div className="flex-shrink-0 pt-4">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3">
            <Plus className="h-4 w-4 mr-2" />
            Add group
          </Button>
        </div>
      </div>
      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        onSubmit={(selectedMembers) => {
          console.log("Selected members:", selectedMembers);
        }}
      />
      <AccessDeniedModal
        isOpen={isAccessDeniedModalOpen}
        onClose={() => setIsAccessDeniedModalOpen(false)}
      />
    </div>
  );
}
