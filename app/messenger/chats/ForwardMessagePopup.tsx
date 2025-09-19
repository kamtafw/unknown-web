"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Check } from "lucide-react";
import Image from "next/image";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  selected: boolean;
}

interface ForwardMessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  messageToForward: string;
}

export function ForwardMessagePopup({ 
  isOpen, 
  onClose, 
  messageToForward 
}: ForwardMessagePopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Louigi dash",
      phone: "+234 8123456789",
      avatar: "/Rectangle5.png",
      selected: false
    },
    {
      id: "2",
      name: "Jane Cooper",
      phone: "+234 8101956789",
      avatar: "/Rectangle5.png",
      selected: true
    },
    {
      id: "3",
      name: "Brooklyn Simmons",
      phone: "+234 8101956789",
      avatar: "/Rectangle5.png",
      selected: true
    },
    {
      id: "4",
      name: "Kristin Watson",
      phone: "+234 8123456789",
      avatar: "/Rectangle5.png",
      selected: false
    },
    {
      id: "5",
      name: "Albert Flores",
      phone: "+234 8101956789",
      avatar: "/Rectangle5.png",
      selected: true
    },
    {
      id: "6",
      name: "Jacob Jones",
      phone: "+234 8123456789",
      avatar: "/Rectangle5.png",
      selected: false
    },
    {
      id: "7",
      name: "Jenny Wilson",
      phone: "+234 8101956789",
      avatar: "/Rectangle5.png",
      selected: false
    },
    {
      id: "8",
      name: "Ralph Edwards",
      phone: "+234 8123456789",
      avatar: "/Rectangle5.png",
      selected: false
    },
    {
      id: "9",
      name: "Cameron Williamson",
      phone: "+234 8101956789",
      avatar: "/Rectangle5.png",
      selected: true
    },
    {
      id: "10",
      name: "@Cameron_Williamson",
      phone: "+234 8123456789",
      avatar: "/Rectangle5.png",
      selected: false
    }
  ]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);

      setContacts(prev => prev.map(contact => ({ ...contact, selected: false })));
      setSearchQuery("");
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const toggleContactSelection = (contactId: string) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, selected: !contact.selected }
          : contact
      )
    );
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const selectedContacts = contacts.filter(contact => contact.selected);

  const handleSend = () => {
    if (selectedContacts.length > 0) {
      console.log('Forwarding message to:', selectedContacts.map(c => c.name));
      console.log('Message:', messageToForward);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Forward Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-[90vw] max-w-96 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Forward message</h3>
            <p className="text-sm text-gray-500">All selected members will be added</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Search className="h-7 w-7 text-black" />
          </Button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleContactSelection(contact.id)}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={contact.avatar}
                  alt={contact.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {contact.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {contact.phone}
                </p>
              </div>

              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                contact.selected 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {contact.selected && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSend}
            disabled={selectedContacts.length === 0}
          >
            Send ({selectedContacts.length})
          </Button>
        </div>
      </div>
    </>
  );
}