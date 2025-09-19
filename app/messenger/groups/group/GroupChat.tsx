"use client";

import { useState } from "react";
import { TiPin } from "react-icons/ti";
import { HiDotsVertical } from "react-icons/hi";
import { ArrowLeft } from "lucide-react";
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
import ReadPostPopup from "../../../(social)/home/main-popup/ReadPostPopup";

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
  onBack,
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
  const [showReadPostPopup, setShowReadPostPopup] = useState(false);

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

  const handleReadPostOutLoud = () => {
    setShowReadPostPopup(true);
    setShowGroupOptions(false);
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
    <div className="flex flex-col h-screen">
      <div className="border-b bg-white p-2 xs:p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4 lg:mb-5">
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-full lg:hidden flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 xs:h-5 xs:w-5 text-black" />
            </Button>

            <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Dynamic Avatar Display */}
              {hasGroupIcon || !groupAvatar ? (
                <div className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100 flex-shrink-0">
                  <Users className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-gray-600" />
                </div>
              ) : (
                <Image
                  src={groupAvatar}
                  alt={groupName}
                  width={40}
                  height={40}
                  className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs xs:text-sm sm:text-base truncate">
                  {groupName}
                </h3>
                <p className="text-xs xs:text-xs sm:text-sm text-gray-500 truncate hidden xs:block">
                  Arlene McCoy, Mercy Cameron...
                </p>
              </div>
            </div>

            <div className="bg-blue-400 border h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdGroups2 className="text-white w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 flex-shrink-0 ml-1 xs:ml-2">
            <div className="border rounded-lg px-0.5 xs:px-1 py-0.5 xs:py-1 bg-gray-200 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full border-l-red-800"
                onClick={handleStartAudioCall}
              >
                <IoCall className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-black" />
              </Button>

              <div className="w-px h-3 xs:h-4 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1"></div>

              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                onClick={handleStartVideoCall}
              >
                <IoMdVideocam className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-black" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="p-0.5 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
            >
              <FaSearch className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-black" />
            </Button>

            <Popover open={showGroupOptions} onOpenChange={setShowGroupOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0.5 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiDotsVertical className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-black" />
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
                  onReadPostOutLoud={handleReadPostOutLoud}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-1 bg-gray-100 px-1 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-full mb-2 xs:mb-4 sm:mb-6 lg:mb-8">
          <div className="flex rounded-full">
            <button
              className={`flex-1 py-0.5 xs:py-1 text-center font-medium text-xs sm:text-sm ${
                activeTab === "messages"
                  ? "text-black bg-white rounded-full"
                  : "text-black"
              }`}
              onClick={() => setActiveTab("messages")}
            >
              Messages
            </button>
            <button
              className={`flex-1 py-0.5 xs:py-1 text-center font-medium text-xs sm:text-sm ${
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
                className={`flex-1 py-0.5 xs:py-1 text-center font-medium text-xs sm:text-sm ${
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

        <div className="ml-1 xs:ml-2 sm:ml-6 flex items-start">
          <TiPin className="text-red-500 w-3 h-3 xs:w-4 xs:h-4 sm:w-7 sm:h-7 mr-1 xs:mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-xs xs:text-xs sm:text-base leading-tight">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod
          </p>
        </div>
      </div>

      {/* Messages Interface Component */}
      <div className="flex-1 min-h-0">
        <GroupChatInterface activeTab={activeTab} isAdmin={isAdmin} />
      </div>

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

      {showReadPostPopup && (
        <ReadPostPopup
          onClose={() => setShowReadPostPopup(false)}
          postContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
        />
      )}

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
