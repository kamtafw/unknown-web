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

  const handleGroupSelect = (group: Group) => {
    console.log("Page: Group selected:", group.name);
    console.log("Page: Group avatar:", group.avatar);
    console.log("Page: Group hasGroupIcon:", group.hasGroupIcon);
    setSelectedGroup(group);
  };

  const handleBackFromGroupChat = () => {
    console.log("Page: Going back to group list");
    setSelectedGroup(null);
  };

  const handleNavigateToGroupList = () => {
    console.log("Page: Navigating back to group list from archive");
    setSelectedGroup(null);
    setActiveView("groups");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[480px] border-r bg-white overflow-hidden">
        {activeView === "groups" ? (
          <GroupList
            onTabChange={setActiveView}
            onGroupSelect={handleGroupSelect}
          />
        ) : (
          <Community
            onTabChange={setActiveView}
            onGroupSelect={handleGroupSelect}
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
