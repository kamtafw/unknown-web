"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ComposeMessagePopup } from "./ComposeMessagePopup";

const chats = [
  {
    id: "1",
    name: "Louigi Dash",
    avatar: "/Rectangle 3.png",
    number: "+1234567890",
  },
  {
    id: "2",
    name: "Cameron Williamson",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "3",
    name: "Robert Fox",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "4",
    name: "Marvin McKinney",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "5",
    name: "Darlene Robertson",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "6",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "7",
    name: "Arlene McCoy",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "8",
    name: "Jane Cooper",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "9",
    name: "Robert Kim",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "10",
    name: "Arlene Cane",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "11",
    name: "Wade Warren",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
  {
    id: "12",
    name: "Kristin Watson",
    avatar: "/Rectangle 3.png",
    number: "+1234567893",
  },
];

const groups = [
  {
    id: "1",
    name: "Dec Party",
    avatar: "/Rectangle 3.png",
  },
  {
    id: "2",
    name: "CSC101 Tutorials",
    hasGroupIcon: true,
  },
  {
    id: "3",
    name: "Programmer's Circuit",
    hasGroupIcon: true,
  },
  {
    id: "4",
    name: "Good",
    hasGroupIcon: true,
  },
];

interface AddMessageSchedulePopupProps {
  onClose: () => void;
}

export function AddMessageSchedulePopup({
  onClose,
}: AddMessageSchedulePopupProps) {
  const [activeTab, setActiveTab] = useState<"contacts" | "groups">("contacts");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showComposePopup, setShowComposePopup] = useState(false);

  const handleContactSelect = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedContacts.length > 0) {
      setShowComposePopup(true);
    }
  };

  if (showComposePopup) {
    return (
      <ComposeMessagePopup
        onClose={onClose}
        onBack={() => setShowComposePopup(false)}
        selectedContacts={selectedContacts}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Message Schedule</h2>
          </div>
          <Search className="h-5 w-5 text-black" />
        </div>

        {/* Contact count */}
        <div className="px-4 py-2 text-sm text-gray-600">
          {activeTab === "contacts" ? chats.length : groups.length} {activeTab}
        </div>

        {/* Tabs */}
        <div className="flex mx-4 mb-4 border rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors",
              activeTab === "contacts"
                ? "bg-white text-blue-500 shadow"
                : "text-gray-600"
            )}
          >
            Contacts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors",
              activeTab === "groups"
                ? "bg-white text-blue-500 shadow"
                : "text-gray-600"
            )}
          >
            Groups
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          {activeTab === "contacts" ? (
            <div className="space-y-3">
              {chats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 p-2">
                  <Image
                    src={chat.avatar || "/default-avatar.jpg"}
                    alt={chat.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{chat.name}</p>
                    <p className="text-sm text-gray-500">{chat.number}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(chat.id)}
                    onChange={() => handleContactSelect(chat.id)}
                    className="h-4 w-4 text-blue-500 rounded border-gray-300"
                    aria-label={`Select ${chat.name}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center gap-3 p-2">
                  {group.hasGroupIcon ? (
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">GR</span>
                    </div>
                  ) : (
                    <Image
                      src={group.avatar || "/default-avatar.jpg"}
                      alt={group.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{group.name}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(group.id)}
                    onChange={() => handleContactSelect(group.id)}
                    className="h-4 w-4 text-blue-500 rounded border-gray-300"
                    aria-label={`Select ${group.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="p-4 border-t">
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedContacts.length === 0}
            className={cn(
              "w-full py-3 rounded-full font-medium transition-colors",
              selectedContacts.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
