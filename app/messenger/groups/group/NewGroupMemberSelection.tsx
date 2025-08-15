"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
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

interface NewGroupMemberSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (selectedMembers: Contact[]) => void;
}

const Checkbox = ({
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
      tabIndex={0}
      aria-label={checked ? "Selected" : "Not selected"}
      title={checked ? "Selected" : "Not selected"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); 
        onCheckedChange(!checked);
      }}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        checked
          ? "bg-blue-500 border-blue-500 text-white"
          : "bg-white hover:border-blue-300",
        className
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  );
};

const contacts: Contact[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    phone: "+234 8121456789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "2",
    name: "Jane Cooper",
    phone: "+234 8181956789",
    avatar: "/Rectangle 4.png",
  },
  {
    id: "3",
    name: "Brooklyn Simmons",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
  },
  {
    id: "4",
    name: "Kristin Watson",
    phone: "+234 8121456789",
    avatar: "/Rectangle 1.png",
  },
  {
    id: "5",
    name: "Albert Flores",
    phone: "+234 8161956789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "6",
    name: "Jacob Jones",
    phone: "+234 8121456789",
    avatar: "/Rectangle 2.png",
  },
  {
    id: "7",
    name: "Jenny Wilson",
    phone: "+234 8181956789",
   avatar: "/Rectangle 3.png",
  },
  {
    id: "8",
    name: "Ralph Edwards",
    phone: "+234 8121456789",
    avatar: "/Rectangle 1.png",
  },
  {
    id: "9",
    name: "Cameron Williamson",
    phone: "+234 8181956789",
    avatar: "/Rectangle 4.png",
  },
];

export function NewGroupMemberSelection({
  isOpen,
  onClose,
  onNext,
}: NewGroupMemberSelectionProps) {
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMembers([]);
      setSearchTerm("");
      setShowSearch(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  const handleMemberToggle = (contact: Contact) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((member) => member.id === contact.id);
      if (isSelected) {
        return prev.filter((member) => member.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleNext = () => {
    if (selectedMembers.length > 0) {
      onNext(selectedMembers);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchTerm(""); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] h-[580px] rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} title="Go back" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="font-semibold">New Group</h2>
              <p className="text-sm text-gray-500">Add group</p>
            </div>
          </div>
          <button 
            onClick={toggleSearch}
            title="Search contacts"
            aria-label="Search contacts"
            className="hover:bg-gray-100 p-1 rounded"
          >
            <Search className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar - Only show when showSearch is true */}
        {showSearch && (
          <div className="p-4 border-b">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        )}

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const isSelected = selectedMembers.some(
              (member) => member.id === contact.id
            );
            return (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleMemberToggle(contact)}
              >
                <div className="relative">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {contact.avatar ? (
                      <Image
                        src={contact.avatar}
                        alt={contact.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.phone}</p>
                </div>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleMemberToggle(contact)}
                  className="h-5 w-5"
                />
              </div>
            );
          })}
        </div>

        {/* Select Button */}
        <div className="p-4 border-t">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full"
            onClick={handleNext}
            disabled={selectedMembers.length === 0}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
