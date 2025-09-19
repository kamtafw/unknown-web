"use client";

import { useState } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isSelected: boolean;
}

interface ShareContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedContacts: Contact[]) => void;
}

const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "Louigi dash",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    isSelected: false,
  },
  {
    id: "2",
    name: "Jane Cooper",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
    isSelected: true,
  },
  {
    id: "3",
    name: "Brooklyn Simmons",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
    isSelected: true,
  },
  {
    id: "4",
    name: "Kristin Watson",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    isSelected: false,
  },
  {
    id: "5",
    name: "Albert Flores",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
    isSelected: true,
  },
  {
    id: "6",
    name: "Jacob Jones",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    isSelected: false,
  },
  {
    id: "7",
    name: "Jenny Wilson",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
    isSelected: true,
  },
  {
    id: "8",
    name: "Ralph Edwards",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    isSelected: false,
  },
  {
    id: "9",
    name: "Cameron Williamson",
    phone: "+234 8191956789",
    avatar: "/Rectangle 3.png",
    isSelected: true,
  },
  {
    id: "10",
    name: "@Cameron_Williamson",
    phone: "+234 8123456789",
    avatar: "/Rectangle 3.png",
    isSelected: false,
  },
];

export function ShareContactPopup({
  isOpen,
  onClose,
  onSubmit,
}: ShareContactPopupProps) {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const toggleContact = (contactId: string) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isSelected: !contact.isSelected }
          : contact
      )
    );
  };

  const handleSubmit = () => {
    const selectedContacts = contacts.filter(contact => contact.isSelected);
    onSubmit(selectedContacts);
    onClose();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-xl h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Send to</h2>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search contacts..."
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleContact(contact.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={contact.avatar}
                      alt={contact.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{contact.name}</h3>
                    <p className="text-xs text-gray-500">{contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      contact.isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {contact.isSelected && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}