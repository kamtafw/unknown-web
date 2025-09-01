"use client";

import { useState } from "react";
import Image from "next/image";
import { GroupList } from "./group/GroupList";
import { Community } from "./community/CommunityList";
import { GroupChat } from "./group/GroupChat";

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

export default function Home() {
  const [activeView, setActiveView] = useState("groups");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAdmin] = useState(true);
  const [currentUserRole] = useState<'Admin' | 'Member'>('Admin'); 
  const [showCreateCommunityIntro, setShowCreateCommunityIntro] = useState(false);

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleBackFromGroupChat = () => {
    setSelectedGroup(null);
  };

  const handleNavigateToGroupList = () => {
    setSelectedGroup(null);
    setActiveView("groups");
  };

  const handleCreateCommunityFromGroupList = () => {
    setActiveView("communities");
    setShowCreateCommunityIntro(true);
  };

  return (
    <div className="flex h-screen">
      <div className="w-[480px] border-r bg-white overflow-hidden">
        {activeView === "groups" ? (
          <GroupList
            onTabChange={setActiveView}
            onGroupSelect={handleGroupSelect}
            onCreateCommunity={handleCreateCommunityFromGroupList}
          />
        ) : (
          <Community
            onTabChange={setActiveView}
            onGroupSelect={handleGroupSelect}
            currentUserRole={currentUserRole}
            showCreateCommunityIntro={showCreateCommunityIntro}
            onCloseCreateCommunityIntro={() => setShowCreateCommunityIntro(false)}
          />
        )}
      </div>

      <div className="flex-1">
        {selectedGroup ? (
          <GroupChat
            groupName={selectedGroup.name}
            groupAvatar={selectedGroup.avatar}
            hasGroupIcon={selectedGroup.hasGroupIcon}
            onBack={handleBackFromGroupChat}
            isAdmin={isAdmin}
            onNavigateToGroupList={handleNavigateToGroupList}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Image
              src="/appcombo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="mb-4 object-contain"
            />
            <p className="text-lg text-gray-600">
              Send and receive messages with your laptop
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
