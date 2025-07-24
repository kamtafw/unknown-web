"use client";

import { ArrowLeft, Search, Menu } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface OnlyShareWithStatusPageProps {
  onBack: () => void;
  onUpdateText: (count: number) => void;
  initialCount: number;
  setIncludedCount: (count: number) => void;
}

export default function OnlyShareWithStatusPage({
  onBack,
  onUpdateText,
  initialCount,
  setIncludedCount,
}: OnlyShareWithStatusPageProps) {
  const contacts = [
    {
      id: 1,
      username: "@Cameron_Williamson",
      phone: "+234 8123456789",
      image: "profilepic.jpg",
    },
    {
      id: 2,
      username: "@Lucas_jigsu",
      phone: "+234 8181956789",
      image: "friend.png",
    },
    {
      id: 3,
      username: "@John_Doe",
      phone: "+234 8134567890",
      image: "Rectangle 3.png",
    },
    {
      id: 4,
      username: "@Jane_Smith",
      phone: "+234 8145678901",
      image: "Rectangle 4.png",
    },
    {
      id: 5,
      username: "@Mike_Johnson",
      phone: "+234 8156789012",
      image: "Rectangle 2.png",
    },
    {
      id: 6,
      username: "@Sarah_Brown",
      phone: "+234 8167890123",
      image: "friend.png",
    },
    {
      id: 7,
      username: "@David_Wilson",
      phone: "+234 8178901234",
      image: "Rectangle 1.png",
    },
    {
      id: 8,
      username: "@Emily_Davis",
      phone: "+234 8189012345",
      image: "profilepic.jpg",
    },
    {
      id: 9,
      username: "@Chris_Lee",
      phone: "+234 8190123456",
      image: "profilepic.jpg",
    },
  ];

  const [selectedContacts, setSelectedContacts] = useState<number[]>(
    initialCount > 0 ? contacts.slice(0, initialCount).map(c => c.id) : []
  );

  const handleToggleSelect = (id: number) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === contacts.length
        ? []
        : contacts.map((c) => c.id)
    );
  };

  const handleSave = () => {
    const count = selectedContacts.length;
    setIncludedCount(count);
    onUpdateText(count);
    onBack();
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to Status"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Only Share With</h1>
                <p className="text-[14px] text-gray-500">
                  {selectedContacts.length} contacts included
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search size={20} className="text-gray-500" />
              <button
                onClick={handleSelectAll}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Select all contacts"
                aria-label="Select all contacts"
              >
                <Menu size={25} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 lg:py-2 space-y-5 lg:space-y-3">
          {contacts.map((contact) => {
            const checkboxId = `contact-checkbox-${contact.id}`;
            return (
              <div
                key={contact.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={`/${contact.image}`}
                        alt={contact.username}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[16px] text-black">{contact.username}</p>
                    <p className="text-[14px] text-gray-500">{contact.phone}</p>
                  </div>
                </div>
                <div>
                  <label htmlFor={checkboxId} className="sr-only">
                    Select {contact.username}
                  </label>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleToggleSelect(contact.id)}
                    className="w-5 h-5"
                    title={`Select ${contact.username}`}
                  />
                </div>
              </div>
            );
          })}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-2 rounded-full mt-8 lg:mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}