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

export function SpamTab({ onMessageRightClick, onViewAnalytics }: SpamTabProps) {
  const spamMessages: Message[] = [
    {
      id: "spam1",
      sender: "You",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
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

  const handleMessageRightClick = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    if (onMessageRightClick) {
      onMessageRightClick(e, messageId);
    }
  };

  const handleAnalyticsClick = (e: React.MouseEvent, msg: Message) => {
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
            <div
              className={`flex gap-2 ${
                msg.isYou ? "flex-row-reverse" : "items-start"
              }`}
            >
              {msg.avatar && !msg.isYou && (
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
                  className={`max-w-xs lg:max-w-md ${
                    msg.isYou
                      ? "bg-red-100 text-black border-l-4 border-red-400"
                      : "bg-red-50 text-gray-900 border-l-4 border-red-400"
                  } p-3 rounded-lg relative`}
                  onContextMenu={(e) => handleMessageRightClick(e, msg.id)}
                  onClick={(e) => handleAnalyticsClick(e, msg)}
                >
                  {/* Spam indicator */}
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                    SPAM {msg.spamScore}%
                  </div>

                  {!msg.isYou && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-red-700">
                        {msg.sender}
                      </span>
                    </div>
                  )}

                  <p className="text-sm mb-2">{msg.content}</p>

                  {/* Spam info */}
                  <div className="text-xs text-red-600 mb-2 bg-red-100 p-2 rounded">
                    <div className="font-medium">Flagged Reason: {msg.flaggedReason}</div>
                    <div>Flagged by {msg.flaggedBy?.length} users</div>
                  </div>

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

                <div
                  className={`text-xs text-gray-500 mt-1 flex items-center gap-2 ${
                    msg.isYou ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.time}</span>
                  {msg.isYou && (
                    <span className="text-red-500 font-bold">⚠️</span>
                  )}
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