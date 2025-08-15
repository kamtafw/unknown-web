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
import { CopyPopup } from "@/app/messenger/schedule/CopyPopup";
import { NewGroupMemberSelection } from "../group/NewGroupMemberSelection";
import { NewGroupSettings } from "../group/NewGroupSettings";
import { CommunityDetail } from "./CommunityDetail";

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

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
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
    groupCount: 1,
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
  onGroupSelect?: (group: Group) => void;
  onGroupCreated?: (group: Group) => void;
}

export function Community({
  onTabChange,
  onGroupSelect,
  onGroupCreated,
}: CommunityProps) {
  const [activeTab, setActiveTab] = useState("communities");
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showNewGroupMemberSelection, setShowNewGroupMemberSelection] =
    useState(false);
  const [showNewGroupSettings, setShowNewGroupSettings] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );

  const router = useRouter();

  const handleSchedule = () => {
    router.push("/messenger/schedule");
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

  const handleMemberSelectionNext = (members: Contact[]) => {
    setSelectedMembers(members);
    setShowNewGroupMemberSelection(false);
    setShowNewGroupSettings(true);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => member.id !== memberId)
    );
  };

  const handleCreateNewGroup = (groupData: {
    name: string;
    avatar?: string;
    members: Contact[];
    settings: {
      editGroupSettings: boolean;
      sendMessages: boolean;
      addOtherMember: boolean;
      approveNewMembers: boolean;
    };
  }) => {
    const newGroup: Group = {
      id: (groups.length + 1).toString(),
      name: groupData.name,
      avatar: groupData.avatar,
      hasGroupIcon: !groupData.avatar,
      message: "Group created",
      time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      badge: 0,
    };

    setGroups((prev) => [...prev, newGroup]);

    if (onGroupCreated) {
      onGroupCreated(newGroup);
    }

    setShowNewGroupSettings(false);
    setSelectedMembers([]);

    setActiveTab("groups");
    onTabChange("groups");
  };

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
  };

  const handleBackFromCommunityDetail = () => {
    setSelectedCommunity(null);
  };

  // If a community is selected, show the detail view
  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        onBack={handleBackFromCommunityDetail}
        onGroupSelect={onGroupSelect}
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <div
        className="p-1 h-full flex flex-col ml-3 mr-2 mb-4 overflow-hidden"
        onClick={() => setShowCopyPopup(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mt-3 flex-shrink-0">
          <h2 className="text-xl font-bold">Group</h2>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <Popover>
              <PopoverTrigger>
                <EllipsisVertical className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewGroupMemberSelection(true);
                    }}
                  >
                    New Group
                  </Button>
                  <Button variant="ghost">New Community</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push("/messenger/schedule");
                    }}
                  >
                    Schedule Message
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 mt-2 flex-shrink-0">
          <Input
            placeholder="What are you looking for"
            className="pr-10 rounded-full"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-2 mt-2 border rounded-full bg-gray-100 justify-between flex-shrink-0">
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

        {/* Community List - Scrollable */}
        <div className="flex-1 mt-3 overflow-y-auto">
          {communities.map((community) => (
            <div
              key={community.id}
              className={`${
                community.id !== "1" ? "pt-8 border-t-8 border-gray-100" : ""
              } mb-5 w-full cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors`}
              onClick={() => handleCommunityClick(community)}
            >
              {/* Community Header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="h-15 w-15 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                  <HiUserGroup className="h-8 w-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between w-full">
                    <p className="font-medium">{community.name}</p>
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
                    <p className="text-sm text-gray-500">{group.time}</p>
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

      {/* Fixed floating copy button - same positioning as ChatList and GroupList */}
      <button
        title="Copy Plus"
        onClick={(e) => {
          e.stopPropagation();
          setShowCopyPopup(true);
        }}
        className="fixed bottom-6 left-160 h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg z-50"
      >
        <TbCopyPlusFilled className="h-8 w-8 text-white" />
      </button>
      <NewGroupMemberSelection
        isOpen={showNewGroupMemberSelection}
        onClose={() => setShowNewGroupMemberSelection(false)}
        onNext={handleMemberSelectionNext}
      />

      <NewGroupSettings
        isOpen={showNewGroupSettings}
        onClose={() => setShowNewGroupSettings(false)}
        onBack={() => {
          setShowNewGroupSettings(false);
          setShowNewGroupMemberSelection(true);
        }}
        selectedMembers={selectedMembers}
        onRemoveMember={handleRemoveMember}
        onCreateGroup={handleCreateNewGroup}
      />
    </div>
  );
}
