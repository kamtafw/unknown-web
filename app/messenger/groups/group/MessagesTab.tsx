"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    isImagePoll?: boolean;
  };
}

interface MessagesTabProps {
  onMessageRightClick: (e: React.MouseEvent, messageId: string) => void;
  onViewPoll: (message: Message) => void;
}

export function MessagesTab({
  onMessageRightClick,
  onViewPoll,
}: MessagesTabProps) {
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
        "/bottle.png",
        "/image.png",
        "/image.png",
        "/image.png",
        "/image.png",
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
            votes: 2,
            voters: ["user4", "user5"],
          },
        ],
        totalVotes: 5,
      },
    },
    {
      id: "6",
      sender: "Jacob Jones",
      content: "",
      time: "1 December 2024, 14:25",
      avatar: "/Rectangle 3.png",
      type: "poll",
      pollData: {
        question:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
        options: [
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user1", "user2", "user3"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user4", "user5"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user6", "user7"],
          },
        ],
        totalVotes: 69,
        isImagePoll: true,
      },
    },
    {
      id: "7",
      sender: "Jacob Jones",
      content: "",
      time: "1 December 2024, 14:25",
      avatar: "/Rectangle 3.png",
      type: "poll",
      pollData: {
        question:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
        options: [
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user1", "user2", "user3"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user4", "user5"],
          },
          {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
            votes: 23,
            voters: ["user6", "user7"],
          },
        ],
        totalVotes: 69,
        isImagePoll: true,
      },
    },
  ];

  const handleMessageRightClick = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    onMessageRightClick(e, messageId);
  };

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
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
                    ? "bg-gray-200 text-black"
                    : "bg-white text-gray-900"
                } p-3 rounded-lg`}
                onContextMenu={(e) => handleMessageRightClick(e, msg.id)}
              >
                {!msg.isYou && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">{msg.sender}</span>
                  </div>
                )}

                {msg.type === "image" && msg.images && (
                  <div className="mb-2">
                    <div className="flex gap-0.3">
                      {/* First big image on the left */}
                      <div className="relative">
                        <Image
                          src={msg.images[0]}
                          alt=""
                          width={140}
                          height={100}
                          className="rounded object-contain mr-1"
                        />
                      </div>

                      {/* Two smaller images stacked on the right */}
                      {msg.images.length > 1 && (
                        <div className="flex flex-col gap-1">
                          <div className="relative">
                            <Image
                              src={msg.images[1]}
                              alt=""
                              width={70}
                              height={70}
                              className="rounded object-contain "
                            />
                            {msg.images.length > 2 && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black bg-opacity-75 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  +{msg.images.length - 2}
                                </span>
                              </div>
                            )}
                          </div>
                          {msg.images.length > 2 && (
                            <div className="relative">
                              <Image
                                src={msg.images[2]}
                                alt=""
                                width={70}
                                height={70}
                                className="rounded object-cover "
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {msg.type === "poll" && msg.pollData && (
                  <div className="space-y-3">
                    {msg.pollData.isImagePoll && (
                      <div className="mb-3">
                        <div className="flex gap-0">
                          {/* First big image on the left */}
                          <div className="relative ">
                            <Image
                              src="/bottle.png"
                              alt=""
                              width={120}
                              height={100}
                              className="rounded object-contain mr-1"
                            />
                          </div>
                          {/* Four smaller images on the right */}
                          <div className="grid grid-cols-2 gap-0.5 ">
                            {[...Array(4)].map((_, idx) => (
                              <div key={idx} className="relative">
                                <Image
                                  src="/image.png"
                                  alt=""
                                  width={60}
                                  height={100}
                                  className="rounded object-contain "
                                />
                                {idx === 1 && (
                                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 bg-opacity-75 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      +3
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="font-medium">{msg.pollData.question}</p>
                    <div className="space-y-2">
                      {msg.pollData.options.map((option, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type={
                                msg.pollData!.isImagePoll ? "radio" : "checkbox"
                              }
                              name={
                                msg.pollData!.isImagePoll
                                  ? `poll-${msg.id}`
                                  : undefined
                              }
                              id={`poll-${msg.id}-option-${idx}`}
                              className={`w-4 h-4 ${
                                msg.pollData!.isImagePoll
                                  ? "text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-0"
                                  : "text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-0"
                              }`}
                              aria-label={`Poll option: ${option.text}`}
                            />
                            <label
                              htmlFor={`poll-${msg.id}-option-${idx}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {option.text}
                            </label>
                            <div className="flex gap-1 ml-auto">
                              {msg.id === "6" ? (
                                // For poll #6 specifically, show percentage and vote count
                                <span className="text-xs text-gray-500">
                                  {Math.round((option.votes / msg.pollData!.totalVotes) * 100)}% ({option.votes} Votes)
                                </span>
                              ) : (
                                // For all other polls, show voter avatars
                                <>
                                  <div className="flex -space-x-3">
                                    {option.voters
                                      .slice(0, 3)
                                      .map((voter, voterIdx) => (
                                        <div key={voterIdx} className="relative">
                                          <Image
                                            src="/Rectangle 2.png"
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="rounded-full border-2 border-white"
                                          />
                                          {voterIdx === 2 &&
                                            option.voters.length > 3 && (
                                              <span className="absolute -right-1 -top-1 text-xs font-bold">
                                                +
                                              </span>
                                            )}
                                        </div>
                                      ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {option.votes}+
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{
                                width: `${
                                  (option.votes / msg.pollData!.totalVotes) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPoll(msg)}
                      className="w-full"
                    >
                      View Votes
                    </Button>
                  </div>
                )}

                {msg.content && <p className="text-sm">{msg.content}</p>}

                {msg.reactions && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {msg.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          msg.isYou
                            ? "bg-blue-400 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`text-xs text-gray-500 mt-1 flex items-center gap-2 ${
                  msg.isYou ? "justify-end" : "justify-start"
                }`}
              >
                <span>{msg.time}</span>
                {msg.isYou && (
                  <span className="text-blue-500 font-bold">✓✓</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
