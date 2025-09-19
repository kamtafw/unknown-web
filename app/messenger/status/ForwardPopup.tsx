"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";

interface Contact {
  id: number;
  name: string;
  number: string;
  avatar: string;
  selected: boolean;
}

interface ForwardPopupProps {
  onClose: () => void;
}

export function ForwardPopup({ onClose }: ForwardPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "John Smith",
      number: "+1 234 567 8901",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      number: "+1 234 567 8902",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 3,
      name: "Mike Brown",
      number: "+1 234 567 8903",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 4,
      name: "Emma Davis",
      number: "+1 234 567 8904",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 5,
      name: "David Wilson",
      number: "+1 234 567 8905",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 6,
      name: "Lisa Anderson",
      number: "+1 234 567 8906",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 7,
      name: "Chris Martinez",
      number: "+1 234 567 8907",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 8,
      name: "Anna Taylor",
      number: "+1 234 567 8908",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 9,
      name: "Robert Lee",
      number: "+1 234 567 8909",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 10,
      name: "Jennifer White",
      number: "+1 234 567 8910",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 11,
      name: "Mark Thompson",
      number: "+1 234 567 8911",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 12,
      name: "Amy Garcia",
      number: "+1 234 567 8912",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 13,
      name: "Kevin Rodriguez",
      number: "+1 234 567 8913",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 14,
      name: "Michelle Clark",
      number: "+1 234 567 8914",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
    {
      id: 15,
      name: "Daniel Lewis",
      number: "+1 234 567 8915",
      avatar: "/Rectangle 2.png",
      selected: false,
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const toggleContact = (id: number) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? { ...contact, selected: !contact.selected }
          : contact
      )
    );
  };

  const handleSelect = () => {
    const selectedContacts = contacts.filter((contact) => contact.selected);
    console.log("Selected contacts:", selectedContacts);
    onClose();
  };

  const selectedCount = contacts.filter((contact) => contact.selected).length;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-2xl w-96 max-h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900">Send to</h2>

          <button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => toggleContact(contact.id)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={contact.avatar}
                  alt={`${contact.name}'s avatar`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const initials = contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        ${initials}
                      </div>
                    `;
                  }}
                />
              </div>

              {/* Contact Info */}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-500">{contact.number}</div>
              </div>

              {/* Checkbox */}
              <div className="relative">
                <input
                  type="checkbox"
                  checked={contact.selected}
                  readOnly
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  title={`Select ${contact.name}`}
                  aria-label={`Select ${contact.name}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Select Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSelect}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedCount === 0}
          >
            Select {selectedCount > 0 ? `(${selectedCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
