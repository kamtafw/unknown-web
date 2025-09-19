"use client";

import { useState } from "react";
import { ArrowLeft, Users, Search } from "lucide-react";
import { HiDotsVertical } from "react-icons/hi";
import { MdPhoneCallback } from "react-icons/md";
import { FaSignalMessenger } from "react-icons/fa6";
import { TbCopyPlusFilled } from "react-icons/tb";
import { FaVideo, FaMicrophone } from "react-icons/fa6";
import { MdImage } from "react-icons/md";
import { BsPinAngleFill } from "react-icons/bs";
import { IoCheckmarkDone } from "react-icons/io5";
import { Check } from "lucide-react";
import { HiHashtag } from "react-icons/hi";
import { IoVolumeMuteOutline } from "react-icons/io5";
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
import { ArchiveContextMenu } from "./ArchiveContextMenu";
import { ClearChatPopup } from "./ClearChatPopup";

interface ArchivedItem {
  id: string;
  name: string;
  type: "group" | "chat";
  icon?: React.ReactNode;
  time: string;
  message: string;
  badge?: number;
  online?: boolean;
  pinned?: boolean;
  statusIcon?: string;
  avatar?: string;
  hasStatusIndicator?: boolean;
  statusIndicatorType?: "active" | "viewed";
  hasGroupIcon?: boolean;
  isMuted?: boolean;
  hasHashIcon?: boolean;
}

const archivedItems: ArchivedItem[] = [
  {
    id: "group1",
    name: "Good",
    type: "group",
    hasGroupIcon: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum sit, con...",
    time: "00:59",
    isMuted: true,
  },
  {
    id: "group2",
    name: "CSC101 Tutorials",
    type: "group",
    hasGroupIcon: true,
    online: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum dolor sit, con...",
    time: "00:59",
    isMuted: true,
  },
  {
    id: "2",
    name: "Cameron Williamson",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <FaSignalMessenger className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    badge: 4,
    online: true,
  },
  {
    id: "3",
    name: "Robert Fox",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <IoCheckmarkDone className="h-4 w-4 text-blue-500" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    hasStatusIndicator: true,
    statusIndicatorType: "active",
  },
  {
    id: "4",
    name: "Marvin McKinney",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <Check className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    statusIcon: "copyPlus",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "5",
    name: "Darlene Robertson",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <FaMicrophone className="h-4 w-4 text-blue-500" />,
    message: "0:25",
    time: "00:57",
  },
  {
    id: "6",
    name: "Kristin Watson",
    type: "chat",
    avatar: "/Rectangle 3.png",
    message: "Typing a message",
    time: "05:57",
  },
  {
    id: "7",
    name: "Arlene McCoy",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-red-500" />,
    message: "Missed voice call",
    time: "06:57",
    badge: 4,
  },
  {
    id: "8",
    name: "Jane Cooper",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-gray-600" />,
    message: "Voice call",
    time: "07:52",
    badge: 4,
  },
  {
    id: "9",
    name: "Robert Kim",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <IoCheckmarkDone className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "07:58",
    hasStatusIndicator: true,
    statusIndicatorType: "viewed",
  },
  {
    id: "10",
    name: "Arlene Cane",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <FaVideo className="h-4 w-4 text-blue-500" />,
    message: "Video",
    time: "08:51",
    badge: 4,
  },
  {
    id: "11",
    name: "Wade Warren",
    type: "chat",
    avatar: "/Rectangle 3.png",
    icon: <MdImage className="h-4 w-4 text-gray-600" />,
    message: "Image",
    time: "08:55",
  },
  {
    id: "12",
    name: "Kristin Watson",
    type: "chat",
    avatar: "/Rectangle 3.png",
    message: "Recording a voice message",
    time: "09:00",
  },
];

interface ArchivePageProps {
  onBack: () => void;
  fromPage?: "chat" | "unread" | "groups";
}

