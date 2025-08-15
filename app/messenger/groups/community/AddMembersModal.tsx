"use client";

import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Member {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  selected?: boolean;
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedMembers: Member[]) => void;
}

const membersData: Member[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "2",
    name: "Jane Cooper",
    phone: "+234 8191568789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: "3",
    name: "Brooklyn Simmons",
    phone: "+234 8191568789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: "4",
    name: "Kristin Watson",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "5",
    name: "Albert Flores",
    phone: "+234 8191568789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: "6",
    name: "Jacob Jones",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "7",
    name: "Jenny Wilson",
    phone: "+234 8191568789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: "8",
    name: "Ralph Edwards",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "9",
    name: "Cameron Williamson",
    phone: "+234 8191568789",
    avatar: "/Rectangle5.png",
    selected: true,
  },
  {
    id: "10",
    name: "@Cameron_Williamson",
    phone: "+234 8123456789",
    avatar: "/Rectangle5.png",
  },
];

export function AddMembersModal({
  isOpen,
  onClose,
  onSubmit,
}: AddMembersModalProps) {
  const [members, setMembers] = useState<Member[]>(
    membersData.map((member) => ({
      ...member,
      selected: member.selected || false,
    }))
  );

  const toggleMemberSelection = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, selected: !member.selected }
          : member
      )
    );
  };

  const handleSubmit = () => {
    const selectedMembers = members.filter((member) => member.selected);
    onSubmit(selectedMembers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Add members</h2>
            <p className="text-sm text-gray-500">
              All selected members will be added to the call
            </p>
          </div>
          <Search className="h-7 w-7 text-black" />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
              onClick={() => toggleMemberSelection(member.id)}
            >
              <div className="relative">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">{member.phone}</p>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    member.selected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {member.selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="p-4">
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
