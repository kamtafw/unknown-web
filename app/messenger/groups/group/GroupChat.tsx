"use client";

import { useState } from "react";
import { TiPin } from "react-icons/ti";
import { HiDotsVertical } from "react-icons/hi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GroupOptionsPopup } from "./GroupOptionsPopup";
import { SearchPopup } from "./SearchPopup";
import { CalendarPopup } from "./CalendarPopup";
import { ChangeGroupNamePopup } from "./ChangeGroupNamePopup";
import { AddToListPopup } from "../../chats/AddToListPopup";
import { MuteNotificationPopup } from "../../chats/MuteNotificationPopup";
import { ArchivePage } from "../../chats/Archive";
import { GroupChatInterface } from "./GroupChatInterface";
import { GroupCallPage } from "../../calls/GroupCall";
import { VideoCall } from "../../calls/VideoCall";
import { MdGroups2 } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { IoMdVideocam } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { Users } from "lucide-react";
import Image from "next/image";
import { GroupInfoPopup } from "./groupinfo/GroupInfoPopup";

interface GroupChatProps {
  groupName: string;
  onBack: () => void;
  isAdmin?: boolean;
  onNavigateToGroupList?: () => void;
  groupAvatar?: string;
  hasGroupIcon?: boolean;
}

export function GroupChat({
  groupName,
  isAdmin = false,
  onNavigateToGroupList,
  groupAvatar,
  hasGroupIcon = false,
}: GroupChatProps) {
  const [activeTab, setActiveTab] = useState<"messages" | "trending" | "spam">(
    "messages"
  );
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChangeGroupName, setShowChangeGroupName] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showMuteNotification, setShowMuteNotification] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const handleGroupOptionSelect = (option: string) => {
    setShowGroupOptions(false);
    switch (option) {
      case "groupInfo":
        setShowGroupInfo(true);
        break;
      case "changeGroupName":
        setShowChangeGroupName(true);
        break;
      case "addToList":
        setShowAddToList(true);
        break;
      case "muteNotification":
        setShowMuteNotification(true);
        break;
      case "archiveChat":
        console.log("Archive option selected - handled by GroupOptionsPopup");
        break;
    }
  };

  const handleCreateNewList = () => {
    console.log("Creating new list");
    setShowAddToList(false);
  };

  const handleAddToFavorites = () => {
    console.log("Adding to favorites");
    setShowAddToList(false);
  };

  const handleMuteNotification = (duration: string) => {
    console.log("Muting notification for:", duration);
    setShowMuteNotification(false);
  };

  const handleStartAudioCall = () => {
    console.log("Starting audio call for group:", groupName);
    setShowCall(true);
  };

  const handleStartVideoCall = () => {
    console.log("Starting video call for group:", groupName);
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    console.log("Ending call");
    setShowCall(false);
    setShowVideoCall(false);
  };

  if (showArchive) {
    return <ArchivePage onBack={() => setShowArchive(false)} />;
  }

  if (showCall) {
    console.log("Rendering GroupCallPage with groupName:", groupName);
    return (
      <GroupCallPage
        isOpen={showCall}
        onClose={() => setShowCall(false)}
        onEndCall={handleEndCall}
        participants={[]}
        groupName={groupName}
      />
    );
  }

  if (showVideoCall) {
    console.log("Rendering VideoCall with groupName:", groupName);
    return (
      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        onEndCall={handleEndCall}
        participants={[]}
        groupName={groupName}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Dynamic Avatar Display */}
              {hasGroupIcon || !groupAvatar ? (
                <div className="h-10 w-10 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              ) : (
                <Image
                  src={groupAvatar}
                  alt={groupName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-medium">{groupName}</h3>
                <p className="text-sm text-gray-500">
                  Arlene McCoy, Mercy Cameron...
                </p>
              </div>
            </div>
            <div className="bg-blue-400 border h-10 w-10 rounded-lg flex items-center justify-center">
              <MdGroups2 className="text-white w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="border rounded-lg px-1.5 py-1 bg-gray-200 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 rounded-full border-l-red-800"
                onClick={handleStartAudioCall}
              >
                <IoCall className="h-5 w-5 text-black" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={handleStartVideoCall}
              >
                <IoMdVideocam className="h-5 w-5 text-black" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FaSearch className="h-7 w-7 text-black" />
            </Button>
            <Popover open={showGroupOptions} onOpenChange={setShowGroupOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiDotsVertical className="h-7 w-7 text-black" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <GroupOptionsPopup
                  isOpen={true}
                  onClose={() => setShowGroupOptions(false)}
                  onOptionSelect={handleGroupOptionSelect}
                  onNavigateToGroupList={onNavigateToGroupList}
                  groupName={groupName}
                  groupAvatar={groupAvatar}
                  hasGroupIcon={hasGroupIcon}
                  onStartVideoCall={handleStartVideoCall}
                  onStartAudioCall={handleStartAudioCall}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-2 bg-gray-100 px-3 py-2 rounded-full mb-8">
          <div className="flex rounded-full">
            <button
              className={`flex-1 py-1 text-center font-medium ${
                activeTab === "messages"
                  ? "text-black bg-white rounded-full"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("messages")}
            >
              Messages
            </button>
            <button
              className={`flex-1 py-1 text-center font-medium ${
                activeTab === "trending"
                  ? "text-black bg-white rounded-full"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("trending")}
            >
              Trending
            </button>
            {isAdmin && (
              <button
                className={`flex-1 py-1 text-center font-medium ${
                  activeTab === "spam"
                    ? "text-black bg-white rounded-full"
                    : "text-black"
                }`}
                onClick={() => setActiveTab("spam")}
              >
                <span className="flex items-center justify-center gap-1">
                  Spam
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="ml-6 flex items-center">
          <TiPin className="text-red-500 w-7 h-7 mr-3" />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod
          </p>
        </div>
      </div>

      {/* Messages Interface Component */}
      <GroupChatInterface activeTab={activeTab} isAdmin={isAdmin} />

      {/* Popups */}
      <SearchPopup
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      <ChangeGroupNamePopup
        isOpen={showChangeGroupName}
        onClose={() => setShowChangeGroupName(false)}
        currentName={groupName}
      />

      <AddToListPopup
        isOpen={showAddToList}
        onClose={() => setShowAddToList(false)}
        onCreateNewList={handleCreateNewList}
        onAddToFavorites={handleAddToFavorites}
      />

      <MuteNotificationPopup
        isOpen={showMuteNotification}
        onClose={() => setShowMuteNotification(false)}
        onSave={handleMuteNotification}
      />
      {showGroupInfo && (
        <GroupInfoPopup
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          groupName={groupName}
          groupAvatar={groupAvatar}
          hasGroupIcon={hasGroupIcon}
          isAdmin={isAdmin}
          onStartVideoCall={handleStartVideoCall}
          onStartAudioCall={handleStartAudioCall}
          onChangeGroupName={() => {
            setShowGroupInfo(false);
            setShowChangeGroupName(true);
          }}
          onAddToList={() => {
            setShowGroupInfo(false);
            setShowAddToList(true);
          }}
          onExitGroup={() => {
            setShowGroupInfo(false);
            onNavigateToGroupList?.();
          }}
        />
      )}
    </div>
  );
}
