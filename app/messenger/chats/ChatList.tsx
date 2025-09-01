"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Camera, Search, Archive, Check } from "lucide-react";
import { IoCheckmarkDone } from "react-icons/io5";
import { MdPhoneCallback } from "react-icons/md";
import { FaSignalMessenger } from "react-icons/fa6";
import { FaMicrophone } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { MdImage } from "react-icons/md";
import { TbCopyPlusFilled } from "react-icons/tb";
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
import { StatusIndicator } from "@/components/StatusIndicator";
import { UnreadContent } from "./UnreadList";
import { FavoritesList } from "./FavoriteList";
import { ArchivePage } from "./Archive";
import { CopyPopup } from "@/app/messenger/schedule/CopyPopup";
import { ChatContextMenu } from "./ChatContextMenu";
import { CreateListPopup } from "./CreateListPopup";
import { chatsData, tabsData } from "./chatData";

export function ChatList({
  onChatSelect,
}: {
  onChatSelect?: (chatId: string, chatName: string, chatAvatar: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [showArchive, setShowArchive] = useState(false);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showCreateListPopup, setShowCreateListPopup] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    chatId: string;
    chatName: string;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    chatId: "",
    chatName: "",
    position: { x: 0, y: 0 },
  });

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderIcon = (iconType?: string, iconColor?: string) => {
    if (!iconType) return null;

    const className = `h-4 w-4 ${iconColor || "text-gray-600"}`;

    switch (iconType) {
      case "phone-callback":
        return <MdPhoneCallback className={className} />;
      case "messenger":
        return <FaSignalMessenger className={className} />;
      case "checkmark-done":
        return <IoCheckmarkDone className={className} />;
      case "check":
        return <Check className={className} />;
      case "microphone":
        return <FaMicrophone className={className} />;
      case "video":
        return <FaVideo className={className} />;
      case "image":
        return <MdImage className={className} />;
      default:
        return null;
    }
  };

  const handleSchedule = () => {
    if (isClient) {
      router.push("/messenger/schedule");
    }
  };

  const handleCreateCommunity = () => {
    if (isClient) {
      router.push("/create-community");
    }
  };

  const handleCreateGroup = () => {
    if (isClient) {
      router.push("/create-group");
    }
  };

  const handleCreateListDone = () => {
    setShowCreateListPopup(false);
    setActiveTab("favorites");
  };

  const handleGroupsClick = () => {
    window.location.href = "/messenger/groups";
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    chatId: string,
    chatName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setShowCopyPopup(false);

    setContextMenu({
      isOpen: true,
      chatId,
      chatName,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleArchiveClick = () => {
    setShowArchive(true);
  };

  const handleUnreadArchiveClick = () => {
    setShowArchive(true);
  };

  const handleArchiveFromContext = () => {
    setShowArchive(true);
  };

  const handleAddToFavoritesFromContext = () => {
    setActiveTab("favorites");
  };

  const handleBackFromArchive = () => {
    setShowArchive(false);
  };

  const handleCopyPopupClose = () => {
    setShowCopyPopup(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "unread":
        return <UnreadContent onArchiveClick={handleUnreadArchiveClick} onChatSelect={onChatSelect} />;
      case "favorites":
        return <FavoritesList />;
      case "groups":
        handleGroupsClick();
        return null;
      default:
        return (
          <div onClick={handleCopyPopupClose}>
            {/* Archive Section */}
            <div
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
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

            {/* Chat List */}
            <div className="flex-1">
              {chatsData.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                  onClick={(e) => {
                    if (contextMenu.isOpen) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }

                    if (onChatSelect) {
                      onChatSelect(
                        chat.id,
                        chat.name,
                        chat.avatar || "/default-avatar.jpg"
                      );
                    }
                  }}
                  onContextMenu={(e) => {
                    if (!showCopyPopup) {
                      handleContextMenu(e, chat.id, chat.name);
                    }
                  }}
                >
                  <div className="relative">
                    {chat.hasStatusIndicator ? (
                      <StatusIndicator variant={chat.statusIndicatorType}>
                        <Image
                          src={chat.avatar || "/default-avatar.jpg"}
                          alt={chat.name}
                          width={60}
                          height={60}
                          className="h-15 w-15 rounded-full object-cover"
                        />
                      </StatusIndicator>
                    ) : (
                      <>
                        <Image
                          src={chat.avatar || "/default-avatar.jpg"}
                          alt={chat.name}
                          width={60}
                          height={60}
                          className="h-15 w-15 rounded-full object-cover"
                        />
                        {chat.online && (
                          <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                        {chat.statusIcon === "story" && (
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-dashed" />
                        )}
                        {chat.statusIcon === "border" && (
                          <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{chat.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderIcon(chat.iconType, chat.iconColor)}
                      <p
                        className={cn(
                          "text-sm text-gray-500",
                          (chat.message.includes("Recording") ||
                            chat.message.includes("Typing")) &&
                            "text-blue-500"
                        )}
                      >
                        {chat.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {/* Always show time for all chats */}
                    <p className="text-sm text-gray-500">{chat.time}</p>

                    {/* Show badge/pinned indicators */}
                    {(chat.badge || chat.pinned) && (
                      <div className="flex items-center gap-1">
                        {chat.pinned && (
                          <BsPinAngleFill className="h-4 w-4 text-red-600" />
                        )}
                        {chat.badge && (
                          <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {chat.badge}
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
              onClose={handleCopyPopupClose}
              onSchedule={handleSchedule}
              onCreateCommunity={handleCreateCommunity}
              onCreateGroup={handleCreateGroup}
            />
            <CreateListPopup
              isOpen={showCreateListPopup}
              onClose={() => setShowCreateListPopup(false)}
              onDone={handleCreateListDone}
            />
            <ChatContextMenu
              isOpen={contextMenu.isOpen}
              position={contextMenu.position}
              onClose={handleCloseContextMenu}
              chatId={contextMenu.chatId}
              chatName={contextMenu.chatName}
              onArchiveChat={handleArchiveFromContext}
              onAddToFavorites={handleAddToFavoritesFromContext}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {showArchive ? (
        <ArchivePage onBack={handleBackFromArchive} />
      ) : (
        <div className="p-4 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold">
              {activeTab === "unread"
                ? "Unread"
                : activeTab === "favorites"
                ? "Favorites"
                : "Chat"}
            </h2>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <Popover>
                <PopoverTrigger>
                  <EllipsisVertical className="h-5 w-5" />
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost">New Group</Button>
                    <Button variant="ghost">New Community</Button>
                    <Button variant="ghost">Schedule Message</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 flex-shrink-0">
            <Input
              placeholder="What are you looking for"
              className="pr-10 rounded-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 flex-shrink-0">
            {tabsData.map((tab) => (
              <Button
                key={tab.id}
                variant="outline"
                className={cn(
                  "rounded-full text-sm py-1 px-5 bg-gray-100 hover:bg-gray-200",
                  activeTab === tab.id && "text-blue-500 border-blue-500"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
            <Button
              variant="outline"
              className="rounded-full text-sm py-1 px-5 bg-gray-100 hover:bg-gray-200"
              onClick={() => setShowCreateListPopup(true)}
            >
              <span className="text-blue-500 text-lg font-bold">+</span> Create
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
      )}
      {!showArchive && (
        <button
          title="Copy Plus"
          onClick={(e) => {
            e.stopPropagation();
            setShowCopyPopup(true);
          }}
          className="fixed bottom-6 left-160 md:left-40 lg:left-160 h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg z-50"
        >
          <TbCopyPlusFilled className="h-8 w-8 text-white" />
        </button>
      )}
    </div>
  );
}