export function ArchivePage({ onBack,  }: ArchivePageProps) {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    itemId: "",
    itemName: "",
    position: { x: 0, y: 0 },
  });

  const [showClearChatPopup, setShowClearChatPopup] = useState(false);
  const [selectedChatName, setSelectedChatName] = useState("");

  const handleBack = () => {
    onBack();
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    itemId: string,
    itemName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      itemId,
      itemName,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleHeaderAction = (action: string) => {
    if (action === "clear") {
      setSelectedChatName("Archive");
      setShowClearChatPopup(true);
    } else {
      console.log(`Header action: ${action}`);
    }
  };

  const handleClearMessagesFromContext = (itemName: string) => {
    setSelectedChatName(itemName);
    setShowClearChatPopup(true);
  };

  const handleClearChat = (deleteMedia: boolean) => {
    console.log(`Clearing chat for: ${selectedChatName}, Delete media: ${deleteMedia}`);
  };

  const handleChatClick = (item: ArchivedItem) => {
    setSelectedChatName(item.name);
    setShowClearChatPopup(true);
  };

  return (
    <div className="p-2 sm:p-3 lg:p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0 mt-2 sm:mt-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-lg sm:text-xl lg:text-xl font-bold">Archive</h2>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
              <HiDotsVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                onClick={() => handleHeaderAction("unarchive")}
                className="justify-start"
              >
                Unarchive
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleHeaderAction("clear")}
                className="justify-start"
              >
                Clear Messages
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleHeaderAction("markRead")}
                className="justify-start"
              >
                Mark as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 flex-shrink-0">
        <Input
          placeholder="What are you looking for"
          className="pr-10 rounded-full"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white bg-blue-500 rounded-full p-1" />
      </div>

      {/* Archived Items List */}
      <div className="flex-1 overflow-y-auto">
        {archivedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 sm:gap-3 py-2 hover:bg-gray-50 rounded-lg px-1 sm:px-2 cursor-pointer"
            onClick={() => handleChatClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item.id, item.name)}
          >
            <div className="relative">
              {item.type === "group" && item.hasGroupIcon ? (
                <div className="h-15 w-15 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                  <Users className="h-8 w-8 text-gray-600" />
                  {item.online && (
                    <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
              ) : item.hasStatusIndicator ? (
                <StatusIndicator variant={item.statusIndicatorType}>
                  <Image
                    src={item.avatar || "/default-avatar.jpg"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="h-15 w-15 rounded-full object-cover"
                  />
                </StatusIndicator>
              ) : (
                <>
                  <Image
                    src={item.avatar || "/default-avatar.jpg"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="h-15 w-15 rounded-full object-cover"
                  />
                  {item.online && (
                    <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {item.statusIcon === "story" && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-dashed" />
                  )}
                  {item.statusIcon === "border" && (
                    <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
                  )}
                </>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.icon}
                <p
                  className={cn(
                    "text-sm text-gray-500",
                    (item.message.includes("Recording") ||
                      item.message.includes("Typing")) &&
                      "text-blue-500"
                  )}
                >
                  {item.message}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {item.statusIcon === "copyPlus" ? (
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <TbCopyPlusFilled className="h-8 w-8 text-white" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">{item.time}</p>
              )}

              {/* Always check for badge/pinned/muted, regardless of statusIcon */}
              {(item.badge || item.pinned || item.isMuted) && (
                <div className="flex items-center gap-1">
                  {item.pinned && (
                    <BsPinAngleFill className="h-4 w-4 text-red-600" />
                  )}
                  {item.isMuted && (
                    <IoVolumeMuteOutline className="h-4 w-4 text-gray-500" />
                  )}
                  {item.badge && (
                    <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {item.badge}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ArchiveContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
        itemId={contextMenu.itemId}
        itemName={contextMenu.itemName}
        onClearMessages={handleClearMessagesFromContext}
      />

      <ClearChatPopup
        isOpen={showClearChatPopup}
        onClose={() => setShowClearChatPopup(false)}
        onClearChat={handleClearChat}
      />
    </div>
  );
}