"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, X, Smile } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface NewGroupSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedMembers: Contact[];
  onRemoveMember: (memberId: string) => void;
  onCreateGroup: (groupData: {
    name: string;
    avatar?: string;
    members: Contact[];
    settings: {
      editGroupSettings: boolean;
      sendMessages: boolean;
      addOtherMember: boolean;
      approveNewMembers: boolean;
    };
  }) => void;
}

const Switch = ({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      aria-label={checked ? "Enabled" : "Disabled"}
      title={checked ? "Enabled" : "Disabled"}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-500" : "bg-gray-200",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};

const EmojiPicker = ({
  isOpen,
  onClose,
  onSelectEmoji,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  position: { x: number; y: number };
}) => {
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯",
    "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐"
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      {/* Emoji picker */}
      <div
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 max-h-48 overflow-y-auto"
        style={{
          left: Math.min(position.x, window.innerWidth - 256),
          top: Math.max(position.y - 200, 10),
        }}
      >
        <div className="grid grid-cols-8 gap-2">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export function NewGroupSettings({
  isOpen,
  onBack,
  selectedMembers,
  onRemoveMember,
  onCreateGroup,
}: NewGroupSettingsProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [editGroupSettings, setEditGroupSettings] = useState(true);
  const [sendMessages, setSendMessages] = useState(true);
  const [addOtherMember, setAddOtherMember] = useState(true);
  const [approveNewMembers, setApproveNewMembers] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setGroupAvatar(null);
      setEditGroupSettings(true);
      setSendMessages(true);
      setAddOtherMember(true);
      setApproveNewMembers(true);
      setShowEmojiPicker(false);
      setEmojiPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setGroupAvatar(result);
        }
      };
      reader.onerror = () => {
        console.error('Failed to read file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEmojiPosition({
      x: rect.left,
      y: rect.top,
    });
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectEmoji = (emoji: string) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = groupName.slice(0, start) + emoji + groupName.slice(end);
      setGroupName(newValue);
      
    
      setTimeout(() => {
        input.focus();
        const newPosition = start + emoji.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      onCreateGroup({
        name: groupName,
        avatar: groupAvatar || undefined,
        members: selectedMembers,
        settings: {
          editGroupSettings,
          sendMessages,
          addOtherMember,
          approveNewMembers,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] h-[480px] rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <button onClick={onBack} title="Back" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">New Group</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Group Avatar and Name */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="relative h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={handleAvatarClick}
            >
              {groupAvatar ? (
                <Image
                  src={groupAvatar}
                  alt="Group avatar"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Camera className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-500"
              />
            </div>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
              aria-label="Add emoji"
              onClick={handleEmojiClick}
            >
              <Smile className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            title="Upload group avatar"
          />

          {/* Members */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">Members</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {selectedMembers.map((member) => (
                <div key={member.id} className="relative flex-shrink-0">
                  <div className="h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden relative">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="absolute top-0 right-0 h-5 w-5 bg-gray-600 rounded-full flex items-center justify-center z-10"
                    title="Remove member"
                    aria-label="Remove member"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  <p className="text-xs text-center mt-1 truncate w-14">
                    {member.name.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Member Permissions */}
          <div className="space-y-4 mb-6">
            <p className="text-sm font-medium text-gray-700">Members can</p>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Edit group settings</p>
                  <p className="text-xs text-gray-500">
                    This includes the name, icon, description, and the ability
                    to pin messages.
                  </p>
                </div>
                <Switch
                  checked={editGroupSettings}
                  onCheckedChange={setEditGroupSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send messages</p>
                <Switch
                  checked={sendMessages}
                  onCheckedChange={setSendMessages}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Add other member</p>
                <Switch
                  checked={addOtherMember}
                  onCheckedChange={setAddOtherMember}
                />
              </div>
            </div>
          </div>

          {/* Admin Permissions */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Admins can</p>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Approve new members</p>
                <p className="text-xs text-gray-500">
                  When turned on, admins must approve anyone who wants to join
                  the group.
                </p>
              </div>
              <Switch
                checked={approveNewMembers}
                onCheckedChange={setApproveNewMembers}
              />
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="p-4 border-t">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full"
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
          >
            Create group
          </Button>
        </div>
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={handleSelectEmoji}
        position={emojiPosition}
      />
    </div>
  );
}