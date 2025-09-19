"use client";

import { useState } from "react";
import { ArrowLeft, Users, Plus } from "lucide-react";
import Image from "next/image";
import { AddGroupsModal } from "./AddGroupsModal";

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

interface CommunityGroupManagementProps {
  communityName: string;
  onBack: () => void;
  onCreateNewGroup: () => void;
  onAddExistingGroups: () => void;
  onGroupSelect?: (group: Group) => void;
  availableGroups?: Group[];
}

export function CommunityGroupManagement({
  onBack,
  onCreateNewGroup,
  onAddExistingGroups,
  onGroupSelect,
  availableGroups = [],
}: CommunityGroupManagementProps) {
  const [showAddGroupsModal, setShowAddGroupsModal] = useState(false);
  const [groups] = useState<Group[]>([
    {
      id: "1",
      name: "Announcement",
      message: "Welcome to you community",
      time: "31/01/2024",
      icon: "/Annoucement.png",
    },
    {
      id: "2",
      name: "General group",
      message: "Welcome to you community", 
      time: "31/01/2024",
      icon: "/Group-Com.png",
    },
  ]);

  const handleAddExistingGroups = () => {
    setShowAddGroupsModal(true);
  };

  const handleAddGroupsModalClose = () => {
    setShowAddGroupsModal(false);
  };

  const handleCreateGroupFromModal = (selectedGroups: Group[]) => {
    console.log("Adding existing groups to community:", selectedGroups);
    setShowAddGroupsModal(false);
    
    onAddExistingGroups();
  };

  const handleGroupClick = (group: Group) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <button 
            onClick={onBack} 
            className="p-1" 
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">Add groups</h2>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-6 flex-shrink-0">
          {/* Create new group */}
          <button
            onClick={onCreateNewGroup}
            className="flex items-center gap-4 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="font-medium text-gray-800">Create new group</span>
          </button>
          {/* Add existing groups */}
          <button
            onClick={handleAddExistingGroups}
            className="flex items-center gap-4 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="font-medium text-gray-800">Add existing groups</span>
          </button>
        </div>
        <div className="mb-6 flex-shrink-0">
          <p className="text-sm text-gray-600 leading-relaxed">
            Members can suggest existing groups for admin approval and add new groups directly.{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">
              view community
            </span>
          </p>
        </div>
        {/* Groups you are in section */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Groups you are in
          </h3>

          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => handleGroupClick(group)}
              >
                <div className="flex-shrink-0">
                  <Image
                    src={group.icon as string || "/default-group-icon.png"}
                    alt={group.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-500">{group.message}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm text-gray-400">{group.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddGroupsModal
        isOpen={showAddGroupsModal}
        onClose={handleAddGroupsModalClose}
        availableGroups={availableGroups}
        onCreateGroup={handleCreateGroupFromModal}
      />
    </div>
  );
}