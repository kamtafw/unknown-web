"use client";

import { Archive } from "lucide-react";
import { MdPhoneCallback } from "react-icons/md";
import { FaSignalMessenger } from "react-icons/fa6";
import { TbCopyPlusFilled } from "react-icons/tb";
import { FaVideo } from "react-icons/fa6";
import { BsPinAngleFill } from "react-icons/bs";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/StatusIndicator";

interface Chat {
  id: string;
  name: string;
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
}
const unreadChats: Chat[] = [
  {
    id: "1",
    name: "Louigi Dash",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-red-500" />,
    message: "Missed voice call",
    time: "00:57",
    badge: 4,
    pinned: true,
  },
  {
    id: "2",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    icon: <FaSignalMessenger className="h-4 w-4 text-gray-600" />,
    message: "Lorem ipsum dolor sit amet, co...",
    time: "00:57",
    badge: 4,
    online: true,
  },
  {
    id: "7",
    name: "Arlene McCoy",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-red-500" />,
    message: "Missed voice call",
    time: "06:57",
    badge: 4,
  },
  {
    id: "8",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    icon: <MdPhoneCallback className="h-4 w-4 text-gray-600" />,
    message: "Voice call",
    time: "07:52",
    badge: 4,
  },
  {
    id: "10",
    name: "Arlene Cane",
    avatar: "/Rectangle 3.png",
    icon: <FaVideo className="h-4 w-4 text-blue-500" />,
    message: "Video",
    time: "08:51",
    badge: 4,
  },
];

export function UnreadList() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex-1">
        {unreadChats.map((chat) => (
          <div key={chat.id} className="flex items-center gap-3 py-2">
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
                {chat.icon}
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
              {chat.statusIcon === "copyPlus" ? (
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <TbCopyPlusFilled className="h-8 w-8 text-white" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">{chat.time}</p>
              )}
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
    </>
  );
}
