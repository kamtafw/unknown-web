"use client";

import { useState } from "react";
import { ArrowLeft, Search, Users } from "lucide-react";
import { HiUserGroup } from "react-icons/hi";
import { TbCopyPlusFilled } from "react-icons/tb";
// import { MdOutlineGroupAdd } from "react-icons/md";
import Image from "next/image";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddGroupsModal } from "./AddGroupsModal";
import { CreateGroupModal } from "./CreateGroupModal";

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
  memberCount: number;
  description: string;
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

interface CommunityDetailProps {
  community: Community;
  currentUserRole?: "Admin" | "Member";
  onBack: () => void;
  onGroupSelect?: (group: Group) => void;
}

const availableGroups: Group[] = [
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
];

export function CommunityDetail({
  community,
  currentUserRole = "Member",
  onBack,
  onGroupSelect,
}: CommunityDetailProps) {
  const [communityGroups, setCommunityGroups] = useState<Group[]>(community.groups);
  const [showAddGroupsModal, setShowAddGroupsModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);

  const isAdmin = currentUserRole === "Admin";

  const handleAddExistingGroups = () => {
    setShowAddGroupsModal(true);
  };

  const handleGroupsAdded = (selectedGroups: Group[]) => {
    // Add the selected groups to the community
    setCommunityGroups(prev => [...prev, ...selectedGroups]);
    setShowAddGroupsModal(false);
  };

  const handleCreateNewGroup = () => {
    setShowCreateGroupModal(true);
  };

  const handleNewGroupCreated = (groupData: {
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
      id: (communityGroups.length + 1).toString(),
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

    setCommunityGroups(prev => [...prev, newGroup]);
    setShowCreateGroupModal(false);
    setSelectedMembers([]);
  };

  const handleGroupClick = (group: Group) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="p-1 h-full flex flex-col ml-3 mr-2 mb-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 mt-3 flex-shrink-0">
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Back to communities"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold">{community.name}</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 mt-2 flex-shrink-0">
            <Input
              placeholder="What are you looking for"
              className="pr-10 rounded-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
          </div>

          {/* Community Info */}
          <div className="mb-5 w-full p-2 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-15 w-15 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                <HiUserGroup className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{community.name}</p>
                <p className="text-sm text-gray-500">
                  Community • {communityGroups.length} groups • {community.memberCount} members
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{community.description}</p>

            {/* Add Groups Section */}
            {isAdmin && (
              <div className="space-y-2 mb-4">
                <div 
                  className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={handleAddExistingGroups}
                >
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Add existing groups</p>
                    <p className="text-xs text-gray-500">
                      Members can suggest existing groups for admin approval and add new groups directly.{" "}
                      <span className="text-blue-500">view community</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Announcement */}
          <div className="flex items-center gap-3 mb-3 flex-shrink-0">
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
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
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

          <hr className="border-gray-200 mb-4 flex-shrink-0" />

          {/* Groups Section Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="font-medium">Groups you are in</h3>
            <span className="text-sm text-gray-500">{communityGroups.length}</span>
          </div>

          {/* Community Groups - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {communityGroups.map((group) => (
              <div 
                key={group.id} 
                className="flex items-center gap-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors px-2"
                onClick={() => handleGroupClick(group)}
              >
                <div className="relative">
                  {group.hasGroupIcon ? (
                    <div className="h-12 w-12 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                      <Users className="h-6 w-6 text-gray-600" />
                      {group.online && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                  ) : (
                    <Image
                      src={group.avatar || "/default-avatar.jpg"}
                      alt={group.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{group.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <p className="text-sm text-gray-500">{group.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm text-gray-500">{group.time}</p>
                  {group.badge && (
                    <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {group.badge}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Add Button */}
        {isAdmin && (
          <button
            title="Create New Group"
            onClick={handleCreateNewGroup}
            className="fixed bottom-6 left-160 h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg z-50"
          >
            <TbCopyPlusFilled className="h-8 w-8 text-white" />
          </button>
        )}
      </div>

      <AddGroupsModal
        isOpen={showAddGroupsModal}
        onClose={() => setShowAddGroupsModal(false)}
        availableGroups={availableGroups}
        onCreateGroup={handleGroupsAdded}
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        selectedMembers={selectedMembers}
        onMemberRemove={(memberId) => {
          setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
        }}
        onCreateGroup={handleNewGroupCreated}
      />
    </>
  );
}