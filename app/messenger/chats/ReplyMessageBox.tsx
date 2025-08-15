"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface ReplyMessageBoxProps {
  isVisible: boolean;
  replyToMessage: string;
  senderName: string;
  onClose: () => void;
}

export function ReplyMessageBox({
  isVisible,
  replyToMessage,
  senderName,
  onClose,
}: ReplyMessageBoxProps) {
  if (!isVisible) return null;

  const truncatedMessage =
    replyToMessage.length > 50
      ? replyToMessage.substring(0, 50) + "..."
      : replyToMessage;

  return (
    <div className="ml-30 bg-blue-50 border-l-1 rounded-l-lg border-blue-500 p-3 mx-2 mb-2 rounded-r-lg ">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-600 mb-1">
            Replying to {senderName}
          </p>
          <p className="text-sm text-gray-600 leading-tight">
            {truncatedMessage}
          </p>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mr-2">
            <Image
              src="/reply.png"
              alt="Reply icon"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 ml-2 hover:bg-blue-100 w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center"
            onClick={onClose}
          >
            <X className="h-3 w-3 text-blue-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
