"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Camera, Search, Archive, Users } from "lucide-react";
import { TbCopyPlusFilled } from "react-icons/tb";
import { HiHashtag } from "react-icons/hi";
import { IoVolumeMuteOutline } from "react-icons/io5";
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
import { CopyPopup } from "@/app/messenger/schedule/CopyPopup";
import { ArchivePage } from "../../chats/Archive";
import { NewGroupMemberSelection } from "./NewGroupMemberSelection";
import { NewGroupSettings } from "./NewGroupSettings";

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

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const initialGroups: Group[] = [
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
    time: "00:59",
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

interface GroupListProps {
  onTabChange: (tab: string) => void;
  onGroupSelect: (group: Group) => void;
  sharedGroups?: Group[];
  onGroupsUpdated?: (groups: Group[]) => void;
}

export function GroupList({ onTabChange, onGroupSelect }: GroupListProps) {
  const [activeTab, setActiveTab] = useState("groups");
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showNewGroupMemberSelection, setShowNewGroupMemberSelection] =
    useState(false);
  const [showNewGroupSettings, setShowNewGroupSettings] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [showHeaderPopover, setShowHeaderPopover] = useState(false);

  const router = useRouter();

  const handleSchedule = () => {
    router.push("/messenger/schedule");
  };

  const handleCreateCommunity = () => {
    router.push("/create-community");
  };

  const handleCreateGroup = () => {
    setShowCopyPopup(false);
    setShowNewGroupMemberSelection(true);
  };

  const handleArchiveClick = () => {
    setShowArchive(true);
  };

  const handleBackFromArchive = () => {
    setShowArchive(false);
  };

  const handleGroupClick = (group: Group) => {
    console.log("handleGroupClick called with:", group.name);
    console.log("onGroupSelect type:", typeof onGroupSelect);

    if (onGroupSelect && typeof onGroupSelect === "function") {
      console.log("Calling onGroupSelect with group:", group.name);
      onGroupSelect(group);
    } else {
      console.error("onGroupSelect is not a function!", onGroupSelect);
    }
  };

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
    // Generate new group ID
    const newGroupId = (groups.length + 1).toString();

    // Create new group object
    const newGroup: Group = {
      id: newGroupId,
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

    // Add to groups list
    setGroups((prev) => [...prev, newGroup]);

    // Close popups
    setShowNewGroupSettings(false);
    setSelectedMembers([]);

    // Auto-select the new group
    onGroupSelect(newGroup);
  };

  const tabs = [
    { id: "groups", label: "Groups" },
    { id: "community", label: "Community" },
  ];

  if (showArchive) {
    return <ArchivePage onBack={handleBackFromArchive} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <div
        className="p-1 h-full flex flex-col ml-3 mr-2 overflow-hidden"
        onClick={() => setShowCopyPopup(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mt-3 flex-shrink-0">
          <h2 className="text-xl font-bold">Group</h2>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <Popover
              open={showHeaderPopover}
              onOpenChange={setShowHeaderPopover}
            >
              <PopoverTrigger>
                <EllipsisVertical className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowHeaderPopover(false);
                      handleCreateGroup();
                    }}
                  >
                    New Group
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowHeaderPopover(false);
                      handleCreateCommunity();
                    }}
                  >
                    New Community
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowHeaderPopover(false);
                      handleSchedule();
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

        {/* Archive Section */}
        <div
          className="flex items-center justify-between mb-4 mt-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors flex-shrink-0"
          onClick={handleArchiveClick}
        >
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

        {/* Group List - Scrollable */}
        <div className="flex-1 mt-3 overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
              onClick={() => {
                console.log("Group item clicked:", group.name);
                handleGroupClick(group);
              }}
            >
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

        <CopyPopup
          isOpen={showCopyPopup}
          onClose={() => setShowCopyPopup(false)}
          onSchedule={handleSchedule}
          onCreateCommunity={handleCreateCommunity}
          onCreateGroup={handleCreateGroup}
        />
      </div>

      {/* Fixed floating copy button - same positioning as ChatList */}
      {!showArchive && (
        <button
          title="Copy Plus"
          onClick={(e) => {
            e.stopPropagation();
            setShowCopyPopup(true);
          }}
          className={`fixed bottom-6 left-160 h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg ${
            showCopyPopup || showNewGroupMemberSelection || showNewGroupSettings
              ? "z-10"
              : "z-50"
          }`}
        >
          <TbCopyPlusFilled className="h-8 w-8 text-white" />
        </button>
      )}

      {/* New Group Popups */}
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
