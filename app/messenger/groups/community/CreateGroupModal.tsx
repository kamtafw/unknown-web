"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMembers: Contact[];
  onMemberRemove: (memberId: string) => void;
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

export function CreateGroupModal({
  isOpen,
  onClose,
  selectedMembers,
  onMemberRemove,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    editGroupSettings: false,
    sendMessages: true,
    addOtherMember: true,
    approveNewMembers: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGroupAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    onCreateGroup({
      name: groupName,
      avatar: groupAvatar || undefined,
      members: selectedMembers,
      settings,
    });
    
    // Reset form
    setGroupName("");
    setGroupAvatar(null);
    setSettings({
      editGroupSettings: false,
      sendMessages: true,
      addOtherMember: true,
      approveNewMembers: false,
    });
  };

  const settingsOptions = [
    {
      key: "editGroupSettings" as keyof typeof settings,
      label: "Edit group settings",
      description: "Only admins can edit group settings, description, and group picture",
    },
    {
      key: "sendMessages" as keyof typeof settings,
      label: "Send messages",
      description: "Only admins can send messages",
    },
    {
      key: "addOtherMember" as keyof typeof settings,
      label: "Add other member",
      description: "Only admins can add new members to this group",
    },
    {
      key: "approveNewMembers" as keyof typeof settings,
      label: "Approve new members",
      description: "New members need to be approved by an admin",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close modal"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">New Group</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Group Avatar and Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {groupAvatar ? (
                    <Image
                      src={groupAvatar}
                      alt="Group avatar"
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
                    title="Upload group avatar"
                    aria-label="Upload group avatar"
                  >
                    <Camera className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-500 focus:ring-0"
                    aria-label="Group name"
                  />
                </div>
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">
                    Selected Members ({selectedMembers.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <Image
                          src={member.avatar || "/default-avatar.jpg"}
                          alt={member.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>
                        <button
                          onClick={() => onMemberRemove(member.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          aria-label={`Remove ${member.name}`}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hierarchy Level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">
                  What hierarchy level do you want to give this group
                </h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Level 1</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Turn on Restriction */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Turn on restriction</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Object.values(settings).some(Boolean)}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setSettings({
                            editGroupSettings: false,
                            sendMessages: false,
                            addOtherMember: false,
                            approveNewMembers: false,
                          });
                        }
                      }}
                      className="sr-only peer"
                      aria-label="Turn on restriction"
                      title="Toggle group restrictions"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Turning on restrictions will restrict the members of this group from performing some actions.{" "}
                  <span className="text-blue-500">Learn more</span>
                </p>

                {/* Settings Options */}
                <div className="space-y-4">
                  {settingsOptions.map((option) => (
                    <div key={option.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={option.key}
                            checked={settings[option.key]}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                [option.key]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={option.key} className="text-sm font-medium">
                            {option.label}
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">
                        {option.description}
                      </p>
                      
                      {option.key === "sendMessages" && settings[option.key] && (
                        <div className="ml-6 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="callHigherGroup"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="callHigherGroup" className="text-sm">
                            Call a higher group
                          </label>
                          <button className="text-xs text-blue-500 ml-2">
                            See message
                          </button>
                        </div>
                      )}
                      
                      {option.key === "sendMessages" && settings[option.key] && (
                        <div className="ml-6 flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="videoCalls"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="videoCalls" className="text-sm">
                            Video calls
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className={`w-full py-3 rounded-full font-medium transition-colors ${
                groupName.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
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
        title="Upload group avatar"
        aria-label="Upload group avatar file"
      />
    </>
  );
}