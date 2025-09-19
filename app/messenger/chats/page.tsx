"use client";

import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatInterface } from "./ChatInterface";
import Image from "next/image";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);

  const handleChatSelect = (chatId: string, chatName: string, chatAvatar: string) => {
    setSelectedChat({ id: chatId, name: chatName, avatar: chatAvatar });
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Layout */}
      <div className="flex-1 lg:hidden">
        {selectedChat ? (
          <ChatInterface
            chatName={selectedChat.name}
            chatAvatar={selectedChat.avatar}
            onBack={handleBackToChats}
          />
        ) : (
          <ChatList onChatSelect={handleChatSelect} />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full h-full">
        {/* Left Sidebar - Chat List */}
        <div className="w-[480px] border-r bg-white flex flex-col overflow-y-auto">
          <ChatList onChatSelect={handleChatSelect} />
        </div>
        
        {/* Right Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatInterface
              chatName={selectedChat.name}
              chatAvatar={selectedChat.avatar}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Image
                src="/appcombo.svg" 
                alt="Logo"
                width={50}
                height={50}
                className="mb-4 object-contain"
              />
              <p className="text-lg text-gray-600">
                Send and receive messages with your laptop
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


