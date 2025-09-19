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
      {/* Sidebar - Hidden on mobile when chat is open, full width on mobile when no chat */}
      <div className={`
        w-[480px] border-r bg-white overflow-hidden
        ${selectedGroup 
          ? 'hidden lg:block lg:w-[480px]' 
          : 'w-full lg:w-[480px]'
        }
      `}>
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

      {/* Main content - Hidden on mobile when no chat selected, full width on mobile when chat is open */}
      <div className={`
        flex-1
        ${selectedGroup 
          ? 'w-full lg:flex-1' 
          : 'hidden lg:block lg:flex-1'
        }
      `}>
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
          <div className="flex flex-col items-center justify-center h-full px-4">
            <Image
              src="/appcombo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="mb-4 object-contain"
            />
            <p className="text-lg text-gray-600 text-center">
              Send and receive messages with your laptop
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


