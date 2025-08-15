"use client";

import Image from "next/image";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
  avatar?: string;
  isYou?: boolean;
  replyTo?: string;
  type?: "text" | "image" | "poll" | "voice";
  images?: string[];
  pollData?: {
    question: string;
    options: { text: string; votes: number; voters: string[] }[];
    totalVotes: number;
  };
}

interface TrendingTabProps {
  onViewAnalytics: (message: Message) => void;
}

export function TrendingTab({ onViewAnalytics }: TrendingTabProps) {
  const messages: Message[] = [
    {
      id: "1",
      sender: "You",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      time: "10:30",
      isYou: true,
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
    {
      id: "2",
      sender: "Devon Lane",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
      time: "10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
    {
      id: "3",
      sender: "Devon Lane",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
      time: "10:30",
      avatar: "/Rectangle 3.png",
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
    {
      id: "4",
      sender: "Jacob Jones",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
      time: "10:30",
      avatar: "/Rectangle 3.png",
      type: "image",
      images: [
        "/Rectangle 3.png",
        "/Rectangle 3.png",
        "/Rectangle 3.png",
        "/Rectangle 3.png",
        "/Rectangle 3.png",
      ],
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
    },
    {
      id: "5",
      sender: "Jacob Jones",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
      time: "14:25",
      avatar: "/Rectangle 3.png",
      type: "poll",
      pollData: {
        question:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
        options: [
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 2,
            voters: ["user1", "user2"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 1,
            voters: ["user3"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 1,
            voters: ["user4"],
          },
        ],
        totalVotes: 4,
      },
    },
  ];

  // Filter messages that have reactions with more than 20 counts (trending)
  const trendingMessages = messages.filter(
    (msg) => msg.reactions && msg.reactions.some((r) => r.count > 20)
  );

  const handleRightClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); // Prevent the default context menu
    onViewAnalytics(msg);
  };

  return (
    <div className="space-y-3">
      {trendingMessages.length > 0 ? (
        trendingMessages
          .filter((msg) => !msg.isYou)
          .map((msg) => (
            <div key={msg.id} className="w-full">
              <div className="flex gap-2 items-start">
                {msg.avatar && (
                  <Image
                    src={msg.avatar}
                    alt={msg.sender}
                    width={24}
                    height={24}
                    className="rounded-full flex-shrink-0 mt-0"
                  />
                )}
                <div className="flex flex-col">
                  <div
                    className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow max-w-2xl"
                    onContextMenu={(e) => handleRightClick(e, msg)}
                  >
                    <div className="mb-2">
                      <span className="font-medium text-sm">{msg.sender}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{msg.content}</p>
                    {msg.reactions && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {msg.reactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                            >
                              {reaction.emoji} {reaction.count}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                            👀 {Math.floor(Math.random() * 50) + 10}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                            💬 {Math.floor(Math.random() * 30) + 5}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                            😄 {Math.floor(Math.random() * 20) + 3}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 text-left">
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No trending messages yet</p>
          <p className="text-sm">
            Messages with high engagement will appear here
          </p>
        </div>
      )}
    </div>
  );
}
