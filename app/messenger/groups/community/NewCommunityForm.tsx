"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Image from "next/image";

interface NewCommunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onCreateCommunity: (communityData: {
    name: string;
    description: string;
    avatar?: string;
  }) => void;
}

export function NewCommunityForm({
  isOpen,
  onBack,
  onCreateCommunity,
}: NewCommunityFormProps) {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nost"
  );
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common emoji list
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "💖",
    "💕",
    "💯",
    "🔥",
    "✨",
    "🎉",
    "🎊",
    "👍",
    "👎",
    "👏",
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string, target: "name" | "description") => {
    if (target === "name") {
      setCommunityName((prev) => prev + emoji);
    } else {
      if (description.length < 100) {
        setDescription((prev) => prev + emoji);
      }
    }
  };

  const handleCreateCommunity = () => {
    // Call the onCreateCommunity function with the form data
    onCreateCommunity({
      name: communityName,
      description: description,
      avatar: avatar || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md h-full max-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <button onClick={onBack} className="p-1" aria-label="Back">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold">New Community</h2>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Community Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Community avatar"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  title="Upload community avatar"
                  aria-label="Upload community avatar"
                >
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                </button>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Community name"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-500 focus:ring-0"
                  aria-label="Community name"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-2"
                    title="Add emoji to community name"
                    aria-label="Add emoji to community name"
                  >
                    <Smile className="h-6 w-6 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="grid grid-cols-10 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji, "name")}
                        className="p-2 hover:bg-gray-100 rounded text-lg"
                        title={`Add ${emoji} emoji`}
                        aria-label={`Add ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 p-3 pr-10 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  placeholder="Enter community description..."
                  aria-label="Community description"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="absolute bottom-3 right-3"
                      title="Add emoji to description"
                      aria-label="Add emoji to description"
                    >
                      <Smile className="h-5 w-5 text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="grid grid-cols-10 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleEmojiSelect(emoji, "description")
                          }
                          className="p-2 hover:bg-gray-100 rounded text-lg"
                          title={`Add ${emoji} emoji`}
                          aria-label={`Add ${emoji} emoji`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">
                {description.length}/100
              </div>
            </div>
          </div>

          {/* Create Community Button */}
          <div className="p-6">
            <Button
              onClick={handleCreateCommunity}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full"
            >
              Create community
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        title="Upload community avatar"
        aria-label="Upload community avatar file"
      />
    </>
  );
}
