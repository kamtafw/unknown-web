"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isYou?: boolean;
}

interface ReplyViewProps {
  message: Message;
  onClose: () => void;
}

export function ReplyView({ message, onClose }: ReplyViewProps) {
  return (
    <div className="bg-gray-100 border-t p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-12 bg-blue-500 rounded-full" />
            <div>
              <p className="text-sm font-medium text-blue-600">
                Replying to {message.isYou ? "You" : message.sender}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {message.content}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}