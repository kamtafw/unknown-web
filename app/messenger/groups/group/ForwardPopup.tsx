"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  username?: string;
}

interface ForwardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForwardPopup({ isOpen, onClose }: ForwardPopupProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const contacts: Contact[] = [
    { id: "1", name: "Louigi dash", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "2", name: "Jane Cooper", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "3", name: "Brooklyn Simmons", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "4", name: "Darlene Robertson", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "5", name: "Kristin Watson", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "6", name: "Albert Flores", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "7", name: "Jacob Jones", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "8", name: "Jenny Wilson", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "9", name: "Ralph Edwards", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "10", name: "Cameron Williamson", phone: "+234 8123456789", avatar: "/Rectangle 3.png" },
    { id: "11", name: "@Cameron_Williamson", phone: "+234 8123456789", avatar: "/Rectangle 3.png", username: "@Cameron_Williamson" },
  ];

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSend = () => {
    console.log("Forwarding to:", selectedContacts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 ">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Forward message</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">All selected members will be added.</p>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => toggleContact(contact.id)}
              >
                <div>
                  <Image
                    src={contact.avatar || "/default-avatar.jpg"}
                    alt={contact.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="chat"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleSend}
            disabled={selectedContacts.length === 0}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}