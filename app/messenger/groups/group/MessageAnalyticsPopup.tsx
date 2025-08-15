"use client";


import { PiEyes } from "react-icons/pi";
import { LuMessageSquareReply, LuSmilePlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
  avatar?: string;
}

interface MessageAnalyticsPopupProps {
  message: Message;
  onClose: () => void;
}

export function MessageAnalyticsPopup({ message, onClose }: MessageAnalyticsPopupProps) {
  const replies = [
    {
      id: "1",
      sender: "Devon Lane",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      time: "31/01/2024 - 10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 3 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 }
      ]
    },
    {
      id: "2",
      sender: "Devon Lane",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      time: "31/01/2024 - 10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 3 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 }
      ]
    },
    {
      id: "3",
      sender: "Devon Lane",
      content: "Lorem ipsum dolor sit amet, consectetur",
      time: "31/01/2024 - 10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 3 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 }
      ]
    },
    {
      id: "4",
      sender: "Devon Lane",
      content: "😊",
      time: "31/01/2024 - 10:30",
      avatar: "/Rectangle 3.png"
    }
  ];

  const stats = {
    views: "3.2k views",
    replies: "500 replies",
    reactions: "2,012 reactions"
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-130 mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 pb-0 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Message</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <IoMdClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Original Message */}
          <div className="p-4 border-b">
            <div className="flex items-start gap-3">
              {message.avatar && (
                <Image
                  src={message.avatar}
                  alt={message.sender}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{message.sender}</span>
                  <span className="text-sm text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                
                {message.reactions && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {message.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-xs text-gray-500 mb-2 block text-right">31/01/2024 - 10:30</span>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    <PiEyes className="h-4 w-4" />
                    <span>{stats.views}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    <LuMessageSquareReply className="h-4 w-4" />
                    <span>{stats.replies}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    <LuSmilePlus className="h-4 w-4" />
                    <span>{stats.reactions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replies Header */}
          <div className="px-4 py-2 bg-gray-50 border-b">
            <h4 className="font-medium text-sm">Replies</h4>
          </div>

          {/* Replies List */}
          <div className="divide-y">
            {replies.map((reply) => (
              <div key={reply.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Image
                    src={reply.avatar}
                    alt={reply.sender}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{reply.sender}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                    
                    {reply.reactions && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {reply.reactions.map((reaction, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-500">{reply.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}