"use client";

import { ArrowLeft, Check } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import Image from "next/image";

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
}

interface AddMemberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAddMembers?: (selectedContacts: Contact[]) => void;
}

export function AddMemberPopup({
  isOpen,
  onClose,
  onBack,
  onAddMembers,
}: AddMemberPopupProps) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const contacts: Contact[] = [
    {
      id: 1,
      name: "Cameron Williamson",
      phone: "+234 8123456789",
      avatar: "/Rectangle 2.png",
    },
    {
      id: 2,
      name: "Jenny Wilson",
      phone: "+234 8134567890",
      avatar: "/Rectangle 1.png",
    },
    {
      id: 3,
      name: "Wade Warren",
      phone: "+234 8145678901",
      avatar: "/Rectangle 3.png",
    },
    {
      id: 4,
      name: "Esther Howard",
      phone: "+234 8156789012",
      avatar: "/Rectangle 4.png",
    },
    {
      id: 5,
      name: "Robert Fox",
      phone: "+234 8167890123",
      avatar: "/Rectangle5.png",
    },
    {
      id: 6,
      name: "Jacob Jones",
      phone: "+234 8178901234",
      avatar: "/Rectangle 1.png",
    },
    {
      id: 7,
      name: "Courtney Henry",
      phone: "+234 8189012345",
      avatar: "/Rectangle 2.png",
    },
    {
      id: 8,
      name: "Darrell Steward",
      phone: "+234 8190123456",
      avatar: "/Rectangle5.png",
    },
    {
      id: 9,
      name: "Savannah Nguyen",
      phone: "+234 8101234567",
      avatar: "/Rectangle 3.png",
    },
    {
      id: 10,
      name: "Brooklyn Simmons",
      phone: "+234 8112345678",
      avatar: "/Rectangle 4.png",
    },
    {
      id: 11,
      name: "Cody Fisher",
      phone: "+234 8123456780",
      avatar: "/Rectangle 2.png",
    },
    {
      id: 12,
      name: "Arlene McCoy",
      phone: "+234 8134567891",
      avatar: "/Rectangle 1.png",
    },
  ];

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts((prev) => {
      const isSelected = prev.some((c) => c.id === contact.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };


  const isContactSelected = (contactId: number) => {
    return selectedContacts.some((c) => c.id === contactId);
  };

  const handleAddMembers = () => {
    if (selectedContacts.length === 0) return;

    onAddMembers?.(selectedContacts);
    setSelectedContacts([]);
    setSearchTerm("");
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-[400px] max-h-[500px] flex flex-col mx-4 my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Add Members
                </h2>
                <div>All members are able to add others to this group. Edit group permission</div>
              </div>
               <IoSearch className="h-7 w-7 text-black " />
            </div>
            <div className="">
             
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => toggleContactSelection(contact)}
                >
                  <Image
                    src={contact.avatar}
                    alt={contact.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  </div>
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                      isContactSelected(contact.id)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {isContactSelected(contact.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          {selectedContacts.length > 0 && (
            <div className="p-6 bg-white border-t">
              <button
                onClick={handleAddMembers}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedContacts.length === 0}
              >
                Select 
              </button>
            </div>
          )}
        </div>
      </div>
  );
}