"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Image from "next/image";
import { MdOutlineMessage } from "react-icons/md";

interface Notification {
  id: string;
  type: "follow" | "mention" | "like" | "birthday" | "comment" | "connect";
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  action: string;
  time: string;
  isNew?: boolean;
  postContent?: string;
  hashtags?: string[];
  mentionText?: string;
}

const notifications: Notification[] = [
  // Follow notifications
  {
    id: "1",
    type: "follow",
    user: {
      name: "Arlene_McCoy",
      username: "Arlene_McCoy",
      avatar: "/profilepic.jpg",
    },
    action: "started following you",
    time: "2 hours ago",
    isNew: true,
  },
  {
    id: "2",
    type: "follow",
    user: {
      name: "John_Doe",
      username: "John_Doe",
      avatar: "/profilepic.jpg",
    },
    action: "started following you",
    time: "2 hours ago",
  },
  {
    id: "3",
    type: "connect",
    user: {
      name: "Sarah_Wilson",
      username: "Sarah_Wilson",
      avatar: "/profilepic.jpg",
    },
    action: "requested to connect",
    time: "2 hours ago",
  },
  {
    id: "4",
    type: "follow",
    user: {
      name: "Mike_Johnson",
      username: "Mike_Johnson",
      avatar: "/profilepic.jpg",
    },
    action: "started following you",
    time: "3 hours ago",
  },
  {
    id: "5",
    type: "follow",
    user: {
      name: "Emma_Davis",
      username: "Emma_Davis",
      avatar: "/profilepic.jpg",
    },
    action: "started following you",
    time: "4 hours ago",
  },
  {
    id: "6",
    type: "follow",
    user: {
      name: "Alex_Brown",
      username: "Alex_Brown",
      avatar: "/profilepic.jpg",
    },
    action: "started following you",
    time: "5 hours ago",
  },
  // Mention notifications
  {
    id: "7",
    type: "mention",
    user: {
      name: "Arlene_McCoy",
      username: "Arlene_McCoy",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "2 hours ago",
    mentionText: "@Cameron_Williamson this is you bro",
    postContent: "Design isn't just about what it looks like; it's about how it works. Every product tells a story—let's make sure it's one worth sharing.",
    hashtags: ["ProductDesign", "UX", "DesignThinking"],
  },
  {
    id: "8",
    type: "mention",
    user: {
      name: "Sarah_Wilson",
      username: "Sarah_Wilson",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "3 hours ago",
    mentionText: "@Cameron_Williamson check this out!",
    postContent: "The future of design is collaborative. When teams work together, magic happens.",
    hashtags: ["Collaboration", "Design", "Teamwork"],
  },
  {
    id: "9",
    type: "mention",
    user: {
      name: "Mike_Johnson",
      username: "Mike_Johnson",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "4 hours ago",
    mentionText: "@Cameron_Williamson thoughts on this?",
    postContent: "User experience design is about solving problems, not just making things pretty.",
    hashtags: ["UXDesign", "ProblemSolving"],
  },
  {
    id: "10",
    type: "mention",
    user: {
      name: "Emma_Davis",
      username: "Emma_Davis",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "5 hours ago",
    mentionText: "@Cameron_Williamson great insight!",
    postContent: "Design thinking starts with empathy. Understanding your users is the foundation of great products.",
    hashtags: ["DesignThinking", "Empathy", "UserResearch"],
  },
  {
    id: "11",
    type: "mention",
    user: {
      name: "Alex_Brown",
      username: "Alex_Brown",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "6 hours ago",
    mentionText: "@Cameron_Williamson what do you think?",
    postContent: "Accessibility in design isn't optional—it's essential for creating inclusive experiences.",
    hashtags: ["Accessibility", "InclusiveDesign"],
  },
  {
    id: "12",
    type: "mention",
    user: {
      name: "Lisa_Garcia",
      username: "Lisa_Garcia",
      avatar: "/profilepic.jpg",
    },
    action: "Mentioned you",
    time: "7 hours ago",
    mentionText: "@Cameron_Williamson love this perspective",
    postContent: "Prototyping is thinking made visible. Every iteration brings us closer to the right solution.",
    hashtags: ["Prototyping", "Innovation", "Design"],
  },
  // Birthday notifications
  {
    id: "13",
    type: "birthday",
    user: {
      name: "Arlene_McCoy",
      username: "Arlene_McCoy",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "2 hours ago",
    postContent: "Wish @Arlene_McCoy a happy birthday",
  },
  {
    id: "14",
    type: "birthday",
    user: {
      name: "John_Doe",
      username: "John_Doe",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "3 hours ago",
    postContent: "Wish @John_Doe a happy birthday",
  },
  {
    id: "15",
    type: "birthday",
    user: {
      name: "Sarah_Wilson",
      username: "Sarah_Wilson",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "4 hours ago",
    postContent: "Wish @Sarah_Wilson a happy birthday",
  },
  {
    id: "16",
    type: "birthday",
    user: {
      name: "Mike_Johnson",
      username: "Mike_Johnson",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "5 hours ago",
    postContent: "Wish @Mike_Johnson a happy birthday",
  },
  {
    id: "17",
    type: "birthday",
    user: {
      name: "Emma_Davis",
      username: "Emma_Davis",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "6 hours ago",
    postContent: "Wish @Emma_Davis a happy birthday",
  },
  {
    id: "18",
    type: "birthday",
    user: {
      name: "Alex_Brown",
      username: "Alex_Brown",
      avatar: "/profilepic.jpg",
    },
    action: "celebrates birthday today",
    time: "7 hours ago",
    postContent: "Wish @Alex_Brown a happy birthday",
  },
];

export default function NotificationPopover() {
  const [activeTab, setActiveTab] = useState<
    "All" | "Follows" | "Mentions" | "Birthdays"
  >("All");
  const [isOpen, setIsOpen] = useState(false);

  const handleFollowBack = (notificationId: string) => {
    console.log("Follow back clicked for:", notificationId);
  };

  const handleAccept = (notificationId: string) => {
    console.log("Accept clicked for:", notificationId);
  };

  const handleMessage = (notificationId: string) => {
    console.log("Message clicked for:", notificationId);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All") return true;
    if (activeTab === "Follows") return notification.type === "follow" || notification.type === "connect";
    if (activeTab === "Mentions") return notification.type === "mention";
    if (activeTab === "Birthdays") return notification.type === "birthday";
    return true;
  });

  const renderNotificationContent = (notification: Notification) => {
    // For follow and connect request notifications, show action buttons
    if (notification.type === "follow" || notification.type === "connect") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {notification.type === "follow" && (
            <>
              <Button
                onClick={() => handleFollowBack(notification.id)}
                className="w-30 bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded-full"
              >
                Follow back
              </Button>
              <Button
                onClick={() => handleMessage(notification.id)}
                variant="outline"
                className="w-30 border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-4 py-1 rounded-full flex items-center gap-1"
              >
                <MdOutlineMessage className="h-3 w-3 text-blue-500" /> Message
              </Button>
            </>
          )}
          {notification.type === "connect" && (
            <>
              <Button
                onClick={() => handleAccept(notification.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded-full"
              >
                Connect back
              </Button>
              <Button
                onClick={() => handleMessage(notification.id)}
                variant="outline"
                className="w-30 border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-4 py-1 rounded-full flex items-center gap-1"
              >
                <MdOutlineMessage className="h-3 w-3 text-blue-500" /> Message
              </Button>
            </>
          )}
        </div>
      );
    }

    // For other notifications, show mention text and post content separately
    return (
      <div className="mt-2">
        {/* Mention text (for mentions) */}
        {notification.type === "mention" && notification.mentionText && (
          <p className="text-sm text-gray-800 mb-3">{notification.mentionText}</p>
        )}

        {/* Birthday wish text */}
        {notification.type === "birthday" && (
          <p className="text-sm text-gray-800 mb-3">
            {notification.postContent}
          </p>
        )}

        {/* Post content in bordered container */}
        {notification.postContent && notification.type === "mention" && (
          <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <p className="text-sm text-gray-700 leading-relaxed">
              {notification.postContent}
            </p>
            {notification.hashtags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {notification.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-blue-500 text-sm">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social interaction buttons only for birthday posts */}
        {notification.type === "birthday" && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                title="Like post"
                aria-label="Like post"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                title="Comment on post"
                aria-label="Comment on post"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors"
                title="Repost"
                aria-label="Repost"
              >
                <Repeat2 className="h-4 w-4" />
              </button>
              <button
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Share post"
                aria-label="Share post"
              >
                <Share className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 p-2 shrink-0 relative"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {notifications.some((n) => n.isNew) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 sm:w-80 md:w-120 p-0 mr-2 sm:mr-4"
        align="center"
      >
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alert</h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["All", "Follows", "Mentions", "Birthdays"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 text-sm font-medium ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 shrink-0">
                    <Image
                      src={notification.user.avatar}
                      alt={notification.user.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            @{notification.user.username}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {notification.action}
                          </span>
                          {notification.type === "birthday" && (
                            <span className="text-lg">🎂</span>
                          )}
                        </div>
                        {notification.time && (
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        )}
                      </div>
                    </div>

                    {renderNotificationContent(notification)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
