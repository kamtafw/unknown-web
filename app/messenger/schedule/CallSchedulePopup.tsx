"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";


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

interface CallSchedulePopupProps {
  onClose: () => void;
  onBack: () => void;
  callReason: string;
  scheduledDate: string;
  scheduledTime: string;
}

export function CallSchedulePopup({
  onClose,
//   onBack,
//   callReason,
  scheduledDate,
  scheduledTime,
}: CallSchedulePopupProps) {
  const [selectedContact, setSelectedContact] = useState<string>("");

  const handleContactSelect = (id: string) => {
    setSelectedContact(id);
  };

   const handleContinue = () => {
    if (selectedContact) {
      console.log("Call scheduled with:", selectedContact, "at", scheduledDate, scheduledTime);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Call schedule</h2>
          </div>
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Contact count */}
        <div className="px-4 py-2 text-sm text-gray-600">
          {chats.length} contacts
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-3">
            {chats.map((chat) => (
              <div key={chat.id} className="flex items-center gap-3 p-2">
                <Image
                  src={chat.avatar}
                  alt={chat.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{chat.name}</p>
                  <p className="text-sm text-gray-500">{chat.number}</p>
                </div>
                <div
                  onClick={() => handleContactSelect(chat.id)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 cursor-pointer transition-colors",
                    selectedContact === chat.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  )}
                >
                  {selectedContact === chat.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleContinue}
            disabled={!selectedContact}
            className={cn(
              "w-full py-3 rounded-full font-medium transition-colors",
              selectedContact
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
