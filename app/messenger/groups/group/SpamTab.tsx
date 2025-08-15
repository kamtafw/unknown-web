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
  spamScore?: number;
  flaggedBy?: string[];
  flaggedReason?: string;
}

interface SpamTabProps {
  onMessageRightClick?: (e: React.MouseEvent, messageId: string) => void;
  onViewAnalytics?: (message: Message) => void;
}

export function SpamTab({ onViewAnalytics }: SpamTabProps) {

  const spamMessages: Message[] = [
    {
      id: "spam1",
      sender: "Guys Name",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      time: "10:30",
      avatar: "/Rectangle 3.png",
      isYou: false,
      reactions: [
        { emoji: "😊", count: 12 },
        { emoji: "👍", count: 234 },
        { emoji: "❤️", count: 23 },
        { emoji: "👀", count: 86 },
        { emoji: "😂", count: 23 },
        { emoji: "😢", count: 23 },
      ],
      spamScore: 85,
      flaggedBy: ["user1", "user2", "user3"],
      flaggedReason: "Suspicious repeated content"
    },
    {
      id: "spam2",
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
      spamScore: 75,
      flaggedBy: ["user4", "user5"],
      flaggedReason: "Potential promotional content"
    },
  ];


  const handleMessageRightClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    if (onViewAnalytics) {
      onViewAnalytics(msg);
    }
  };

  return (
    <div className="space-y-4">
      {spamMessages.length > 0 ? (
        spamMessages.map((msg) => (
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
              {/* Show a default avatar for messages without one */}
              {!msg.avatar && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0 mt-0 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {msg.sender.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <div
                  className="max-w-xs lg:max-w-md bg-white text-black p-3 rounded-lg relative cursor-pointer"
                  onContextMenu={(e) => handleMessageRightClick(e, msg)}
                >
                  <div className="mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      {msg.sender}
                    </span>
                  </div>

                  <p className="text-sm mb-2">{msg.content}</p>

                  {msg.reactions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.reactions.map((reaction, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700"
                        >
                          {reaction.emoji} {reaction.count}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Additional metrics like your screenshot */}
                  <div className="flex gap-1 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                      👁️ 2k
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                      💬 500
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-600">
                      📊 2k
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 justify-start">
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No spam messages detected</p>
          <p className="text-sm">
            Messages flagged as spam will appear here
          </p>
        </div>
      )}
    </div>
  );
}