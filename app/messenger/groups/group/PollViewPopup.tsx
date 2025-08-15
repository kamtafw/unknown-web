"use client";

import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PollOption {
  text: string;
  votes: number;
  voters: string[];
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  avatar?: string;
  pollData?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
  };
}

interface PollViewPopupProps {
  message: Message;
  onClose: () => void;
}

export function PollViewPopup({ message, onClose }: PollViewPopupProps) {
  if (!message.pollData) return null;

  const pollResults = [
    {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
      votes: 3,
      voters: [
        { name: "Me", date: "1 December 2024, 14:25", avatar: "/Rectangle 3.png" },
        { name: "Jacob Jones", date: "1 December 2024, 14:25", avatar: "/Rectangle 3.png" },
        { name: "Ronald Richards", date: "1 December 2024, 14:25", avatar: "/Rectangle 3.png" }
      ]
    },
    {
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod mod",
      votes: 3,
      voters: [
        { name: "Me", date: "1 December 2024, 14:25", avatar: "/Rectangle 3.png" },
        { name: "Jacob Jones", date: "1 December 2024, 14:25", avatar: "/Rectangle 3.png" },
        { name: "Ronald Richards", date: "1 December 2024, 14:35", avatar: "/Rectangle 3.png" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg sm:max-w-md w-full mx-4 h-[80vh] flex flex-col">
        <div className="p-4 pb-2 ">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Poll Vote/Anonymous</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {pollResults.map((result, index) => (
            <div key={index} className="mb-6">
              <div className="flex items-start gap-2 mb-3">
                <p className="text-sm text-gray-700 flex-1">{result.question}</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{result.votes} Votes</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>

              <div className="space-y-3">
                {result.voters.map((voter, voterIndex) => (
                  <div key={voterIndex} className="flex items-center gap-3">
                    <Image
                      src={voter.avatar}
                      alt={voter.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{voter.name}</p>
                      <p className="text-xs text-gray-500">{voter.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}