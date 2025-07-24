"use client";

import {
  ChevronDown,
  Globe,
  Users,
  BadgeCheck,
  UserPlus,
  Hash,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReplyDropdownProps {
  reply: string;
  setReply: (value: string) => void;
}

export default function ReplyDropdown({ reply, setReply }: ReplyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: "Everyone", icon: Globe },
    { label: "Only followers", icon: Users },
    { label: "Accounts you follow", icon: UserPlus },
    { label: "Verified accounts", icon: BadgeCheck },
    { label: "Only accounts you mention", icon: Hash },
  ];

  const handleSelect = (value: string) => {
    setReply(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-600 mr-2" />
          <span className={cn(reply.length > 15 ? "text-sm" : "text-base")}>
            {reply}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>
      {isOpen && (
        <div className="absolute z-10 min-w-[350px] bg-white border border-gray-200 rounded-lg shadow-lg mt-1 right-0 sm:left-0">
          <div className="p-3">
            <h3 className="text-lg font-semibold">Who can reply</h3>
            <p className="text-sm text-gray-500">
              Pick who can reply to this post, keep in mind that anyone
              mentioned can always reply
            </p>
          </div>
          <div className="border-t border-gray-200">
            {options.map((option) => (
              <button
                key={option.label}
                className={cn(
                  "flex items-center w-full p-3 text-left hover:bg-gray-50",
                  reply === option.label && "bg-blue-50 text-blue-600"
                )}
                onClick={() => handleSelect(option.label)}
              >
                <option.icon className="h-5 w-5 mr-2" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
